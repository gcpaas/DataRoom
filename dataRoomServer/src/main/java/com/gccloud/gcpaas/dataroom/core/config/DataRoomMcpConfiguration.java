package com.gccloud.gcpaas.dataroom.core.config;

import com.gccloud.gcpaas.dataroom.core.dataset.DatasetController;
import com.gccloud.gcpaas.dataroom.core.mcp.ChartComponentMcpToolService;
import com.gccloud.gcpaas.dataroom.core.mcp.PageConfigMcpToolService;
import com.gccloud.gcpaas.dataroom.core.page.PageController;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataRoomMcpConfiguration {

    /**
     * 注册MCP Tool
     *
     * @param datasetController 数据集控制器
     * @param pageController 页面控制器
     * @param componentMcpTool 组件配置MCP工具
     * @return ToolCallbackProvider
     */
    @Bean
    public ToolCallbackProvider datasetTools(DatasetController datasetController, PageController pageController, ChartComponentMcpToolService componentMcpTool, PageConfigMcpToolService pageConfigMcpToolService) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(datasetController, pageController, componentMcpTool,pageConfigMcpToolService)
                .build();
    }
}
