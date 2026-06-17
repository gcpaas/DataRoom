package com.gccloud.gcpaas.dataroom.core.datasource.service;

import com.gccloud.gcpaas.dataroom.core.datasource.bean.ExcelColumn;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.*;
import java.util.List;

/**
 * DDL方言工具，根据当前数据库类型生成相应的SQL
 */
@Component
@Slf4j
public class DdlDialectHelper {

    @Resource
    private DataSource dataSource;

    private enum DbType {
        H2, MYSQL, POSTGRESQL
    }

    /**
     * 检测当前数据库类型
     */
    private DbType detectDbType() {
        try (Connection conn = dataSource.getConnection()) {
            String url = conn.getMetaData().getURL().toLowerCase();
            if (url.contains(":mysql:") || url.contains(":mariadb:")) {
                return DbType.MYSQL;
            } else if (url.contains(":postgresql:")) {
                return DbType.POSTGRESQL;
            } else {
                return DbType.H2;
            }
        } catch (SQLException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return DbType.H2;
        }
    }

    /**
     * 生成CREATE TABLE DDL
     */
    public String generateCreateTableSql(String tableName, List<ExcelColumn> columns) {
        DbType dbType = detectDbType();
        StringBuilder sb = new StringBuilder();
        sb.append("CREATE TABLE ").append(quoteIdentifier(tableName, dbType)).append(" (\n");

        String pkColumn = null;
        for (int i = 0; i < columns.size(); i++) {
            ExcelColumn col = columns.get(i);
            if (i > 0) {
                sb.append(",\n");
            }
            sb.append("  ").append(quoteIdentifier(col.getName(), dbType))
                    .append(" ").append(mapColumnType(col.getType(), dbType));

            if (col.isPrimaryKey()) {
                pkColumn = col.getName();
            }
        }

        if (pkColumn != null) {
            sb.append(",\n  PRIMARY KEY (").append(quoteIdentifier(pkColumn, dbType)).append(")");
        }

        sb.append("\n)");

        if (dbType == DbType.MYSQL) {
            sb.append(" ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");
        }

        return sb.toString();
    }

    /**
     * 生成批量INSERT的PreparedStatement SQL
     */
    public String generateInsertSql(String tableName, List<ExcelColumn> columns) {
        DbType dbType = detectDbType();
        StringBuilder sb = new StringBuilder();
        sb.append("INSERT INTO ").append(quoteIdentifier(tableName, dbType)).append(" (");

        for (int i = 0; i < columns.size(); i++) {
            if (i > 0) sb.append(", ");
            sb.append(quoteIdentifier(columns.get(i).getName(), dbType));
        }

        sb.append(") VALUES (");
        for (int i = 0; i < columns.size(); i++) {
            if (i > 0) sb.append(", ");
            sb.append("?");
        }
        sb.append(")");

        return sb.toString();
    }

    /**
     * 生成DELETE FROM SQL
     */
    public String generateDeleteAllSql(String tableName) {
        DbType dbType = detectDbType();
        return "DELETE FROM " + quoteIdentifier(tableName, dbType);
    }

    /**
     * 生成分页查询SQL
     */
    public String generatePageQuerySql(String tableName, int offset, int limit) {
        DbType dbType = detectDbType();
        String quoted = quoteIdentifier(tableName, dbType);
        return "SELECT * FROM " + quoted + " LIMIT " + limit + " OFFSET " + offset;
    }

    /**
     * 生成COUNT SQL
     */
    public String generateCountSql(String tableName) {
        DbType dbType = detectDbType();
        return "SELECT COUNT(*) FROM " + quoteIdentifier(tableName, dbType);
    }

    /**
     * 检查表是否存在
     */
    public boolean tableExists(String tableName) {
        try (Connection conn = dataSource.getConnection()) {
            DatabaseMetaData meta = conn.getMetaData();
            // 尝试多种大小写组合查找表
            try (ResultSet rs = meta.getTables(null, null, tableName, new String[]{"TABLE"})) {
                if (rs.next()) {
                    return true;
                }
            }
            // H2 默认将表名转为大写
            try (ResultSet rs = meta.getTables(null, null, tableName.toUpperCase(), new String[]{"TABLE"})) {
                if (rs.next()) {
                    return true;
                }
            }
            return false;
        } catch (SQLException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new RuntimeException("检查表是否存在失败: " + tableName, e);
        }
    }

    /**
     * 执行DDL
     */
    public void executeDdl(String sql) {
        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement()) {
            stmt.execute(sql);
        } catch (SQLException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new RuntimeException("执行DDL失败: " + sql, e);
        }
    }

    /**
     * 获取数据源连接
     */
    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }

    /**
     * 映射列类型到对应数据库方言
     */
    private String mapColumnType(String type, DbType dbType) {
        return switch (type.toUpperCase()) {
            case "INTEGER" -> dbType == DbType.MYSQL ? "INT" : "INTEGER";
            case "DECIMAL" -> dbType == DbType.POSTGRESQL ? "NUMERIC(18,4)" : "DECIMAL(18,4)";
            case "DATE" -> dbType == DbType.MYSQL ? "DATETIME" : "TIMESTAMP";
            default -> "VARCHAR(512)";
        };
    }

    /**
     * 标识符引用
     */
    private String quoteIdentifier(String identifier, DbType dbType) {
        return switch (dbType) {
            case MYSQL -> "`" + identifier + "`";
            case POSTGRESQL -> "\"" + identifier + "\"";
            case H2 -> "\"" + identifier + "\"";
        };
    }
}
