package com.gccloud.gcpaas.dataroom.core.mcp.bean;

import lombok.Data;

import java.util.List;

/**
 * 组件完整配置说明。
 * <p>
 * 用于承载 MCP 工具 {@code getComponentConfig} 返回的组件元数据，
 * 数据来源为 {@code mcp/component-configs/{componentName}.config.json}。
 */
@Data
public class ComponentConfig {

    /**
     * 组件名称，也是前端组件类型标识，例如 DrText、DrBarChart。
     */
    private String componentName;

    /**
     * 组件展示名称，用于在组件库、MCP 响应或提示信息中展示给用户。
     */
    private String displayName;

    /**
     * 组件能力描述，通常包含组件用途、别名或可匹配的关键词。
     */
    private String description;

    /**
     * 组件扁平化配置字段列表。
     * <p>
     * 字段路径使用点号表示嵌套结构，例如 {@code props.textStyle.fontSize}。
     */
    private List<ComponentConfigField> fields;
}
