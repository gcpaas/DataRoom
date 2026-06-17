package com.gccloud.gcpaas.dataroom.core.mcp;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.ComponentConfig;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.ComponentSummary;
import com.gccloud.gcpaas.dataroom.core.mcp.service.ComponentConfigResourceService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 组件配置 MCP 工具。
 * <p>
 * 向 Spring AI 暴露组件列表查询和组件配置查询能力，供客户端按组件名称获取
 * 前端可视化组件的初始化配置字段说明。
 */
@Component
public class ChartComponentMcpToolService {

    /**
     * 组件配置资源读取服务。
     */
    private final ComponentConfigResourceService componentConfigResourceService;

    /**
     * 创建组件配置 MCP 工具实例。
     *
     * @param componentConfigResourceService 组件配置资源读取服务
     */
    public ChartComponentMcpToolService(ComponentConfigResourceService componentConfigResourceService) {
        this.componentConfigResourceService = componentConfigResourceService;
    }

    /**
     * 获取当前系统可用组件列表。
     *
     * @return 统一响应包装的组件概要列表，组件名称可作为 {@link #getComponentConfig(String)} 的入参
     */
    @Tool(name = "listComponents", description = "获取当前系统可用组件列表。返回componentName、displayName和description;" +
            "componentName可作为getComponentConfig工具的入参")
    public Resp<List<ComponentSummary>> listComponents() {
        return Resp.success(componentConfigResourceService.listComponents());
    }

    /**
     * 根据组件名称获取组件详细配置。
     *
     * @param componentName 组件名称，例如 DrText、DrBarChart
     * @return 统一响应包装的组件完整配置，包含组件元数据和扁平化字段列表
     */
    @Tool(name = "getComponentConfig", description = "根据组件名称获取组件详细配置，参数componentName为组件名称，例如DrText；" +
            "返回组件扁平化配置字段列表，初始化组件时需要将fields直接转为JSON树的结构，只需要fields字段信息")
    public Resp<ComponentConfig> getComponentConfig(String componentName) {
        return Resp.success(componentConfigResourceService.getComponentConfig(componentName));
    }
}
