package com.gccloud.gcpaas.dataroom.core.security;

import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.exception.IllegalOutboundDestinationException;
import com.google.common.net.InetAddresses;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import java.net.Inet6Address;
import java.net.InetAddress;
import java.net.URI;
import java.net.URISyntaxException;
import java.net.UnknownHostException;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.regex.PatternSyntaxException;

@Slf4j
@Service
public class OutboundUrlSecurityService {

    @Resource
    private DataRoomConfig dataRoomConfig;

    private static final String REGEX_PREFIX = "regex:";

    private List<Pattern> internalTargetPatterns = List.of();

    public OutboundUrlSecurityService() {
    }

    public OutboundUrlSecurityService(DataRoomConfig dataRoomConfig) {
        this.dataRoomConfig = dataRoomConfig;
        initializePatterns();
    }

    @PostConstruct
    private void initializePatterns() {
        List<Pattern> patterns = new ArrayList<>();
        for (String target : configuredTargets()) {
            if (StringUtils.isBlank(target) || !target.trim().startsWith(REGEX_PREFIX)) {
                continue;
            }
            String expression = target.trim().substring(REGEX_PREFIX.length());
            if (StringUtils.isBlank(expression)) {
                throw new IllegalArgumentException("dataroom.outboundHttp.allowedInternalTargets 的 regex: 表达式不能为空");
            }
            try {
                patterns.add(Pattern.compile(expression));
            } catch (PatternSyntaxException e) {
                log.error(ExceptionUtils.getStackTrace(e));
                throw new IllegalArgumentException("dataroom.outboundHttp.allowedInternalTargets 包含非法正则表达式", e);
            }
        }
        internalTargetPatterns = List.copyOf(patterns);
    }

    private List<String> configuredTargets() {
        if (dataRoomConfig == null || dataRoomConfig.getOutboundHttp() == null
                || dataRoomConfig.getOutboundHttp().getAllowedInternalTargets() == null) {
            return List.of();
        }
        return dataRoomConfig.getOutboundHttp().getAllowedInternalTargets();
    }

    public String validateAndResolve(String url, Set<String> allowedSchemes) {
        if (StringUtils.isBlank(url)) {
            throw reject("目的地址为空，禁止访问");
        }
        try {
            URI uri = new URI(url);
            String scheme = normalizeScheme(uri.getScheme());
            String host = normalizeHost(uri.getHost());
            if (!normalizeSchemes(allowedSchemes).contains(scheme)) {
                throw reject("目的地址使用未允许的协议 " + scheme + "，禁止访问");
            }
            if (StringUtils.isBlank(host)) {
                throw reject("目的地址缺少有效主机名，禁止访问");
            }
            if (uri.getRawUserInfo() != null) {
                throw reject(host + " 地址包含用户认证信息，禁止访问");
            }
            int port = resolvePort(uri, scheme);
            InetAddress[] addresses = resolveAddresses(host);
            if (addresses.length == 0) {
                throw reject(host + " 主机未解析到任何 IP 地址，禁止访问");
            }
            boolean allowedInternalTarget = isAllowedInternalTarget(host, port);
            for (InetAddress address : addresses) {
                String unsafeReason = unsafeReason(address);
                // IP 正则只授权当前地址，不能因某个解析结果命中而放行其他受限 IP。
                if (unsafeReason != null && !allowedInternalTarget
                        && !matchesInternalPattern(InetAddresses.toAddrString(address), port)) {
                    throw reject(buildUnsafeDestinationMessage(host, port, address, unsafeReason));
                }
            }
            return url;
        } catch (URISyntaxException | UnknownHostException e) {
            String reason = e instanceof UnknownHostException ? "目的主机 DNS 解析失败" : "目的地址 URL 格式非法";
            String message = reason + "，禁止访问";
            log.error("{}: {}", message, ExceptionUtils.getStackTrace(e));
            throw illegalDestination(message);
        }
    }

    private Set<String> normalizeSchemes(Set<String> allowedSchemes) {
        if (allowedSchemes == null) {
            return Set.of();
        }
        return allowedSchemes.stream()
                .filter(StringUtils::isNotBlank)
                .map(this::normalizeScheme)
                .collect(java.util.stream.Collectors.toUnmodifiableSet());
    }

    private String normalizeScheme(String scheme) {
        return StringUtils.defaultString(scheme).toLowerCase(Locale.ROOT);
    }

