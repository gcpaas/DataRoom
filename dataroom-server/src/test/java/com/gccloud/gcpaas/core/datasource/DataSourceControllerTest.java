package com.gccloud.gcpaas.core.datasource;

import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.constant.DataSourceType;
import com.gccloud.gcpaas.core.datasource.bean.DataSourceColumnMeta;
import com.gccloud.gcpaas.core.datasource.bean.DataSourceTableMeta;
import com.gccloud.gcpaas.core.datasource.bean.EsDatasource;
import com.gccloud.gcpaas.core.datasource.service.DataSourceMetadataService;
import com.gccloud.gcpaas.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.core.mapper.DataSourceMapper;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class DataSourceControllerTest {

    @Test
    void detailDesensitizesDatasourceSecretsBeforeReturning() {
        DataSourceMapper dataSourceMapper = mock(DataSourceMapper.class);
        DataSourceController controller = new DataSourceController();
        ReflectionTestUtils.setField(controller, "datasourceMapper", dataSourceMapper);

        DataSourceEntity entity = new DataSourceEntity();
        entity.setCode("dataSource_1");
        entity.setName("ES数据源");
        entity.setDataSourceType(DataSourceType.ES);
        EsDatasource datasource = new EsDatasource();
        datasource.setBaseUrl("http://localhost:9200");
        datasource.setAuthType("apiKey");
        datasource.setUsername("elastic");
        datasource.setPassword("encryptedPassword");
        datasource.setBearerToken("encryptedBearer");
        datasource.setApiKey("encryptedApiKey");
        entity.setDataSource(datasource);
        when(dataSourceMapper.getByCode("dataSource_1")).thenReturn(entity);

        Resp<DataSourceEntity> response = controller.detail("dataSource_1");

        EsDatasource responseDatasource = (EsDatasource) response.getData().getDataSource();
        assertEquals("apiKey", responseDatasource.getAuthType());
        assertEquals("elastic", responseDatasource.getUsername());
        assertNull(responseDatasource.getPassword());
        assertNull(responseDatasource.getBearerToken());
        assertNull(responseDatasource.getApiKey());
    }

    @Test
    void listTablesDelegatesToMetadataService() {
        DataSourceMapper dataSourceMapper = mock(DataSourceMapper.class);
        DataSourceMetadataService metadataService = mock(DataSourceMetadataService.class);
        DataSourceController controller = new DataSourceController();
        ReflectionTestUtils.setField(controller, "datasourceMapper", dataSourceMapper);
        ReflectionTestUtils.setField(controller, "dataSourceMetadataService", metadataService);

        DataSourceEntity entity = new DataSourceEntity();
        entity.setCode("dataSource_1");
        DataSourceTableMeta tableMeta = new DataSourceTableMeta();
        tableMeta.setName("orders");
        when(dataSourceMapper.getByCode("dataSource_1")).thenReturn(entity);
        when(metadataService.listTables(entity)).thenReturn(List.of(tableMeta));

        Resp<List<DataSourceTableMeta>> response = controller.listTables("dataSource_1");

        assertEquals(200, response.getCode());
        assertEquals("orders", response.getData().get(0).getName());
    }

    @Test
    void listColumnsDelegatesToMetadataService() {
        DataSourceMapper dataSourceMapper = mock(DataSourceMapper.class);
        DataSourceMetadataService metadataService = mock(DataSourceMetadataService.class);
        DataSourceController controller = new DataSourceController();
        ReflectionTestUtils.setField(controller, "datasourceMapper", dataSourceMapper);
        ReflectionTestUtils.setField(controller, "dataSourceMetadataService", metadataService);

        DataSourceEntity entity = new DataSourceEntity();
        entity.setCode("dataSource_1");
        DataSourceColumnMeta columnMeta = new DataSourceColumnMeta();
        columnMeta.setName("order_id");
        when(dataSourceMapper.getByCode("dataSource_1")).thenReturn(entity);
        when(metadataService.listColumns(entity, "orders")).thenReturn(List.of(columnMeta));

        Resp<List<DataSourceColumnMeta>> response = controller.listColumns("dataSource_1", "orders");

        assertEquals(200, response.getCode());
        assertEquals("order_id", response.getData().get(0).getName());
    }
}
