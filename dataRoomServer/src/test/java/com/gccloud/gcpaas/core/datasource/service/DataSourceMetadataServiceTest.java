package com.gccloud.gcpaas.core.datasource.service;

import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.constant.DataSourceType;
import com.gccloud.gcpaas.core.datasource.bean.DataSourceColumnMeta;
import com.gccloud.gcpaas.core.datasource.bean.DataSourceTableMeta;
import com.gccloud.gcpaas.core.datasource.bean.ExcelColumn;
import com.gccloud.gcpaas.core.datasource.bean.ExcelDatasource;
import com.gccloud.gcpaas.core.entity.DataSourceEntity;
import org.junit.jupiter.api.Test;
import org.springframework.jdbc.datasource.SingleConnectionDataSource;
import org.springframework.test.util.ReflectionTestUtils;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.Statement;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;

class DataSourceMetadataServiceTest {

    @Test
    void listTablesReadsTablesFromExcelDatasourceAppConnection() throws Exception {
        loadH2Driver();
        Connection connection = DriverManager.getConnection("jdbc:h2:mem:metadata_tables;MODE=MySQL;DATABASE_TO_UPPER=false");
        try (Statement statement = connection.createStatement()) {
            statement.execute("create table excel_sales (id int primary key, amount decimal(18, 2))");
        }

        DataSourceMetadataService service = createService(connection);
        DataSourceEntity entity = new DataSourceEntity();
        entity.setDataSourceType(DataSourceType.EXCEL);
        ExcelDatasource datasource = new ExcelDatasource();
        datasource.setTableName("excel_sales");
        entity.setDataSource(datasource);

        List<DataSourceTableMeta> tables = service.listTables(entity);

        assertEquals(1, tables.size());
        assertEquals("excel_sales", tables.get(0).getName());
    }

    @Test
    void listColumnsReadsColumnsFromExcelDatasourceAppConnection() throws Exception {
        loadH2Driver();
        Connection connection = DriverManager.getConnection("jdbc:h2:mem:metadata_columns;MODE=MySQL;DATABASE_TO_UPPER=false");
        try (Statement statement = connection.createStatement()) {
            statement.execute("create table excel_orders (order_id int primary key, buyer_name varchar(64))");
        }

        DataSourceMetadataService service = createService(connection);
        DataSourceEntity entity = new DataSourceEntity();
        entity.setDataSourceType(DataSourceType.EXCEL);
        ExcelDatasource datasource = new ExcelDatasource();
        datasource.setTableName("excel_orders");
        entity.setDataSource(datasource);

        List<DataSourceColumnMeta> columns = service.listColumns(entity, "excel_orders");

        assertEquals(2, columns.size());
        assertEquals("order_id", columns.get(0).getName());
        assertEquals("buyer_name", columns.get(1).getName());
    }

    @Test
    void listColumnsFallsBackToExcelColumnConfigWhenMetadataIsUnavailable() throws Exception {
        loadH2Driver();
        Connection connection = DriverManager.getConnection("jdbc:h2:mem:metadata_excel_config;MODE=MySQL;DATABASE_TO_UPPER=false");

        DataSourceMetadataService service = createService(connection);
        DataSourceEntity entity = new DataSourceEntity();
        entity.setDataSourceType(DataSourceType.EXCEL);
        ExcelDatasource datasource = new ExcelDatasource();
        datasource.setTableName("excel_customers");
        ExcelColumn customerName = new ExcelColumn();
        customerName.setName("customer_name");
        customerName.setType("VARCHAR");
        datasource.setColumns(List.of(customerName));
        entity.setDataSource(datasource);

        List<DataSourceColumnMeta> columns = service.listColumns(entity, "excel_customers");

        assertEquals(1, columns.size());
        assertEquals("customer_name", columns.get(0).getName());
        assertEquals("VARCHAR", columns.get(0).getType());
    }

    @Test
    void listAppExcelTablesOnlyReturnsExcelPrefixedTables() throws Exception {
        loadH2Driver();
        Connection connection = DriverManager.getConnection("jdbc:h2:mem:metadata_app_excel_tables;MODE=MySQL;DATABASE_TO_UPPER=false");
        try (Statement statement = connection.createStatement()) {
            statement.execute("create table excel_sales (id int primary key)");
            statement.execute("create table excel_orders (id int primary key)");
            statement.execute("create table dr_page (id int primary key)");
        }

        DataSourceMetadataService service = createService(connection);

        List<DataSourceTableMeta> tables = service.listAppExcelTables();

        assertEquals(2, tables.size());
        assertEquals("excel_orders", tables.get(0).getName());
        assertEquals("excel_sales", tables.get(1).getName());
    }

    @Test
    void listAppExcelColumnsReadsExcelPrefixedTableColumns() throws Exception {
        loadH2Driver();
        Connection connection = DriverManager.getConnection("jdbc:h2:mem:metadata_app_excel_columns;MODE=MySQL;DATABASE_TO_UPPER=false");
        try (Statement statement = connection.createStatement()) {
            statement.execute("create table excel_inventory (sku varchar(64), amount int)");
        }

        DataSourceMetadataService service = createService(connection);

        List<DataSourceColumnMeta> columns = service.listAppExcelColumns("excel_inventory");

        assertEquals(2, columns.size());
        assertEquals("sku", columns.get(0).getName());
        assertEquals("amount", columns.get(1).getName());
    }

    private DataSourceMetadataService createService(Connection connection) {
        DataSourceMetadataService service = new DataSourceMetadataService();
        ReflectionTestUtils.setField(service, "appDataSource", new SingleConnectionDataSource(connection, true));
        ReflectionTestUtils.setField(service, "dataRoomConfig", new DataRoomConfig());
        return service;
    }

    private void loadH2Driver() throws ClassNotFoundException {
        Class.forName("org.h2.Driver");
    }
}
