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
    RELATIONAL("relational");

    public static final String DIRECTORY_TYPE = "directory";
    public static final String JSON_TYPE = "json";
    public static final String HTTP_TYPE = "http";
    public static final String RELATIONAL_TYPE = "relational";


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
