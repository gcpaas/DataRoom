package com.gccloud.dataroom.core.module.dataset.constant;

/**
 * @author LiYong
 * @date 2021.12.16
 */
public enum ReportDbType {
    /**
     * 数据源类型
     */
    MYSQL("Mysql", "mysql"),
    ORACLE("Oracle", "oracle"),
    POSTGRESQL("PostgreSQL", "postgresql"),
    HIVE("Hive", "hive"),
    CLICKHOUSE("ClickHouse", "clickhouse");

    private final String upInfo;

    private final String lowInfo;

    ReportDbType(String upInfo, String lowInfo) {
        this.upInfo = upInfo;
        this.lowInfo = lowInfo;
    }

    public String getLowInfo() {
        return lowInfo;
    }

    public String getUpInfo() {
        return upInfo;
    }

}
