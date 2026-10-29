package com.gccloud.gcpaas.core.component;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class AgentTaskSchemaTest {

    private static final List<String> PAGE_COLUMNS = List.of("page_code", "page_name", "page_type");
    private static final List<String> RETAINED_COLUMNS = List.of(
            "id", "thread_id", "title", "transcript", "create_date", "create_user",
            "update_date", "update_user", "tenant_code", "del_flag");
    private static final String TRANSCRIPT = "[{\"content\":\"历史对话" + "原文".repeat(3000)
            + "\",\"pageResult\":{\"action\":\"created\",\"pageCode\":\"p1\",\"pageName\":\"页面一\",\"pageType\":\"page\"}}]";

    @Test
    void h2EmptyDatabaseCreatesOnlyCurrentColumnsAndKeepsConstraints() throws Exception {
        try (Connection connection = openConnection()) {
            executeH2Ddl(connection);
            assertCurrentColumns(connection);
            insertTasks(connection);
            try (Statement statement = connection.createStatement()) {
                assertThrows(SQLException.class, () -> statement.executeUpdate(
                        "INSERT INTO dr_agent_task (id, thread_id, title) VALUES ('duplicate', 'thread-1', '重复线程')"));
                assertThrows(SQLException.class, () -> statement.executeUpdate(
                        "INSERT INTO dr_agent_task (id, thread_id, title) VALUES ('task-1', 'new-thread', '重复主键')"));
                assertThrows(SQLException.class, () -> statement.executeUpdate(
                        "INSERT INTO dr_agent_task (id, thread_id) VALUES ('missing-title', 'new-thread')"));
                assertThrows(SQLException.class, () -> statement.executeUpdate(
                        "INSERT INTO dr_agent_task (id, title) VALUES ('missing-thread', '缺少线程')"));
            }
        }
    }

    @Test
    void h2OldSchemaUpgradePreservesAllTaskFieldsAndTranscriptOnRepeatedExecution() throws Exception {
        try (Connection connection = openConnection()) {
            createLegacyTable(connection);
            insertTasks(connection);
            try (Statement statement = connection.createStatement()) {
                statement.executeUpdate("UPDATE dr_agent_task SET page_code = 'p1', page_name = '旧页面摘要', page_type = 'page'");
            }
            List<List<String>> before = readTasks(connection);
            assertEquals(3, before.size());

            executeH2Ddl(connection);
            assertCurrentColumns(connection);
            assertEquals(before, readTasks(connection), "升级不能丢任务行或修改 transcript 及其他字段");

            executeH2Ddl(connection);
            assertCurrentColumns(connection);
            assertEquals(before, readTasks(connection), "旧库升级后重复执行必须保留全部数据");
        }
    }

    @Test
    void h2CurrentSchemaRepeatedInitializationPreservesAllTaskData() throws Exception {
        try (Connection connection = openConnection()) {
            executeH2Ddl(connection);
            insertTasks(connection);
            List<List<String>> before = readTasks(connection);

            executeH2Ddl(connection);
            executeH2Ddl(connection);

            assertCurrentColumns(connection);
            assertEquals(before, readTasks(connection), "重复初始化不能清空任务或重写 transcript");
        }
    }

    @Test
    void h2UpgradeSupportsEveryPartiallyMissingPageColumnCombination() throws Exception {
        // 六种非空、非全集组合，覆盖任意一列或两列已删除的中断升级状态。
        for (int missingMask = 1; missingMask < 7; missingMask++) {
            try (Connection connection = openConnection()) {
                createLegacyTable(connection);
                insertTasks(connection);
                try (Statement statement = connection.createStatement()) {
                    for (int index = 0; index < PAGE_COLUMNS.size(); index++) {
                        if ((missingMask & (1 << index)) != 0) {
                            statement.execute("ALTER TABLE dr_agent_task DROP COLUMN " + PAGE_COLUMNS.get(index));
                        }
                    }
                }
                List<List<String>> before = readTasks(connection);

                executeH2Ddl(connection);
                executeH2Ddl(connection);

                assertCurrentColumns(connection);
                assertEquals(before, readTasks(connection), "部分列缺失时仍须保留任务全部数据，组合=" + missingMask);
            }
        }
    }

    @Test
    void h2ScriptDocumentsAutomaticStartupAndBackupRecovery() throws Exception {
        String sql = Files.readString(resolveH2Ddl());
        assertTrue(sql.contains("启动时会自动执行"));
        assertTrue(sql.contains("升级启动前必须先备份"));
        assertBackupContract(sql);
        assertAgentTableContract(sql, "CLOB");
        assertDropIfExistsContract(sql);
    }

    // MySQL/PG 仅做 SQL 文本契约检查，未连接或验证真实数据库；不能据此宣称三库实测通过。
    @Test
    void mysqlScriptsUseCurrentDatabaseMetadataAndFixedColumnWhitelist() throws Exception {
        String upgrade = readSql("dataroom_agent_task.mysql.upgrade.sql");
        String full = readSql("dataroom_mysql.all.sql");
        assertTrue(full.endsWith(upgrade), "全量脚本必须包含与增量脚本完全相同的 Agent 任务建表和升级逻辑");
        for (String sql : List.of(full, upgrade)) {
            assertAgentTableContract(sql, "LONGTEXT");
            assertBackupContract(sql);
            String agentSql = sql.substring(sql.indexOf("CREATE TABLE IF NOT EXISTS dr_agent_task"));
            assertTrue(agentSql.contains("ENGINE=InnoDB DEFAULT CHARSET=utf8mb4"));
            for (String column : PAGE_COLUMNS) {
                String expected = """
                        SET @dr_agent_task_drop_sql = IF(
                            EXISTS (
                                SELECT 1
                                FROM information_schema.columns
                                WHERE table_schema = DATABASE()
                                  AND table_name = 'dr_agent_task'
                                  AND column_name = '%s'
                            ),
                            'ALTER TABLE `dr_agent_task` DROP COLUMN `%s`',
                            'SELECT 1'
                        );
                        PREPARE dr_agent_task_drop_%s FROM @dr_agent_task_drop_sql;
                        EXECUTE dr_agent_task_drop_%s;
                        DEALLOCATE PREPARE dr_agent_task_drop_%s;
                        """.formatted(column, column, column, column, column);
                assertTrue(agentSql.contains(expected), "仅允许检查当前库并执行固定列 DDL：" + column);
            }
            assertFalse(agentSql.contains("CONCAT("), "删列 DDL 不应拼接外部标识符");
        }
    }

    @Test
    void postgresScriptsUseIdempotentColumnDrops() throws Exception {
        String upgrade = readSql("dataroom_agent_task.pg.upgrade.sql");
        String full = readSql("dataroom_pg.all.sql");
        assertTrue(full.endsWith(upgrade), "全量脚本必须包含与增量脚本完全相同的 Agent 任务建表和升级逻辑");
        for (String sql : List.of(full, upgrade)) {
            assertAgentTableContract(sql, "TEXT");
            assertBackupContract(sql);
            assertDropIfExistsContract(sql);
            for (String column : PAGE_COLUMNS) {
                assertFalse(sql.contains("COMMENT ON COLUMN dr_agent_task." + column), "不能再引用已删除列的注释");
            }
        }
    }

    private void assertAgentTableContract(String sql, String transcriptType) {
        Matcher table = Pattern.compile("CREATE TABLE IF NOT EXISTS dr_agent_task\\s*\\((.*?)\\n\\)\\s*(?:ENGINE=.*?)?;",
                Pattern.DOTALL).matcher(sql);
        assertTrue(table.find(), "必须包含 Agent 任务建表语句");
        String definition = table.group(1);
        for (String column : PAGE_COLUMNS) {
            assertFalse(definition.contains(column), "新表不应定义 " + column);
        }
        for (String column : RETAINED_COLUMNS) {
            assertTrue(Pattern.compile("(?m)^\\s*" + column + "\\s+").matcher(definition).find(),
                    "必须保留字段 " + column);
        }
        assertTrue(Pattern.compile("transcript\\s+" + transcriptType + "\\b").matcher(definition).find());
        assertTrue(definition.contains("PRIMARY KEY (id)"));
        assertTrue(definition.contains("CONSTRAINT uk_agent_task_thread UNIQUE (thread_id)"));
        assertTrue(sql.contains("idx_agent_task_user"));
        String agentSql = sql.substring(table.start()).toUpperCase(Locale.ROOT);
        assertFalse(Pattern.compile("\\b(DROP\\s+TABLE|TRUNCATE|DELETE\\s+FROM|UPDATE\\s+DR_AGENT_TASK)\\b")
                .matcher(agentSql).find(), "Agent 任务升级不得删表、清空或重写任务数据");
        assertFalse(Pattern.compile("DROP\\s+COLUMN\\s+(IF\\s+EXISTS\\s+)?[`\"]?TRANSCRIPT")
                .matcher(agentSql).find(), "不得删除 transcript");
    }

    private void assertBackupContract(String sql) {
        assertTrue(sql.contains("先备份 dr_agent_task 的结构和全部数据"));
        assertTrue(sql.contains("永久删除 page_code/page_name/page_type 三列页面摘要"));
        assertTrue(sql.contains("保留任务行、其他字段及 transcript 对话记录原文"));
        assertTrue(sql.contains("失败或需要回滚时停止写入，并从备份恢复结构和数据"));
    }

    private void assertDropIfExistsContract(String sql) {
        for (String column : PAGE_COLUMNS) {
            assertTrue(sql.contains("ALTER TABLE dr_agent_task DROP COLUMN IF EXISTS " + column + ";"));
        }
    }

    private Connection openConnection() throws SQLException {
        // 仅创建独立 H2 内存库，关闭连接即释放，不读取应用的数据源配置。
        return DriverManager.getConnection("jdbc:h2:mem:agent_task_" + UUID.randomUUID()
                + ";CASE_INSENSITIVE_IDENTIFIERS=TRUE");
    }

    private void createLegacyTable(Connection connection) throws SQLException {
        try (Statement statement = connection.createStatement()) {
            statement.execute("""
                    CREATE TABLE dr_agent_task (
                        id VARCHAR(50) NOT NULL PRIMARY KEY,
                        thread_id VARCHAR(100) NOT NULL,
                        title VARCHAR(100) NOT NULL,
                        page_code VARCHAR(100),
                        page_name VARCHAR(255),
                        page_type VARCHAR(50),
                        transcript CLOB,
                        create_date TIMESTAMP,
                        create_user VARCHAR(50),
                        update_date TIMESTAMP,
                        update_user VARCHAR(50),
                        tenant_code VARCHAR(50),
                        del_flag VARCHAR(1) DEFAULT '0',
                        CONSTRAINT uk_agent_task_thread UNIQUE (thread_id)
                    )
                    """);
            statement.execute("CREATE INDEX idx_agent_task_user ON dr_agent_task(create_user, del_flag)");
        }
    }

    private void insertTasks(Connection connection) throws SQLException {
        try (PreparedStatement statement = connection.prepareStatement("""
                INSERT INTO dr_agent_task
                    (id, thread_id, title, transcript, create_date, create_user,
                     update_date, update_user, tenant_code, del_flag)
                VALUES (?, ?, ?, ?, TIMESTAMP '2026-01-01 10:20:30', 'creator',
                        TIMESTAMP '2026-01-02 11:22:33', 'updater', 'tenant-a', ?)
                """)) {
            for (int index = 1; index <= 3; index++) {
                statement.setString(1, "task-" + index);
                statement.setString(2, "thread-" + index);
                statement.setString(3, "历史任务" + index);
                statement.setString(4, index == 1 ? TRANSCRIPT : index == 2 ? "[]" : null);
                statement.setString(5, index == 2 ? "1" : "0");
                assertEquals(1, statement.executeUpdate());
            }
        }
    }

    private List<List<String>> readTasks(Connection connection) throws SQLException {
        List<List<String>> rows = new ArrayList<>();
        try (Statement statement = connection.createStatement();
             ResultSet resultSet = statement.executeQuery(
                     "SELECT " + String.join(", ", RETAINED_COLUMNS) + " FROM dr_agent_task ORDER BY id")) {
            while (resultSet.next()) {
                List<String> row = new ArrayList<>();
                for (String column : RETAINED_COLUMNS) {
                    row.add(resultSet.getString(column));
                }
                rows.add(row);
            }
        }
        return rows;
    }

    private void assertCurrentColumns(Connection connection) throws SQLException {
        Set<String> columns = new HashSet<>();
        try (PreparedStatement statement = connection.prepareStatement("""
                SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
                WHERE TABLE_SCHEMA = CURRENT_SCHEMA() AND TABLE_NAME = 'DR_AGENT_TASK'
                """); ResultSet resultSet = statement.executeQuery()) {
            while (resultSet.next()) {
                columns.add(resultSet.getString(1).toLowerCase(Locale.ROOT));
            }
        }
        assertEquals(new HashSet<>(RETAINED_COLUMNS), columns, "只删除三个页面摘要列，保留其余全部列");
    }

    private void executeH2Ddl(Connection connection) {
        new ResourceDatabasePopulator(new FileSystemResource(resolveH2Ddl())).populate(connection);
    }

    private String readSql(String name) throws Exception {
        return Files.readString(resolvePath("../doc/sql/" + name, "doc/sql/" + name));
    }

    private Path resolveH2Ddl() {
        return resolvePath("src/main/resources/h2/dataroom_h2.all.sql",
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
