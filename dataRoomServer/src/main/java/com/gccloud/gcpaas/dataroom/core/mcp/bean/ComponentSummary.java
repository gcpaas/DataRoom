package com.gccloud.gcpaas.dataroom.core.mcp.bean;

import lombok.Data;

/**
 * 组件概要信息。
 * <p>
 * 用于承载 MCP 工具 {@code listComponents} 返回的组件列表项，
 * 数据来源为 {@code mcp/component-configs/index.json}。
 */
@Data
public class ComponentSummary {

    /**
     * 组件名称，也是获取组件完整配置时使用的入参。
     */
    private String componentName;

    /**
     * 组件展示名称，用于在列表中展示给用户。
     */
    private String displayName;

    /**
     * 组件能力描述，通常包含组件用途、别名或可匹配的关键词。
     */
    private String description;
}
