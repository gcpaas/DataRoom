package com.gccloud.gcpaas.core.dataset.service;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

    private static Method serviceMethod(String methodName, Class<?>... parameterTypes) throws Exception {
        Class<?> serviceClass = Class.forName("com.gccloud.gcpaas.core.dataset.service.EsDatasetService");
        Method method = serviceClass.getDeclaredMethod(methodName, parameterTypes);
        method.setAccessible(true);
        return method;
    }
}
