package com.gccloud.gcpaas.server;

import jakarta.servlet.Servlet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.junit.jupiter.api.Test;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.mongo.MongoAutoConfiguration;

import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertTrue;

class ApplicationClasspathTest {

    @Test
    void classpathDoesNotExposeLegacyJspServlet() throws Exception {
        try {
            Class<?> jspServlet = Class.forName("org.apache.jasper.servlet.JspServlet");
            assertTrue(Servlet.class.isAssignableFrom(jspServlet), "JspServlet must be compatible with jakarta.servlet.Servlet");
        } catch (ClassNotFoundException ignored) {
            // No JSP servlet is fine; this application serves static resources instead of JSP pages.
        }
    }

    @Test
    void disablesNativeMongoAutoConfiguration() {
        SpringBootApplication annotation = DataRoomApplication.class.getAnnotation(SpringBootApplication.class);

        assertTrue(
                Arrays.asList(annotation.exclude()).contains(MongoAutoConfiguration.class),
                "MongoDB JDBC must not trigger Spring Boot's native MongoClient auto-configuration"
        );
    }

    @Test
    void tdengineWebSocketDriverIsAvailable() throws Exception {
        Class.forName("com.taosdata.jdbc.ws.WebSocketDriver", false, Thread.currentThread().getContextClassLoader());
    }

    @Test
    void druidAvaticaDriverIsAvailable() throws Exception {
        Class.forName("org.apache.calcite.avatica.remote.Driver", false, Thread.currentThread().getContextClassLoader());
    }

    @Test
    void poiOoxmlVersionIsNotVulnerable() {
        String version = XSSFWorkbook.class.getPackage().getImplementationVersion();

        assertTrue(
                isAtLeast(version, 5, 4, 0),
                "poi-ooxml must be 5.4.0 or later to avoid CVE-2025-31672, but was " + version
        );
    }

    private static boolean isAtLeast(String version, int requiredMajor, int requiredMinor, int requiredPatch) {
        String[] parts = version.split("\\.");
        int major = Integer.parseInt(parts[0]);
        int minor = Integer.parseInt(parts[1]);
        int patch = Integer.parseInt(parts[2]);
        if (major != requiredMajor) {
            return major > requiredMajor;
        }
        if (minor != requiredMinor) {
            return minor > requiredMinor;
        }
        return patch >= requiredPatch;
    }
}
