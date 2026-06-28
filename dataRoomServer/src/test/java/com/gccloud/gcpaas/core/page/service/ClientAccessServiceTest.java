package com.gccloud.gcpaas.core.page.service;

import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.page.service.ClientAccessService;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ClientAccessServiceTest {

    private final ClientAccessService service = new ClientAccessService();

    @Test
    void resolveClientIpPrefersForwardedForFirstAddress() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Forwarded-For", "203.0.113.10, 10.0.0.2");
        request.addHeader("X-Real-IP", "198.51.100.7");

        assertEquals("203.0.113.10", service.resolveClientIp(request));
    }

    @Test
    void resolveClientIpFallsBackToRealIpThenRemoteAddr() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Real-IP", "198.51.100.7");
        request.setRemoteAddr("192.0.2.1");

        assertEquals("198.51.100.7", service.resolveClientIp(request));

        MockHttpServletRequest remoteRequest = new MockHttpServletRequest();
        remoteRequest.setRemoteAddr("192.0.2.1");

        assertEquals("192.0.2.1", service.resolveClientIp(remoteRequest));
    }

    @Test
    void whitelistAllowsEmptyExactIpAndCidr() {
        assertTrue(service.matchesWhitelist("192.168.1.10", ""));
        assertTrue(service.matchesWhitelist("192.168.1.10", "192.168.1.10"));
        assertTrue(service.matchesWhitelist("2001:db8::8", "2001:db8::8"));
        assertTrue(service.matchesWhitelist("192.168.1.20", "192.168.1.0/24"));
        assertTrue(service.matchesWhitelist("2001:db8::8", "2001:db8::/64"));
        assertFalse(service.matchesWhitelist("192.168.2.20", "192.168.1.0/24"));
    }

    @Test
    void validateWhitelistReportsLineNumber() {
        DataRoomException error = assertThrows(DataRoomException.class,
                () -> service.validateWhitelist("192.168.1.1\nnot-an-ip"));

        assertTrue(error.getMessage().contains("第 2 行"));
    }
}
