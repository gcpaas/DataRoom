package com.gccloud.gcpaas.core.constant;

import com.baomidou.mybatisplus.annotation.IEnum;
import com.fasterxml.jackson.annotation.JsonValue;

/**
 * 数据集类型
 */
public enum DatasetType implements IEnum<String> {
    DIRECTORY("directory"),
    JSON("json"),
    HTTP("http"),
    SQL("sql"),
    ES("es");

    public static final String DIRECTORY_TYPE = "directory";
    public static final String JSON_TYPE = "json";
    public static final String HTTP_TYPE = "http";
    public static final String SQL_TYPE = "sql";
    public static final String ES_TYPE = "es";


    private String type;

    DatasetType(String type) {
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
