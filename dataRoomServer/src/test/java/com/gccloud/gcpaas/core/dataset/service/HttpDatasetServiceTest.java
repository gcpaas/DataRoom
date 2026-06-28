package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.dataroom.core.bean.KeyVal;
import com.gccloud.gcpaas.dataroom.core.bean.Rsa;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.dataset.service.HttpDatasetService;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.HttpDatasource;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.util.RsaUtils;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.test.util.ReflectionTestUtils;

import java.lang.reflect.Method;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class HttpDatasetServiceTest {

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
        assertTrue(new ArrayList<>(headers.keySet()).contains("authorization"));
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
