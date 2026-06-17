package com.gccloud.gcpaas.dataroom.core.mcp;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.ComponentConfig;
import com.gccloud.gcpaas.dataroom.core.mcp.service.ComponentConfigResourceService;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

/**
 * 页面配置 MCP 工具。
 * <p>
 * 向 Spring AI 暴露页面和大屏基础配置查询能力，供客户端获取页面初始化所需的
 * 扁平化配置字段说明。
 */
@Component
public class PageConfigMcpToolService {

    /**
     * 组件配置资源读取服务。
     */
    private final ComponentConfigResourceService componentConfigResourceService;

    /**
     * 创建页面配置 MCP 工具实例。
     *
     * @param componentConfigResourceService 组件配置资源读取服务
     */
    public PageConfigMcpToolService(ComponentConfigResourceService componentConfigResourceService) {
        this.componentConfigResourceService = componentConfigResourceService;
    }

    /**
     * 获取网格化页面设计器页面基础配置。
     *
     * @return 统一响应包装的页面配置字段说明
     */
    @Tool(name = "getPageConfig", description = "获取PageDesigner网格化页面设计器的页面基础配置；" +
            "返回页面扁平化配置字段列表，初始化页面时需要将fields直接转为JSON树的结构")
    public Resp<ComponentConfig> getPageConfig() {
        return Resp.success(componentConfigResourceService.getPageConfig());
    }

    /**
     * 获取像素级自由布局大屏设计器页面基础配置。
     *
     * @return 统一响应包装的大屏页面配置字段说明
     */
    @Tool(name = "getVisualScreenPageConfig", description = "获取VisualScreenDesigner像素级自由布局大屏设计器的页面基础配置；" +
            "返回大屏页面扁平化配置字段列表，初始化大屏时需要将fields直接转为JSON树的结构")
    public Resp<ComponentConfig> getVisualScreenPageConfig() {
        return Resp.success(componentConfigResourceService.getVisualScreenPageConfig());
    }
}
