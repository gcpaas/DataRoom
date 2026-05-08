package com.gccloud.gcpaas.core.dataset.bean;

import lombok.Data;

/**
 * 出参
 */
@Data
public class DatasetOutputParam {
    /**
     * 参数名称
     */
    private String name;
    /**
     * 类型
     */
    private String type;
    /**
     * 描述
     */
    private String desc;
}
