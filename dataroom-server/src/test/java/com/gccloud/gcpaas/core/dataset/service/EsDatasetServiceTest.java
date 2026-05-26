package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.core.bean.Rsa;
import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.datasource.bean.EsDatasource;
import com.gccloud.gcpaas.core.util.RsaUtils;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class EsDatasetServiceTest {

    @Test
    void buildRequestUrlJoinsBaseUrlAndConfiguredPath() throws Exception {
        Method method = serviceMethod("buildRequestUrl", String.class, String.class);

        assertEquals(
                "http://localhost:9200/orders/_search",
                method.invoke(null, "http://localhost:9200", "/orders/_search")
        );
        assertEquals(
                "http://localhost:9200/orders/_search",
                method.invoke(null, "http://localhost:9200/", "orders/_search")
        );
        assertEquals(
                "http://localhost:9200/_cat/indices/orders?v",
                method.invoke(null, "http://localhost:9200/", "/_cat/indices/orders?v")
        );
    }

    @Test
    void buildAuthorizationHeaderSupportsEsAuthModes() throws Exception {
        Method method = serviceMethod(
                "buildAuthorizationHeader",
                String.class,
                String.class,
                String.class,
                String.class,
                String.class
        );

        assertNull(method.invoke(null, "none", "elastic", "pwd", "token", "api-key"));
        assertEquals(
                "Basic ZWxhc3RpYzpwd2Q=",
                method.invoke(null, "basic", "elastic", "pwd", "", "")
        );
        assertEquals(
                "Bearer bearer-token",
                method.invoke(null, "bearer", "", "", "bearer-token", "")
        );
        assertEquals(
                "ApiKey encoded-api-key",
                method.invoke(null, "apiKey", "", "", "", "encoded-api-key")
        );
    }

    @Test
    void buildHeadersDecryptsEncryptedEsCredentialValues() throws Exception {
        Rsa rsa = RsaUtils.generateRsaKeyPair();
        assertNotNull(rsa);
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        dataRoomConfig.setPrivateKey(rsa.getPrivateKey());
        EsDatasetService service = new EsDatasetService();
        ReflectionTestUtils.setField(service, "dataRoomConfig", dataRoomConfig);

        EsDatasource basicDatasource = new EsDatasource();
        basicDatasource.setAuthType("basic");
        basicDatasource.setUsername("elastic");
        basicDatasource.setPassword(RsaUtils.encryptByPublicKey("pwd", rsa.getPublicKey()));

        HttpHeaders basicHeaders = buildHeaders(service, basicDatasource);
        assertEquals("Basic ZWxhc3RpYzpwd2Q=", basicHeaders.getFirst(HttpHeaders.AUTHORIZATION));

        EsDatasource bearerDatasource = new EsDatasource();
        bearerDatasource.setAuthType("bearer");
        bearerDatasource.setBearerToken(RsaUtils.encryptByPublicKey("bearer-token", rsa.getPublicKey()));

        HttpHeaders bearerHeaders = buildHeaders(service, bearerDatasource);
        assertEquals("Bearer bearer-token", bearerHeaders.getFirst(HttpHeaders.AUTHORIZATION));

        EsDatasource apiKeyDatasource = new EsDatasource();
        apiKeyDatasource.setAuthType("apiKey");
        apiKeyDatasource.setApiKey(RsaUtils.encryptByPublicKey("encoded-api-key", rsa.getPublicKey()));

        HttpHeaders apiKeyHeaders = buildHeaders(service, apiKeyDatasource);
        assertEquals("ApiKey encoded-api-key", apiKeyHeaders.getFirst(HttpHeaders.AUTHORIZATION));
    }

    private static Method serviceMethod(String methodName, Class<?>... parameterTypes) throws Exception {
        Class<?> serviceClass = Class.forName("com.gccloud.gcpaas.core.dataset.service.EsDatasetService");
        Method method = serviceClass.getDeclaredMethod(methodName, parameterTypes);
        method.setAccessible(true);
        return method;
    }

    private static HttpHeaders buildHeaders(EsDatasetService service, EsDatasource datasource) throws Exception {
        Method method = serviceMethod("buildHeaders", EsDatasource.class);
        return (HttpHeaders) method.invoke(service, datasource);
    }
}
