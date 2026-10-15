package com.gccloud.gcpaas.dataroom.core.mcp.bean;

import lombok.Data;

/**
 * 组件可绑定的数据集字段定义。
 * <p>
 * 描述组件支持的维度、指标、属性等绑定字段，数据来源为前端组件
 * {@code install.ts} 中的 {@code datasetFields} 声明。
 */
@Data
public class ComponentDatasetField {

    /**
     * 字段名称，作为组件配置中 dataset.fields 字段绑定的 key。
     */
    private String name;

    /**
     * 字段说明，描述该绑定字段的用途。
     */
    private String desc;

    /**
     * 是否必填。
     */
    private boolean required;

    /**
     * 是否可绑定多个数据集字段。
     */
    private boolean multiple;
}
