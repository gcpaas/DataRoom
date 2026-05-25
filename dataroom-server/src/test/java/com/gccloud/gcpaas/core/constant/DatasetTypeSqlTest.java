package com.gccloud.gcpaas.core.constant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.core.dataset.bean.RelationalDataset;
import com.gccloud.gcpaas.core.entity.DatasetEntity;
import org.junit.jupiter.api.Test;
import org.springframework.stereotype.Service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;

class DatasetTypeSqlTest {

    @Test
    void sqlDatasetTypeUsesSqlWireValue() {
        DatasetType sqlType = DatasetType.valueOf("SQL");

        assertEquals("sql", sqlType.getType());
        assertEquals("sql", sqlType.getValue());
    }

    @Test
    void sqlDatasetServiceBeanUsesSqlTypeName() throws Exception {
        Class<?> serviceClass = Class.forName("com.gccloud.gcpaas.core.dataset.service.SqlDatasetService");

        Service service = serviceClass.getAnnotation(Service.class);

        assertNotNull(service);
        assertEquals("sql" + DataRoomConstant.Dataset.SERVICE_NAME, service.value());
    }

    @Test
    void deserializeSqlDatasetEntity() throws Exception {
        String json = """
                {
                  "name": "销售统计",
                  "datasetType": "sql",
                  "dataset": {
                    "datasetType": "sql",
                    "sql": "select * from sales"
                  }
                }
                """;

        DatasetEntity entity = new ObjectMapper().readValue(json, DatasetEntity.class);

        assertEquals(DatasetType.SQL, entity.getDatasetType());
        RelationalDataset dataset = assertInstanceOf(RelationalDataset.class, entity.getDataset());
        assertEquals("select * from sales", dataset.getSql());
    }
}
