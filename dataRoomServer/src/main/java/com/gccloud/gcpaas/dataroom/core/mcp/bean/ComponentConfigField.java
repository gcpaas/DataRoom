package com.gccloud.gcpaas.dataroom.core.mcp.bean;

import lombok.Data;

import java.util.List;

/**
 * 组件配置字段说明。
 * <p>
 * 用于描述单个可配置字段的路径、类型、候选值、说明和默认值，
 * MCP 客户端可根据这些信息生成或补全组件 JSON 配置。
 */
@Data
public class ComponentConfigField {

    /**
     * 字段路径。
     * <p>
     * 顶层字段直接使用字段名，嵌套字段使用点号路径，例如 {@code dataset.code}、{@code props.text}。
     */
    private String field;

    /**
     * 字段值类型，例如 string、number、boolean、array、object、enum。
     */
    private String type;

    /**
     * 候选值列表。
     * <p>
     * 通常在 {@code type} 为 {@code enum} 时提供，用于约束字段可选值。
     */
    private List<Object> options;

    /**
     * 字段中文说明，用于解释字段含义、单位或取值规则。
     */
    private String description;

    /**
     * 字段默认值。
     * <p>
     * 该值可为字符串、数字、布尔值、对象或数组，取决于 {@link #type}。
     */
    private Object defaultValue;
}
