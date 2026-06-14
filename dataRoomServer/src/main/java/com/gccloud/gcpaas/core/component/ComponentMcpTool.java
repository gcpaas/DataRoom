package com.gccloud.gcpaas.core.component;

import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.component.bean.ComponentConfig;
import com.gccloud.gcpaas.core.component.bean.ComponentSummary;
import com.gccloud.gcpaas.core.component.service.ComponentConfigResourceService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ComponentMcpTool {

    private final ComponentConfigResourceService componentConfigResourceService;

    public ComponentMcpTool(ComponentConfigResourceService componentConfigResourceService) {
        this.componentConfigResourceService = componentConfigResourceService;
    }

    @Tool(name = "listComponents", description = "获取当前系统可用组件列表。返回componentName、displayName和description；componentName可作为getComponentConfig工具的入参。")
    public Resp<List<ComponentSummary>> listComponents() {
        return Resp.success(componentConfigResourceService.listComponents());
    }

    @Tool(name = "getComponentConfig", description = "根据组件名称获取组件详细配置。参数componentName为组件名称，例如DrText；返回组件基础信息和扁平化配置字段列表")
    public Resp<ComponentConfig> getComponentConfig(String componentName) {
        return Resp.success(componentConfigResourceService.getComponentConfig(componentName));
    }
}
