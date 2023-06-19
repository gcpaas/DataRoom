package com.gccloud.dataroom.core.module.dataset.utils;

import com.alibaba.druid.sql.SQLUtils;
import com.alibaba.druid.sql.ast.SQLStatement;
import com.alibaba.druid.sql.ast.statement.SQLUseStatement;
import com.alibaba.druid.sql.visitor.SchemaStatVisitor;
import com.alibaba.druid.stat.TableStat;
import com.alibaba.druid.util.JdbcConstants;

import java.util.*;

/**
 * 从复杂sql中获取表名称
 *
 * @author LiYong on 2021/12/30
 */
public class TableNameUtils {
    public static List<String> getFromTo(String sql) {
        List<SQLStatement> stmts = SQLUtils.parseStatements(sql, JdbcConstants.MYSQL);
        List<String> tableNames = new ArrayList<>();
        if (stmts == null) {
            return null;
        }
        Map<String, TreeSet<String>> map = new HashMap<>();
        String database = "";
        for (SQLStatement stmt : stmts) {
            SchemaStatVisitor statVisitor = SQLUtils.createSchemaStatVisitor(JdbcConstants.MYSQL);
            if (stmt instanceof SQLUseStatement) {
                database = ((SQLUseStatement) stmt).getDatabase().getSimpleName().toUpperCase();
            }
            stmt.accept(statVisitor);
            Map<TableStat.Name, TableStat> tables = statVisitor.getTables();
            if (tables != null) {
                final String db = database;
                tables.forEach((tableName, stat) -> {
                    if (stat.getSelectCount() > 0) {
                        String from = tableName.getName();
                        tableNames.add(from);
                    }
                });
            }
        }
        return tableNames;
    }
}
