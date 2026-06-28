package com.gccloud.gcpaas.core.datasource.bean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.bean.KeyVal;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.BaseDataSource;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.HttpDatasource;
import com.gccloud.gcpaas.dataroom.core.entity.DataSourceEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class HttpDatasourceJsonTest {

    private final ObjectMapper objectMapper = new ObjectMapper();

    @Test
    void deserializeHttpDatasource() throws Exception {
        String json = """
                {
                  "name": "公共 API",
                  "dataSourceType": "http",
                  "dataSource": {
                    "dataSourceType": "http",
                    "baseUrl": "https://api.example.com/base",
                    "headerList": [
                      {"key": "Authorization", "val": "cipher", "encrypted": true},
                      {"key": "X-Trace-Id", "val": "trace"}
                    ]
                  }
                }
                """;

        DataSourceEntity entity = objectMapper.readValue(json, DataSourceEntity.class);

        assertEquals("http", entity.getDataSourceType().getValue());
        HttpDatasource http = assertInstanceOf(HttpDatasource.class, entity.getDataSource());
        assertEquals("https://api.example.com/base", http.getBaseUrl());
        assertEquals("Authorization", http.getHeaderList().get(0).getKey());
        assertEquals("cipher", http.getHeaderList().get(0).getVal());
        assertTrue(http.getHeaderList().get(0).getEncrypted());
        assertNull(http.getHeaderList().get(1).getEncrypted());
    }

    @Test
    void desensitizeMasksOnlyEncryptedHeaderValues() throws Exception {
        BaseDataSource datasource = objectMapper.readValue("""
                {
                  "dataSourceType": "http",
                  "baseUrl": "https://api.example.com",
                  "headerList": [
                    {"key": "Authorization", "val": "cipher", "encrypted": true},
                    {"key": "X-Trace-Id", "val": "trace", "encrypted": false}
                  ]
                }
                """, BaseDataSource.class);

        datasource.desensitize();

        HttpDatasource http = assertInstanceOf(HttpDatasource.class, datasource);
        assertEquals("******", http.getHeaderList().get(0).getVal());
        assertEquals("trace", http.getHeaderList().get(1).getVal());
    }

    @Test
    void updatedSensitivePreservesEncryptedHeaderWhenBlankOrMasked() {
        HttpDatasource dbDatasource = new HttpDatasource();
        dbDatasource.setHeaderList(List.of(
                header("Authorization", "oldAuthCipher", true),
                header("X-API-Key", "oldApiKeyCipher", true)
        ));
        HttpDatasource updateDatasource = new HttpDatasource();
        updateDatasource.setHeaderList(List.of(
                header("authorization", "******", true),
                header("x-api-key", "", true),
                header("X-Trace-Id", "newTrace", false)
        ));

        updateDatasource.updatedSensitive(dbDatasource);

        assertEquals("oldAuthCipher", updateDatasource.getHeaderList().get(0).getVal());
        assertEquals("oldApiKeyCipher", updateDatasource.getHeaderList().get(1).getVal());
        assertEquals("newTrace", updateDatasource.getHeaderList().get(2).getVal());
    }

    @Test
    void updatedSensitiveUsesSubmittedEncryptedHeaderValueWhenProvided() {
        HttpDatasource dbDatasource = new HttpDatasource();
        dbDatasource.setHeaderList(List.of(header("Authorization", "oldCipher", true)));
        HttpDatasource updateDatasource = new HttpDatasource();
        updateDatasource.setHeaderList(List.of(header("Authorization", "newCipher", true)));

        updateDatasource.updatedSensitive(dbDatasource);

        assertEquals("newCipher", updateDatasource.getHeaderList().get(0).getVal());
    }

    private static KeyVal header(String key, String val, boolean encrypted) {
        KeyVal keyVal = new KeyVal();
        keyVal.setKey(key);
        keyVal.setVal(val);
        keyVal.setEncrypted(encrypted);
        return keyVal;
    }
}
