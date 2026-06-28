package com.gccloud.gcpaas.dataroom.core.page.service;

import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.regex.Pattern;

@Slf4j
@Service
public class ClientAccessService {

    private static final Pattern IPV4_PATTERN = Pattern.compile("\\d{1,3}(\\.\\d{1,3}){3}");
    private static final Pattern IPV6_CHARS_PATTERN = Pattern.compile("[0-9A-Fa-f:.]+");

    public String resolveClientIp(HttpServletRequest request) {
        if (request == null) {
            return "";
        }
        String forwardedFor = request.getHeader("X-Forwarded-For");
        if (StringUtils.isNotBlank(forwardedFor)) {
            return forwardedFor.split(",")[0].trim();
        }
        String realIp = request.getHeader("X-Real-IP");
        if (StringUtils.isNotBlank(realIp)) {
            return realIp.trim();
        }
        return StringUtils.trimToEmpty(request.getRemoteAddr());
    }

    public void validateWhitelist(String whitelist) {
        if (StringUtils.isBlank(whitelist)) {
            return;
        }
        String[] rules = whitelist.split("\\R", -1);
        for (int i = 0; i < rules.length; i++) {
            String rule = rules[i].trim();
            if (StringUtils.isBlank(rule)) {
                continue;
            }
            if (!isValidRule(rule)) {
                throw new DataRoomException("IP 白名单第 " + (i + 1) + " 行格式错误");
            }
        }
    }

    public boolean matchesWhitelist(String clientIp, String whitelist) {
        if (StringUtils.isBlank(whitelist)) {
            return true;
        }
        InetAddress clientAddress = parseAddress(clientIp);
        if (clientAddress == null) {
            return false;
        }
        String[] rules = whitelist.split("\\R", -1);
        for (String rule : rules) {
            String trimmedRule = rule.trim();
            if (StringUtils.isBlank(trimmedRule)) {
                continue;
            }
            if (matchesRule(clientAddress, trimmedRule)) {
                return true;
            }
        }
        return false;
    }

    private boolean isValidRule(String rule) {
        if (!rule.contains("/")) {
            return parseAddress(rule) != null;
        }
        String[] parts = rule.split("/", -1);
        if (parts.length != 2) {
            return false;
        }
        InetAddress address = parseAddress(parts[0]);
        if (address == null || !StringUtils.isNumeric(parts[1])) {
            return false;
        }
        int prefixLength = Integer.parseInt(parts[1]);
        int maxPrefixLength = address.getAddress().length * 8;
        return prefixLength >= 0 && prefixLength <= maxPrefixLength;
    }

    private boolean matchesRule(InetAddress clientAddress, String rule) {
        if (!rule.contains("/")) {
            InetAddress ruleAddress = parseAddress(rule);
            return ruleAddress != null && clientAddress.equals(ruleAddress);
        }
        String[] parts = rule.split("/", -1);
        InetAddress networkAddress = parseAddress(parts[0]);
        if (networkAddress == null || networkAddress.getAddress().length != clientAddress.getAddress().length) {
            return false;
        }
        int prefixLength = Integer.parseInt(parts[1]);
        return matchesCidr(clientAddress.getAddress(), networkAddress.getAddress(), prefixLength);
    }

    private boolean matchesCidr(byte[] clientBytes, byte[] networkBytes, int prefixLength) {
        int fullBytes = prefixLength / 8;
        int remainingBits = prefixLength % 8;
        for (int i = 0; i < fullBytes; i++) {
            if (clientBytes[i] != networkBytes[i]) {
                return false;
            }
        }
        if (remainingBits == 0) {
            return true;
        }
        int mask = 0xFF << (8 - remainingBits);
        return (clientBytes[fullBytes] & mask) == (networkBytes[fullBytes] & mask);
    }

    private InetAddress parseAddress(String address) {
        if (StringUtils.isBlank(address)) {
            return null;
        }
        String trimmedAddress = address.trim();
        if (!isIpLiteral(trimmedAddress)) {
            return null;
        }
        try {
            return InetAddress.getByName(trimmedAddress);
        } catch (UnknownHostException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return null;
        }
    }

    private boolean isIpLiteral(String address) {
        if (address.contains(":")) {
            return IPV6_CHARS_PATTERN.matcher(address).matches();
        }
        if (!IPV4_PATTERN.matcher(address).matches()) {
            return false;
        }
        String[] parts = address.split("\\.");
        for (String part : parts) {
            int value = Integer.parseInt(part);
            if (value < 0 || value > 255) {
                return false;
            }
        }
        return true;
    }
}
