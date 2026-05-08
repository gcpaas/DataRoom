package com.gccloud.gcpaas.core.constant;

import com.baomidou.mybatisplus.annotation.IEnum;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 数据源类型
 */
public enum DataSourceType implements IEnum<String> {
    MYSQL("mysql"),
    POSTGRESQL("postgresql"),
    ORACLE("oracle");

    public static final String MYSQL_TYPE = "mysql";
    public static final String POSTGRESQL_TYPE = "postgresql";
    public static final String ORACLE_TYPE = "oracle";


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
