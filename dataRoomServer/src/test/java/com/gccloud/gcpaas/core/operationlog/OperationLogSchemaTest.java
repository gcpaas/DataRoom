package com.gccloud.gcpaas.core.operationlog;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class OperationLogSchemaTest {

    @Test
    void ddlScriptsContainOperationLogTableAndBusinessColumns() throws Exception {
        String h2 = Files.readString(resolvePath("src/main/resources/db/dataroom_h2.all.sql",
                "dataRoomServer/src/main/resources/db/dataroom_h2.all.sql"));
        String mysql = Files.readString(resolvePath("../doc/sql/mysql/dataroom_mysql.all.sql",
                "doc/sql/mysql/dataroom_mysql.all.sql"));
        String pg = Files.readString(resolvePath("../doc/sql/pg/dataroom_pg.all.sql",
                "doc/sql/pg/dataroom_pg.all.sql"));

        assertTrue(h2.contains("dr_operation_log"));
        assertTrue(mysql.contains("dr_operation_log"));
        assertTrue(pg.contains("dr_operation_log"));
        assertTrue(h2.contains("business_type"));
        assertTrue(h2.contains("handler_duration_ms"));
    }

    private Path resolvePath(String... candidates) {
        for (String candidate : candidates) {
            Path path = Path.of(candidate);
            if (Files.exists(path)) {
                return path;
            }
        }
        throw new IllegalStateException("DDL脚本不存在");
    }
}
