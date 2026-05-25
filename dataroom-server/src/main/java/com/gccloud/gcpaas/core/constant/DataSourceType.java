package com.gccloud.gcpaas.core.constant;

import com.baomidou.mybatisplus.annotation.IEnum;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 数据源类型
 */
public enum DataSourceType implements IEnum<String> {
    MYSQL("mysql"),
    POSTGRESQL("postgresql"),
    ORACLE("oracle"),
    DORIS("doris"),
    DAMENG("dameng"),
    DB2("db2"),
    GBASE("gbase"),
    GOLDENDB("goldendb"),
    SQLSERVER("sqlserver"),
    MONGODB("mongodb"),
    KINGBASE("kingbase"),
    CLICKHOUSE("clickhouse"),
    MARIADB("mariadb"),
    ES("es"),
    EXCEL("excel");

    public static final String MYSQL_TYPE = "mysql";
    public static final String POSTGRESQL_TYPE = "postgresql";
    public static final String ORACLE_TYPE = "oracle";
    public static final String DORIS_TYPE = "doris";
    public static final String DAMENG_TYPE = "dameng";
    public static final String DB2_TYPE = "db2";
    public static final String GBASE_TYPE = "gbase";
    public static final String GOLDENDB_TYPE = "goldendb";
    public static final String SQLSERVER_TYPE = "sqlserver";
    public static final String MONGODB_TYPE = "mongodb";
    public static final String KINGBASE_TYPE = "kingbase";
    public static final String CLICKHOUSE_TYPE = "clickhouse";
    public static final String MARIADB_TYPE = "mariadb";
    public static final String ES_TYPE = "es";
    public static final String EXCEL_TYPE = "excel";


    private String type;

    DataSourceType(String type) {
        this.type = type;
    }

    @JsonValue
    public String getType() {
        return type;
    }

    @Override
    public String getValue() {
        return type;
    }
}
