package com.gccloud.gcpaas.core.security;

import ch.qos.logback.classic.Logger;
import ch.qos.logback.classic.spi.ILoggingEvent;
import ch.qos.logback.core.read.ListAppender;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.config.bean.OutboundHttp;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.security.OutboundUrlSecurityService;
import org.junit.jupiter.api.Test;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

import java.net.InetAddress;
import java.util.List;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OutboundUrlSecurityServiceTest {

    @Test
    void returnsOriginalPublicUrlWhenDestinationIsSafe() {
        OutboundUrlSecurityService service = service(List.of());
        String url = "https://8.8.8.8/dns-query?name=example.com";

        assertEquals(url, service.validateAndResolve(url, Set.of("http", "https")));
        assertEquals("wss://8.8.8.8/socket",
                service.validateAndResolve("wss://8.8.8.8/socket", Set.of("ws", "wss")));
    }

    @Test
    void rejectsSchemeOutsideCallerAllowlist() {
        OutboundUrlSecurityService service = service(List.of());

        DataRoomException exception = assertThrows(DataRoomException.class,
                () -> service.validateAndResolve("ws://8.8.8.8/socket", Set.of("http", "https")));

        assertEquals("目的地址使用未允许的协议 ws，禁止访问", exception.getMessage());
    }

    @Test
    void rejectsLoopbackPrivateAndLinkLocalDestinations() {
        OutboundUrlSecurityService service = service(List.of());

        assertIllegal(service, "http://127.0.0.1:8080/actuator");
        assertIllegal(service, "http://localhost:8080/actuator");
        assertIllegal(service, "http://10.0.0.1/internal");
        assertIllegal(service, "http://169.254.169.254/latest/meta-data");
        assertIllegal(service, "http://[::1]/internal");
        assertIllegal(service, "http://[fc00::1]/internal");
    }

    @Test
    void logsSpecificReasonWhenLoopbackDestinationIsRejected() {
        OutboundUrlSecurityService service = service(List.of());
        Logger logger = (Logger) LoggerFactory.getLogger(OutboundUrlSecurityService.class);
        ListAppender<ILoggingEvent> appender = new ListAppender<>();
        appender.start();
        logger.addAppender(appender);
        try {
            DataRoomException exception = assertThrows(DataRoomException.class,
                    () -> service.validateAndResolve("http://127.0.0.1:8080/internal", Set.of("http", "https")));

            assertEquals("127.0.0.1:8080 地址属于回环地址，禁止访问", exception.getMessage());
            assertTrue(appender.list.stream()
                    .map(ILoggingEvent::getFormattedMessage)
                    .anyMatch(message -> message.contains("127.0.0.1:8080 地址属于回环地址，禁止访问")));
        } finally {
            logger.detachAppender(appender);
            appender.stop();
        }
    }

    @Test
    void formatsIpv6DestinationForDirectWhitelistUse() {
        OutboundUrlSecurityService service = service(List.of());

        DataRoomException exception = assertThrows(DataRoomException.class,
                () -> service.validateAndResolve("http://[::1]/internal", Set.of("http", "https")));

        assertEquals("[::1]:80 地址属于回环地址，禁止访问", exception.getMessage());
    }

    @Test
    void allowsOnlyExactConfiguredInternalHostAndPort() {
        OutboundUrlSecurityService service = service(List.of("127.0.0.1:9200"));
        String allowedUrl = "http://127.0.0.1:9200/orders/_search";

        assertEquals(allowedUrl, service.validateAndResolve(allowedUrl, Set.of("http", "https")));
        assertIllegal(service, "http://127.0.0.1:8080/actuator");
    }

    @Test
    void rejectsUrlWithEmbeddedUserInformation() {
        OutboundUrlSecurityService service = service(List.of());

        assertIllegal(service, "http://user:password@8.8.8.8/data");
    }

    @Test
    void supportsRegexSubnetAndMultiplePortsAlongsideExactRules() {
        OutboundUrlSecurityService service = service(List.of("127.0.0.1:9200",
                "regex:^192\\.168\\.1\\.\\d{1,3}:(8080|9200)$"));

        for (String url : List.of("http://127.0.0.1:9200/data", "http://192.168.1.10:8080/data",
                "http://192.168.1.255:9200/data")) {
            assertEquals(url, service.validateAndResolve(url, Set.of("http", "https")));
        }
        assertIllegal(service, "http://192.168.2.10:8080/data");
        assertIllegal(service, "http://192.168.1.10:8081/data");
        assertIllegal(service, "http://192.168.1.10/data");
        assertIllegal(service, "http://169.254.169.254/latest/meta-data");
    }

    @Test
    void usesFullMatchEvenWithoutAnchorsAndNeverMatchesPath() {
        OutboundUrlSecurityService service = service(List.of("regex:127\\.0\\.0\\.1:80"));
        assertEquals("http://127.0.0.1/data", service.validateAndResolve("http://127.0.0.1/data", Set.of("http")));
        assertIllegal(service, "http://127.0.0.1:8080/data");
        assertIllegal(service, "http://127.0.0.11:80/data");
        assertIllegal(service, "http://10.0.0.1/path/127.0.0.1:80");
    }

    @Test
    void normalizesDomainAndAuthorizesRegexDomainWithExplicitPort() throws Exception {
        OutboundUrlSecurityService service = resolvingService(List.of(
                "regex:^service-[a-z0-9-]+\\.internal\\.example\\.com:9200$"), "10.0.0.1", "10.0.0.2");
        String url = "http://SERVICE-ES.INTERNAL.EXAMPLE.COM.:9200/data";
        assertEquals(url, service.validateAndResolve(url, Set.of("http")));
        assertIllegal(service, "http://service-es.internal.example.com:9201/data");
        assertIllegal(service, "http://service-es.internal.example.com.evil:9200/data");
    }

    @Test
    void checksEveryRestrictedResolvedIpRatherThanAnyMatchingIp() throws Exception {
        List<String> targets = List.of("regex:^192\\.168\\.1\\.\\d{1,3}:8080$");
        String url = "http://dataset.internal:8080/data";
        OutboundUrlSecurityService allowed = resolvingService(targets, "192.168.1.10", "192.168.1.11", "8.8.8.8");
        assertEquals(url, allowed.validateAndResolve(url, Set.of("http")));
        assertIllegal(resolvingService(targets, "192.168.1.10", "10.0.0.1"), url);
        assertIllegal(resolvingService(targets, "10.0.0.1", "192.168.1.10"), url);
        assertIllegal(resolvingService(targets, "192.168.1.10", "169.254.169.254"), url);
        assertIllegal(resolvingService(targets, "192.168.1.10", "::1"), url);
    }

    @Test
    void keepsExactIpRuleFromAuthorizingADomainResolvingToThatIp() throws Exception {
        assertIllegal(resolvingService(List.of("127.0.0.1:9200"), "127.0.0.1"),
                "http://dataset.internal:9200/data");
        OutboundUrlSecurityService service = resolvingService(List.of("DATASET.INTERNAL.:9200"), "10.0.0.1");
        String url = "http://dataset.internal:9200/data";
        assertEquals(url, service.validateAndResolve(url, Set.of("http")));
    }

    @Test
    void supportsNormalizedIpv6WithBracketsForDirectAndResolvedAddresses() throws Exception {
        List<String> targets = List.of("regex:^\\[fd00::[0-9a-f]+\\]:9200$");
        String url = "http://[fd00:0:0:0:0:0:0:1]:9200/data";
        assertEquals(url, service(targets).validateAndResolve(url, Set.of("http")));
        String domainUrl = "http://dataset.internal:9200/data";
        assertEquals(domainUrl, resolvingService(targets, "fd00::1").validateAndResolve(domainUrl, Set.of("http")));
        assertIllegal(service(targets), "http://[fd01::1]:9200/data");
        assertIllegal(service(targets), "http://[fd00::1]:9201/data");
        assertEquals("http://[::1]:9200/data", service(List.of("[::1]:9200"))
                .validateAndResolve("http://[::1]:9200/data", Set.of("http")));
    }

    @Test
    void usesProtocolDefaultPortsForRegex() {
        OutboundUrlSecurityService service = service(List.of("regex:^127\\.0\\.0\\.1:(80|443)$"));
        for (String scheme : List.of("http", "https", "ws", "wss")) {
            String url = scheme + "://127.0.0.1/data";
            assertEquals(url, service.validateAndResolve(url, Set.of(scheme)));
        }
    }

    @Test
    void regexDoesNotBypassSchemeUserInfoOrPortValidation() {
        OutboundUrlSecurityService service = service(List.of("regex:.*"));
        assertIllegal(service, "ftp://127.0.0.1:9200/data");
        assertIllegal(service, "http://user:password@127.0.0.1:9200/data");
        assertIllegal(service, "http://127.0.0.1:0/data");
        assertIllegal(service, "http://127.0.0.1:65536/data");
    }

    @Test
    void doesNotInterpretUnprefixedEntriesAsRegex() {
        assertIllegal(service(List.of("127.0.0.*:9200")), "http://127.0.0.1:9200/data");
    }

    @Test
    void rejectsInvalidOrEmptyRegexDuringInitialization() {
        for (String target : List.of("regex:[", "regex:", "regex:   ")) {
            assertThrows(IllegalArgumentException.class, () -> service(List.of(target)));
        }
    }

    @Test
    void compilesRegexInSpringLifecycleAndRejectsInvalidConfiguration() {
        ApplicationContextRunner runner = new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(ConfigurationPropertiesAutoConfiguration.class))
                .withUserConfiguration(DataRoomConfig.class, OutboundUrlSecurityService.class);
        runner.withPropertyValues("dataroom.outbound-http.allowed-internal-targets[0]=regex:^127\\.0\\.0\\.1:9200$")
                .run(context -> {
                    assertEquals(null, context.getStartupFailure());
                    String url = "http://127.0.0.1:9200/data";
                    assertEquals(url, context.getBean(OutboundUrlSecurityService.class)
                            .validateAndResolve(url, Set.of("http")));
                });
        runner.withPropertyValues("dataroom.outbound-http.allowed-internal-targets[0]=regex:[")
                .run(context -> assertTrue(context.getStartupFailure() != null));
    }

    private static OutboundUrlSecurityService resolvingService(List<String> targets, String... ips) throws Exception {
        InetAddress[] addresses = new InetAddress[ips.length];
        for (int i = 0; i < ips.length; i++) {
            addresses[i] = InetAddress.getByName(ips[i]);
        }
        return new OutboundUrlSecurityService(configuration(targets)) {
            @Override
            protected InetAddress[] resolveAddresses(String host) {
                return addresses;
            }
        };
    }

    private static OutboundUrlSecurityService service(List<String> allowedInternalTargets) {
        return new OutboundUrlSecurityService(configuration(allowedInternalTargets));
    }

    private static DataRoomConfig configuration(List<String> allowedInternalTargets) {
        OutboundHttp outboundHttp = new OutboundHttp();
        outboundHttp.setAllowedInternalTargets(allowedInternalTargets);
        DataRoomConfig config = new DataRoomConfig();
        config.setOutboundHttp(outboundHttp);
        return config;
    }

    private static void assertIllegal(OutboundUrlSecurityService service, String url) {
        DataRoomException exception = assertThrows(DataRoomException.class,
                () -> service.validateAndResolve(url, Set.of("http", "https")));
        assertTrue(exception.getMessage().endsWith("禁止访问"));
    }
}