    private String normalizeHost(String host) {
        String normalized = StringUtils.defaultString(host).toLowerCase(Locale.ROOT);
        normalized = StringUtils.removeEnd(normalized, ".");
        if (normalized.startsWith("[") && normalized.endsWith("]")) {
            normalized = normalized.substring(1, normalized.length() - 1);
        }
        if (InetAddresses.isInetAddress(normalized)) {
            return InetAddresses.toAddrString(InetAddresses.forString(normalized));
        }
        return normalized;
    }

    private int resolvePort(URI uri, String scheme) {
        int port = uri.getPort();
        if (port == -1) {
            port = switch (scheme) {
                case "http", "ws" -> 80;
                case "https", "wss" -> 443;
                default -> -1;
            };
        }
        if (port < 1 || port > 65535) {
            throw reject(formatHostPort(normalizeHost(uri.getHost()), port) + " 地址使用非法端口，禁止访问");
        }
        return port;
    }

    protected InetAddress[] resolveAddresses(String host) throws UnknownHostException {
        return InetAddress.getAllByName(host);
    }

    private boolean isAllowedInternalTarget(String host, int port) {
        for (String target : configuredTargets()) {
            if (StringUtils.isNotBlank(target) && !target.trim().startsWith(REGEX_PREFIX)
                    && matchesTarget(target, host, port)) {
                return true;
            }
        }
        return matchesInternalPattern(host, port);
    }

    private boolean matchesInternalPattern(String host, int port) {
        String target = formatHostPort(host, port);
        return internalTargetPatterns.stream().anyMatch(pattern -> pattern.matcher(target).matches());
    }

    private boolean matchesTarget(String target, String host, int port) {
        if (StringUtils.isBlank(target)) {
            return false;
        }
        try {
            URI targetUri = new URI("http://" + target.trim());
            return targetUri.getRawUserInfo() == null
                    && normalizeHost(targetUri.getHost()).equals(host)
                    && targetUri.getPort() == port;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return false;
        }
    }

    private String unsafeReason(InetAddress address) {
        if (address.isAnyLocalAddress()) {
            return "未指定地址";
        }
        if (address.isLoopbackAddress()) {
            return "回环地址";
        }
        if (address.isLinkLocalAddress()) {
            return "链路本地地址";
        }
        if (address.isSiteLocalAddress()) {
            return "私网地址";
        }
        if (address.isMulticastAddress()) {
            return "组播地址";
        }
        if (isIpv4SpecialAddress(address)) {
            return "保留或特殊用途地址";
        }
        if (isIpv6UniqueLocalAddress(address)) {
            return "IPv6 唯一本地地址";
        }
        return null;
    }

    private boolean isIpv4SpecialAddress(InetAddress address) {
        byte[] bytes = address.getAddress();
        if (bytes.length != 4) {
            return false;
        }
        int value = ((bytes[0] & 0xff) << 24)
                | ((bytes[1] & 0xff) << 16)
                | ((bytes[2] & 0xff) << 8)
                | (bytes[3] & 0xff);
        return matchesCidr(value, 0x00000000, 8)
                || matchesCidr(value, 0x64400000, 10)
                || matchesCidr(value, 0xc0000000, 24)
                || matchesCidr(value, 0xc0000200, 24)
                || matchesCidr(value, 0xc6120000, 15)
                || matchesCidr(value, 0xc6336400, 24)
                || matchesCidr(value, 0xcb007100, 24)
                || matchesCidr(value, 0xf0000000, 4);
    }

    private boolean matchesCidr(int value, int network, int prefixLength) {
        int mask = prefixLength == 0 ? 0 : -1 << (32 - prefixLength);
        return (value & mask) == (network & mask);
    }

    private boolean isIpv6UniqueLocalAddress(InetAddress address) {
        if (!(address instanceof Inet6Address)) {
            return false;
        }
        byte firstByte = address.getAddress()[0];
        return (firstByte & 0xfe) == 0xfc;
    }

    private String buildUnsafeDestinationMessage(String host, int port, InetAddress address, String unsafeReason) {
        String resolvedTarget = formatHostPort(address.getHostAddress(), port);
        if (InetAddresses.isInetAddress(host)) {
            return formatHostPort(host, port) + " 地址属于" + unsafeReason + "，禁止访问";
        }
        return formatHostPort(host, port)
                + " 解析为 " + resolvedTarget
                + "，IP 地址属于" + unsafeReason
                + "，禁止访问";
    }

    private String formatHostPort(String host, int port) {
        String formattedHost = StringUtils.contains(host, ':') ? "[" + host + "]" : host;
        return formattedHost + ":" + port;
    }

    private IllegalOutboundDestinationException reject(String message) {
        log.error(message);
        return illegalDestination(message);
    }

    private IllegalOutboundDestinationException illegalDestination(String message) {
        return new IllegalOutboundDestinationException(message);
    }
}
