package com.gccloud.gcpaas.core.config;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfiguration;
import com.gccloud.gcpaas.dataroom.core.config.bean.Cors;
import com.gccloud.gcpaas.dataroom.core.config.bean.Cas;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.AutoConfigurations;
import org.springframework.boot.autoconfigure.context.ConfigurationPropertiesAutoConfiguration;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DataRoomConfigurationTest {

    @Test
    void paginationInterceptorRegistersPaginationInnerInterceptor() {
        MybatisPlusInterceptor interceptor = new DataRoomConfiguration().paginationInterceptor();

        assertTrue(interceptor.getInterceptors().stream().anyMatch(PaginationInnerInterceptor.class::isInstance),
                "MyBatis-Plus pagination must register PaginationInnerInterceptor so Page#getTotal() is populated");
    }

    @Test
    void corsFilterUsesDataRoomCorsConfiguration() {
        Cors cors = new Cors();
        cors.setPathPattern("/api/**");
        cors.setAllowedOriginPatterns(List.of("https://example.com"));
        cors.setAllowCredentials(false);
        cors.setAllowedMethods(List.of("GET", "POST"));
        cors.setAllowedHeaders(List.of("Authorization", "Content-Type"));
        cors.setExposedHeaders(List.of("X-Request-Id"));
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        dataRoomConfig.setCors(cors);

        CorsFilter filter = new DataRoomConfiguration().corsFilter(dataRoomConfig);
        CorsConfigurationSource source = (CorsConfigurationSource) ReflectionTestUtils.getField(filter, "configSource");
        CorsConfiguration configuration = source.getCorsConfiguration(
                new MockHttpServletRequest("OPTIONS", "/api/dataset"));

        assertEquals(List.of("https://example.com"), configuration.getAllowedOriginPatterns());
        assertEquals(false, configuration.getAllowCredentials());
        assertEquals(List.of("GET", "POST"), configuration.getAllowedMethods());
        assertEquals(List.of("Authorization", "Content-Type"), configuration.getAllowedHeaders());
        assertEquals(List.of("X-Request-Id"), configuration.getExposedHeaders());
        assertNull(source.getCorsConfiguration(new MockHttpServletRequest("OPTIONS", "/other")));
    }

    @Test
    void bindsCorsConfigurationProperties() {
        new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(ConfigurationPropertiesAutoConfiguration.class))
                .withUserConfiguration(DataRoomConfig.class)
                .withPropertyValues(
                        "dataroom.cors.path-pattern=/custom/**",
                        "dataroom.cors.allowed-origin-patterns[0]=https://example.com",
                        "dataroom.cors.allow-credentials=false",
                        "dataroom.cors.allowed-methods[0]=GET",
                        "dataroom.cors.allowed-headers[0]=Authorization",
                        "dataroom.cors.exposed-headers[0]=X-Request-Id"
                )
                .run(context -> {
                    Cors cors = context.getBean(DataRoomConfig.class).getCors();
                    assertEquals("/custom/**", cors.getPathPattern());
                    assertEquals(List.of("https://example.com"), cors.getAllowedOriginPatterns());
                    assertEquals(false, cors.getAllowCredentials());
                    assertEquals(List.of("GET"), cors.getAllowedMethods());
                    assertEquals(List.of("Authorization"), cors.getAllowedHeaders());
                    assertEquals(List.of("X-Request-Id"), cors.getExposedHeaders());
                });
    }

    @Test
    void bindsAllowedInternalTargets() {
        new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(ConfigurationPropertiesAutoConfiguration.class))
                .withUserConfiguration(DataRoomConfig.class)
                .withPropertyValues(
                        "dataroom.outbound-http.allowed-internal-targets[0]=127.0.0.1:9200",
                        "dataroom.outbound-http.allowed-internal-targets[1]=es.internal.example.com:9200",
                        "dataroom.outbound-http.allowed-internal-targets[2]=regex:^192\\.168\\.1\\.\\d{1,3}:(8080|9200)$"
                )
                .run(context -> assertEquals(
                        List.of("127.0.0.1:9200", "es.internal.example.com:9200",
                                "regex:^192\\.168\\.1\\.\\d{1,3}:(8080|9200)$"),
                        context.getBean(DataRoomConfig.class).getOutboundHttp().getAllowedInternalTargets()
                ));
    }

    @Test
    void bindsCasConfigurationProperties() {
        new ApplicationContextRunner()
                .withConfiguration(AutoConfigurations.of(ConfigurationPropertiesAutoConfiguration.class))
                .withUserConfiguration(DataRoomConfig.class)
                .withPropertyValues(
                        "dataroom.ui-url=https://app.example.com/#/",
                        "dataroom.cas.enable=true",
                        "dataroom.cas.server-url-prefix=https://cas.example.com/cas",
                        "dataroom.cas.service=https://app.example.com/dataRoom/cas/login",
                        "dataroom.cas.service-validate-suffix=/serviceValidate",
                        "dataroom.cas.connect-timeout=2s",
                        "dataroom.cas.read-timeout=4s"
                )
                .run(context -> {
                    DataRoomConfig dataRoomConfig = context.getBean(DataRoomConfig.class);
                    Cas cas = dataRoomConfig.getCas();
                    assertEquals("https://app.example.com/#/", dataRoomConfig.getUiUrl());
                    assertTrue(cas.getEnable());
                    assertEquals("https://cas.example.com/cas", cas.getServerUrlPrefix());
                    assertEquals("https://app.example.com/dataRoom/cas/login", cas.getService());
                    assertEquals("/serviceValidate", cas.getServiceValidateSuffix());
                    assertEquals(Duration.ofSeconds(2), cas.getConnectTimeout());
                    assertEquals(Duration.ofSeconds(4), cas.getReadTimeout());
                });
    }

    @Test
    void outboundRestTemplateDoesNotFollowRedirects() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/redirect", exchange -> {
            exchange.getResponseHeaders().add("Location", "/target");
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        });
        server.createContext("/target", exchange -> {
            byte[] body = "followed".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
        try {
            String url = "http://127.0.0.1:" + server.getAddress().getPort() + "/redirect";

            assertEquals(302, new DataRoomConfiguration().outboundRestTemplate().getForEntity(url, String.class)
                    .getStatusCode().value());
        } finally {
            server.stop(0);
        }
    }

    @Test
    void casRestTemplateDoesNotFollowRedirects() throws Exception {
        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/redirect", exchange -> {
            exchange.getResponseHeaders().add("Location", "/target");
            exchange.sendResponseHeaders(302, -1);
            exchange.close();
        });
        server.createContext("/target", exchange -> {
            byte[] body = "followed".getBytes(StandardCharsets.UTF_8);
            exchange.sendResponseHeaders(200, body.length);
            exchange.getResponseBody().write(body);
            exchange.close();
        });
        server.start();
        try {
            String url = "http://127.0.0.1:" + server.getAddress().getPort() + "/redirect";
            DataRoomConfig config = new DataRoomConfig();

            assertEquals(302, new DataRoomConfiguration().casRestTemplate(config).getForEntity(url, String.class)
                    .getStatusCode().value());
        } finally {
            server.stop(0);
        }
    }
}
