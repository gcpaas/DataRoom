package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.bean.KeyVal;
import com.gccloud.gcpaas.dataroom.core.bean.Rsa;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.HttpDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.service.HttpDatasetService;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.HttpDatasource;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.exception.IllegalOutboundDestinationException;
import com.gccloud.gcpaas.dataroom.core.security.OutboundUrlSecurityService;
import com.gccloud.gcpaas.dataroom.core.util.RsaUtils;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;

class HttpDatasetServiceTest {

    @Test
    void runPropagatesIllegalDestinationWithoutSendingRequest() {
        HttpDatasetService service = new HttpDatasetService() {
            @Override
            public Map<String, Object> getDefaultInputParam() {
                return Map.of();
            }
        };
        RestTemplate restTemplate = mock(RestTemplate.class);
        OutboundUrlSecurityService securityService = mock(OutboundUrlSecurityService.class);
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "outboundUrlSecurityService", securityService);
        String url = "http://127.0.0.1:8080/internal";
        when(securityService.validateAndResolve(url, Set.of("http", "https")))
                .thenThrow(new IllegalOutboundDestinationException("127.0.0.1:8080 地址属于回环地址，禁止访问"));
        HttpDataset dataset = new HttpDataset();
        dataset.setUrl(url);
        dataset.setMethod("GET");
        dataset.setBody("{}");
        DatasetEntity entity = new DatasetEntity();
        entity.setDataset(dataset);

        DataRoomException exception = assertThrows(DataRoomException.class,
                () -> service.run(new DatasetRunRequest(), entity));

        assertEquals("127.0.0.1:8080 地址属于回环地址，禁止访问", exception.getMessage());
        verifyNoInteractions(restTemplate);
    }

    @Test
    void runValidatesFinalUrlBeforeSendingRequest() {
        HttpDatasetService service = new HttpDatasetService() {
            @Override
            public Map<String, Object> getDefaultInputParam() {
                return Map.of();
            }
        };
        RestTemplate restTemplate = mock(RestTemplate.class);
        OutboundUrlSecurityService securityService = mock(OutboundUrlSecurityService.class);
        ReflectionTestUtils.setField(service, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(service, "outboundUrlSecurityService", securityService);
        String finalUrl = "http://8.8.8.8/items/42";
        when(securityService.validateAndResolve(finalUrl, Set.of("http", "https"))).thenReturn(finalUrl);
        when(restTemplate.exchange(eq(finalUrl), eq(HttpMethod.GET), any(), eq(String.class)))
                .thenReturn(ResponseEntity.ok("[]"));

        HttpDataset dataset = new HttpDataset();
        dataset.setUrl("http://8.8.8.8/items/#{id}");
        dataset.setMethod("GET");
        dataset.setBody("{}");
        DatasetEntity entity = new DatasetEntity();
        entity.setDataset(dataset);
        DatasetRunRequest request = new DatasetRunRequest();
        request.setInputParam(Map.of("id", 42));

        service.run(request, entity);

        verify(securityService).validateAndResolve(finalUrl, Set.of("http", "https"));
    }

    @Test
    void resolveUrlRequiresAbsoluteUrlWhenNoDatasourceIsSelected() throws Exception {
        Method method = serviceMethod("resolveUrl", String.class, HttpDatasource.class, Map.class);

        assertEquals(
                "https://api.example.com/users?page=1",
                method.invoke(null, "https://api.example.com/users?page=#{page}", null, Map.of("page", 1))
        );

        Exception exception = assertThrows(Exception.class, () -> method.invoke(null, "/users", null, Map.of()));
        assertInstanceOf(DataRoomException.class, exception.getCause());
    }

    @Test
    void resolveUrlJoinsDatasourceBaseUrlAndRelativePath() throws Exception {
        Method method = serviceMethod("resolveUrl", String.class, HttpDatasource.class, Map.class);
        HttpDatasource datasource = new HttpDatasource();
        datasource.setBaseUrl("https://api.example.com/base/");

        assertEquals(
                "https://api.example.com/base/users/42",
                method.invoke(null, "/users/#{id}", datasource, Map.of("id", 42))
        );

        Exception exception = assertThrows(Exception.class, () -> method.invoke(
                null,
                "https://other.example.com/users",
                datasource,
                Map.of()
        ));
        assertInstanceOf(DataRoomException.class, exception.getCause());
    }

    @Test
    void buildHeadersMergesCaseInsensitiveAndDatasetHeadersWin() throws Exception {
        HttpDatasetService service = new HttpDatasetService();
        Method method = serviceMethod("buildHeaders", List.class, List.class, Map.class);

        HttpHeaders headers = (HttpHeaders) method.invoke(
                service,
                List.of(header("Authorization", "Bearer source", false), header("X-Trace", "source", false)),
                List.of(header("authorization", "Bearer dataset", false)),
                new HashMap<>()
        );

        assertEquals("Bearer dataset", headers.getFirst("authorization"));
        assertTrue(new ArrayList<>(headers.headerNames()).contains("authorization"));
        assertEquals("source", headers.getFirst("X-Trace"));
    }

    @Test
    void buildHeadersDecryptsEncryptedHeaderBeforeReplacingParams() throws Exception {
        Rsa rsa = RsaUtils.generateRsaKeyPair();
        assertNotNull(rsa);
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        dataRoomConfig.setPrivateKey(rsa.getPrivateKey());
        HttpDatasetService service = new HttpDatasetService();
        ReflectionTestUtils.setField(service, "dataRoomConfig", dataRoomConfig);
        Method method = serviceMethod("buildHeaders", List.class, List.class, Map.class);

        HttpHeaders headers = (HttpHeaders) method.invoke(
                service,
                List.of(header("Authorization", RsaUtils.encryptByPublicKey("Bearer #{token}", rsa.getPublicKey()), true)),
                List.of(),
                Map.of("token", "abc")
        );

        assertEquals("Bearer abc", headers.getFirst("Authorization"));
    }

    private static Method serviceMethod(String methodName, Class<?>... parameterTypes) throws Exception {
        Method method = HttpDatasetService.class.getDeclaredMethod(methodName, parameterTypes);
        method.setAccessible(true);
        return method;
    }

    private static KeyVal header(String key, String val, boolean encrypted) {
        KeyVal keyVal = new KeyVal();
        keyVal.setKey(key);
        keyVal.setVal(val);
        keyVal.setEncrypted(encrypted);
        return keyVal;
    }
}
