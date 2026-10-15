package com.gccloud.gcpaas.dataroom.core.mcp;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.ComponentConfig;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.ComponentSummary;
import com.gccloud.gcpaas.dataroom.core.mcp.service.ComponentConfigResourceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * 组件配置 MCP 工具。
 * <p>
 * 向 Spring AI 暴露组件列表查询和组件配置查询能力，供客户端按组件名称获取
 * 前端可视化组件的初始化配置字段说明。
 */
@Tag(name = "组件配置MCP")
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
    @Operation(summary = "组件列表查询", description = "获取当前系统可用组件列表。返回componentName、displayName和description；componentName可作为getComponentConfig工具的入参")
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
    @Operation(summary = "组件配置查询", description = "根据组件名称获取组件详细配置，参数componentName为组件名称，例如DrText；返回组件扁平化配置字段列表，初始化组件时需要将fields直接转为JSON树的结构，只需要fields字段信息")
    @Tool(name = "getComponentConfig", description = "根据组件名称获取组件详细配置，参数componentName为组件名称，例如DrText；" +
            "返回组件扁平化配置字段列表fields和数据集字段绑定定义datasetFields，初始化组件时需要将fields直接转为JSON树的结构，只需要fields字段信息；" +
            "为组件绑定数据集时，通过dataset.code绑定数据集编码，还必须通过dataset.fields完成字段绑定：" +
            "key必须取自datasetFields中的name（required为true的必须绑定），value为绑定的数据集字段名数组（multiple为true时可绑定多个），" +
            "数据集字段名可通过getDatasetDetail返回的outputList或runDataset的执行结果获取，只绑定数据集不绑定字段组件无法正常展示数据")
    public Resp<ComponentConfig> getComponentConfig(String componentName) {
        return Resp.success(componentConfigResourceService.getComponentConfig(componentName));
    }
}
