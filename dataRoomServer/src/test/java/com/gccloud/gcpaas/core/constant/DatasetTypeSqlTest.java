package com.gccloud.gcpaas.core.constant;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.core.dataset.bean.RelationalDataset;
import com.gccloud.gcpaas.core.entity.DatasetEntity;
import org.apache.commons.lang3.exception.ExceptionUtils;
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
    void excelDatasetTypeUsesExcelWireValue() {
        DatasetType excelType = DatasetType.valueOf("EXCEL");

        assertEquals("excel", excelType.getType());
        assertEquals("excel", excelType.getValue());
    }

    @Test
    void sqlDatasetServiceBeanUsesSqlTypeName() throws Exception {
        Class<?> serviceClass = Class.forName("com.gccloud.gcpaas.core.dataset.service.SqlDatasetService");

        Service service = serviceClass.getAnnotation(Service.class);

        assertNotNull(service);
        assertEquals("sql" + DataRoomConstant.Dataset.SERVICE_NAME, service.value());
    }

    @Test
    void esDatasetServiceBeanUsesEsTypeName() throws Exception {
        Class<?> serviceClass = Class.forName("com.gccloud.gcpaas.core.dataset.service.EsDatasetService");

        Service service = serviceClass.getAnnotation(Service.class);

        assertNotNull(service);
        assertEquals("es" + DataRoomConstant.Dataset.SERVICE_NAME, service.value());
    }

    @Test
    void excelDatasetServiceBeanUsesExcelTypeName() throws Exception {
        Class<?> serviceClass = Class.forName("com.gccloud.gcpaas.core.dataset.service.ExcelDatasetService");

        Service service = serviceClass.getAnnotation(Service.class);

        assertNotNull(service);
        assertEquals("excel" + DataRoomConstant.Dataset.SERVICE_NAME, service.value());
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

    @Test
    void deserializeExcelDatasetEntity() throws Exception {
        String json = """
                {
                  "name": "Excel销售统计",
                  "datasetType": "excel",
                  "dataset": {
                    "datasetType": "excel",
                    "sql": "select * from excel_sales"
                  }
                }
                """;

        DatasetEntity entity = new ObjectMapper().readValue(json, DatasetEntity.class);

        assertEquals(DatasetType.EXCEL, entity.getDatasetType());
        RelationalDataset dataset = assertInstanceOf(RelationalDataset.class, entity.getDataset());
        assertEquals("select * from excel_sales", dataset.getSql());
    }

    @Test
    void datasetRunRequestAcceptsParamMapAlias() throws Exception {
        String json = """
                {
                  "datasetCode": "dataset_1",
                  "paramMap": {
                    "keyword": "order"
                  }
                }
                """;

        DatasetRunRequest request = new ObjectMapper().readValue(json, DatasetRunRequest.class);

        assertEquals("dataset_1", request.getDatasetCode());
        assertEquals("order", request.getInputParam().get("keyword"));
    }

    @Test
    void deserializeEsDatasetEntity() throws Exception {
        String json = """
                {
                  "name": "ES订单查询",
                  "dataSourceCode": "ds_es",
                  "datasetType": "es",
                  "dataset": {
                    "datasetType": "es",
                    "path": "/orders/_search",
                    "method": "POST",
                    "body": "{\\"query\\":{\\"match_all\\":{}}}",
                    "respJsonPath": "$.hits.hits"
                  }
                }
                """;

        DatasetEntity entity = new ObjectMapper().readValue(json, DatasetEntity.class);

        assertEquals("es", entity.getDatasetType().getValue());
        Object dataset = entity.getDataset();
        assertEquals("EsDataset", dataset.getClass().getSimpleName());
        assertEquals("/orders/_search", fieldValue(dataset, "path"));
        assertEquals("POST", fieldValue(dataset, "method"));
        assertEquals("{\"query\":{\"match_all\":{}}}", fieldValue(dataset, "body"));
        assertEquals("$.hits.hits", fieldValue(dataset, "respJsonPath"));
    }

    private static Object fieldValue(Object target, String fieldName) throws Exception {
        Class<?> clazz = target.getClass();
        while (clazz != null && clazz != Object.class) {
            try {
                java.lang.reflect.Field field = clazz.getDeclaredField(fieldName);
                field.setAccessible(true);
                return field.get(target);
            } catch (NoSuchFieldException ignored) {
                System.err.println(ExceptionUtils.getStackTrace(ignored));
                clazz = clazz.getSuperclass();
            }
        }
        throw new NoSuchFieldException(fieldName);
    }
}
