package com.gccloud.gcpaas.core.operationlog;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.ResultSet;
import java.sql.Statement;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OperationLogSchemaTest {

    @Test
    void h2DdlContainsNewOperationLogColumns() throws Exception {
        String h2 = Files.readString(resolveH2Ddl());
        assertTrue(h2.contains("dr_operation_log"), "应包含 dr_operation_log 建表语句");
        assertTrue(h2.contains("operation_summary"), "应包含 operation_summary 列");
        assertTrue(h2.contains("operation_description"), "应包含 operation_description 列");
        assertTrue(h2.contains("business_module"), "应包含 business_module 列");
        assertFalse(h2.contains("business_type"), "不应再包含已废弃的 business_type 列");
        assertFalse(h2.contains("handler_duration_ms"), "不应再包含已废弃的 handler_duration_ms 列");
    }

    // 升级迁移逻辑已内嵌于全量脚本（dataroom_mysql.all.sql / dataroom_pg.all.sql
    // / dataroom_h2.all.sql 中的标记列条件重建），由下方 mysql/postgres 文本断言
    // 及两个 H2 执行用例覆盖；仓库中不存在也不再需要独立迁移脚本，勿再引用。

    @Test
    void mysqlDdlUsesMarkerColumnToRebuildOnlyLegacyOperationLogTable() throws Exception {
        String mysql = Files.readString(resolvePath(
                "../doc/sql/dataroom_mysql.all.sql",
                "doc/sql/dataroom_mysql.all.sql"));

        assertTrue(mysql.contains("information_schema.columns"), "MySQL 应查询字段元数据");
        assertTrue(mysql.contains("table_schema = DATABASE()"), "MySQL 应仅检查当前数据库");
        assertTrue(mysql.contains("PREPARE dr_operation_log_upgrade_stmt"), "MySQL 应条件执行旧表删除");
        assertTrue(mysql.contains("DROP TABLE IF EXISTS `dr_operation_log`"), "MySQL 应删除旧版本表");
        assertTrue(mysql.contains("operation_summary"), "MySQL 应使用 operation_summary 作为版本标志");
        assertTrue(mysql.contains("operation_description"), "MySQL 应包含 operation_description 列");
        assertTrue(mysql.contains("business_module"), "MySQL 应包含 business_module 列");
        assertFalse(mysql.contains("business_type"), "MySQL 不应再包含已废弃列");
        assertFalse(mysql.contains("handler_duration_ms"), "MySQL 不应再包含已废弃列");
    }

    @Test
    void postgresDdlUsesMarkerColumnToRebuildOnlyLegacyOperationLogTable() throws Exception {
        String postgres = Files.readString(resolvePath(
                "../doc/sql/dataroom_pg.all.sql",
                "doc/sql/dataroom_pg.all.sql"));

        assertTrue(postgres.contains("information_schema.columns"), "PostgreSQL 应查询字段元数据");
        assertTrue(postgres.contains("table_schema = current_schema()"), "PostgreSQL 应仅检查当前 Schema");
        assertTrue(postgres.contains("DO $$"), "PostgreSQL 应通过条件代码块删除旧表");
        assertTrue(postgres.contains("DROP TABLE IF EXISTS dr_operation_log"), "PostgreSQL 应删除旧版本表");
        assertTrue(postgres.contains("operation_summary"), "PostgreSQL 应使用 operation_summary 作为版本标志");
        assertTrue(postgres.contains("operation_description"), "PostgreSQL 应包含 operation_description 列");
        assertTrue(postgres.contains("business_module"), "PostgreSQL 应包含 business_module 列");
        assertFalse(postgres.contains("business_type"), "PostgreSQL 不应再包含已废弃列");
        assertFalse(postgres.contains("handler_duration_ms"), "PostgreSQL 不应再包含已废弃列");
    }

    @Test
    void h2DdlPreservesRowsWhenOperationLogAlreadyUsesCurrentSchema() throws Exception {
        Class.forName("org.h2.Driver");
        try (Connection connection = DriverManager.getConnection(
                "jdbc:h2:mem:operation_log_current_schema;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1")) {
            executeH2Ddl(connection);
            try (Statement statement = connection.createStatement()) {
                statement.executeUpdate("INSERT INTO dr_operation_log (id, operation_summary) VALUES ('existing', '已有日志')");
            }

            executeH2Ddl(connection);

            try (Statement statement = connection.createStatement();
                 ResultSet resultSet = statement.executeQuery("SELECT COUNT(*) FROM dr_operation_log WHERE id = 'existing'")) {
                assertTrue(resultSet.next());
                assertEquals(1, resultSet.getInt(1), "新版本表重复初始化时不应清空历史日志");
            }
        }
    }

    @Test
    void h2DdlRebuildsLegacyOperationLogTable() throws Exception {
        Class.forName("org.h2.Driver");
        try (Connection connection = DriverManager.getConnection(
                "jdbc:h2:mem:operation_log_legacy_schema;CASE_INSENSITIVE_IDENTIFIERS=TRUE;DB_CLOSE_DELAY=-1")) {
            try (Statement statement = connection.createStatement()) {
                statement.execute("CREATE TABLE dr_operation_log (id VARCHAR(50) PRIMARY KEY, target_type VARCHAR(64))");
                statement.executeUpdate("INSERT INTO dr_operation_log (id, target_type) VALUES ('legacy', 'page')");
            }

            executeH2Ddl(connection);

            try (Statement statement = connection.createStatement();
                 ResultSet resultSet = statement.executeQuery(
                         "SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS " +
                                 "WHERE TABLE_NAME = 'DR_OPERATION_LOG' AND COLUMN_NAME = 'OPERATION_SUMMARY'")) {
                assertTrue(resultSet.next());
                assertEquals(1, resultSet.getInt(1), "旧版本表应重建为新结构");
            }
            try (Statement statement = connection.createStatement();
                 ResultSet resultSet = statement.executeQuery("SELECT COUNT(*) FROM dr_operation_log")) {
                assertTrue(resultSet.next());
                assertEquals(0, resultSet.getInt(1), "旧版本表重建时允许清空历史日志");
            }
        }
    }

    private void executeH2Ddl(Connection connection) {
        new ResourceDatabasePopulator(new FileSystemResource(resolveH2Ddl())).populate(connection);
    }

    private Path resolveH2Ddl() {
        return resolvePath(
                "src/main/resources/h2/dataroom_h2.all.sql",
                "dataRoomServer/src/main/resources/h2/dataroom_h2.all.sql");
    }

    private Path resolvePath(String... candidates) {
        for (String candidate : candidates) {
            Path path = Path.of(candidate);
            if (Files.exists(path)) {
                return path;
            }
        }
        throw new IllegalStateException("DDL 脚本不存在: " + String.join(", ", candidates));
    }
}
