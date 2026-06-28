package com.gccloud.gcpaas.dataroom.core.constant;

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
    GREATDB("greatdb"),
    SQLSERVER("sqlserver"),
    MONGODB("mongodb"),
    KINGBASE("kingbase"),
    CLICKHOUSE("clickhouse"),
    MARIADB("mariadb"),
    OCEANBASE("oceanbase"),
    H2("h2"),
    POLARDB("polardb"),
    HIVE("hive"),
    TDENGINE("tdengine"),
    DRUID("druid"),
    ES("es"),
    HTTP("http"),
    EXCEL("excel"),
    MQTT("mqtt"),
    TIDB("tidb"),
    STARROCKS("starrocks");

    public static final String MYSQL_TYPE = "mysql";
    public static final String POSTGRESQL_TYPE = "postgresql";
    public static final String ORACLE_TYPE = "oracle";
    public static final String DORIS_TYPE = "doris";
    public static final String DAMENG_TYPE = "dameng";
    public static final String DB2_TYPE = "db2";
    public static final String GBASE_TYPE = "gbase";
    public static final String GOLDENDB_TYPE = "goldendb";
    public static final String GREATDB_TYPE = "greatdb";
    public static final String SQLSERVER_TYPE = "sqlserver";
    public static final String MONGODB_TYPE = "mongodb";
    public static final String KINGBASE_TYPE = "kingbase";
    public static final String CLICKHOUSE_TYPE = "clickhouse";
    public static final String MARIADB_TYPE = "mariadb";
    public static final String OCEANBASE_TYPE = "oceanbase";
    public static final String H2_TYPE = "h2";
    public static final String POLARDB_TYPE = "polardb";
    public static final String HIVE_TYPE = "hive";
    public static final String TDENGINE_TYPE = "tdengine";
    public static final String DRUID_TYPE = "druid";
    public static final String ES_TYPE = "es";
    public static final String HTTP_TYPE = "http";
    public static final String EXCEL_TYPE = "excel";
    public static final String MQTT_TYPE = "mqtt";
    public static final String TIDB_TYPE = "tidb";
    public static final String STARROCKS_TYPE = "starrocks";


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
