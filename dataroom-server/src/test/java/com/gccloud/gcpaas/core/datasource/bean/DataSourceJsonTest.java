package com.gccloud.gcpaas.core.datasource.bean;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.core.entity.DataSourceEntity;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class DataSourceJsonTest {

    @Test
    void deserializeDamengDatasourceAsRelationalDatasource() throws Exception {
        String json = """
                {
                  "name": "达梦数据源",
                  "dataSourceType": "dameng",
                  "dataSource": {
                    "dataSourceType": "dameng",
                    "driverName": "dm.jdbc.driver.DmDriver",
                    "username": "SYSDBA",
                    "password": "encrypted",
                    "url": "jdbc:dm://localhost:5236"
                  }
                }
                """;

        DataSourceEntity entity = new ObjectMapper().readValue(json, DataSourceEntity.class);

        assertEquals("dameng", entity.getDataSourceType().getValue());
        RelationalDatasource datasource = assertInstanceOf(RelationalDatasource.class, entity.getDataSource());
        assertEquals("dm.jdbc.driver.DmDriver", datasource.getDriverName());
        assertEquals("jdbc:dm://localhost:5236", datasource.getUrl());
        assertEquals("SYSDBA", datasource.getUsername());
    }
}
