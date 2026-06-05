package com.gccloud.gcpaas.core.datasource.bean;

import lombok.Data;

/**
 * Excel列定义
 */
@Data
public class ExcelColumn {

    /**
     * 数据库列名
     */
    private String name;

    /**
     * 列类型: VARCHAR / INTEGER / DECIMAL / DATE
     */
    private String type;

    /**
     * 是否主键
     */
    private boolean primaryKey;

    /**
     * Excel 原始表头
     */
    private String originalHeader;
}
