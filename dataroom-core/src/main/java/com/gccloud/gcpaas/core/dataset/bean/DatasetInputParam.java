package com.gccloud.gcpaas.core.dataset.bean;

import lombok.Data;

/**
 * 入参
 */
@Data
public class DatasetInputParam {
    /**
     * 参数名称
     */
    private String name;
    /**
     * 描述
     */
    private String desc;
    /**
     * 类型
     */
    private String type;
    /**
     * 是否必传入
     */
    private Boolean required;
    /**
     * 默认值
     */
    private Object defaultVal;
    /**
     * 测试值
     */
    private Object testVal;
}
