package com.gccloud.gcpaas.core.datasource;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.datasource.ExcelDataSourceController;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.DataSourceColumnMeta;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.DataSourceTableMeta;
import com.gccloud.gcpaas.dataroom.core.datasource.service.DataSourceMetadataService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class ExcelDataSourceControllerTest {

    @Test
    void listTablesDelegatesToMetadataService() {
        DataSourceMetadataService metadataService = mock(DataSourceMetadataService.class);
        ExcelDataSourceController controller = new ExcelDataSourceController();
        ReflectionTestUtils.setField(controller, "dataSourceMetadataService", metadataService);
        DataSourceTableMeta tableMeta = new DataSourceTableMeta();
        tableMeta.setName("excel_sales");
        when(metadataService.listAppExcelTables()).thenReturn(List.of(tableMeta));

        Resp<List<DataSourceTableMeta>> response = controller.listTables();

        assertEquals(200, response.getCode());
        assertEquals("excel_sales", response.getData().get(0).getName());
    }

    @Test
    void listColumnsDelegatesToMetadataService() {
        DataSourceMetadataService metadataService = mock(DataSourceMetadataService.class);
        ExcelDataSourceController controller = new ExcelDataSourceController();
        ReflectionTestUtils.setField(controller, "dataSourceMetadataService", metadataService);
        DataSourceColumnMeta columnMeta = new DataSourceColumnMeta();
        columnMeta.setName("amount");
        when(metadataService.listAppExcelColumns("excel_sales")).thenReturn(List.of(columnMeta));

        Resp<List<DataSourceColumnMeta>> response = controller.listColumns("excel_sales");

        assertEquals(200, response.getCode());
        assertEquals("amount", response.getData().get(0).getName());
    }
}
