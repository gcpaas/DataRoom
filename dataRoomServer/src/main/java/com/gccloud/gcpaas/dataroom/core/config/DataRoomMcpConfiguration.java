package com.gccloud.gcpaas.dataroom.core.config;

import com.gccloud.gcpaas.dataroom.core.dataset.DatasetController;
import com.gccloud.gcpaas.dataroom.core.mcp.ChartComponentMcpToolService;
import com.gccloud.gcpaas.dataroom.core.mcp.PageConfigMcpToolService;
import com.gccloud.gcpaas.dataroom.core.mcp.SchemaInlineToolCallback;
import com.gccloud.gcpaas.dataroom.core.page.PageController;
import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Arrays;

@Configuration
public class DataRoomMcpConfiguration {

    /**
     * 注册MCP Tool。注册前对每个工具的 inputSchema 做 $ref 内联展开，
     * 兼容不解析 JSON Schema 引用的 MCP 客户端（AgentScope 等）。
     *
     * @param datasetController 数据集控制器
     * @param pageController 页面控制器
     * @param componentMcpTool 组件配置MCP工具
     * @return ToolCallbackProvider
     */
    @Bean
    public ToolCallbackProvider datasetTools(DatasetController datasetController, PageController pageController, ChartComponentMcpToolService componentMcpTool, PageConfigMcpToolService pageConfigMcpToolService) {
        ToolCallback[] callbacks = MethodToolCallbackProvider.builder()
                .toolObjects(datasetController, pageController, componentMcpTool, pageConfigMcpToolService)
                .build()
                .getToolCallbacks();
        ToolCallback[] wrapped = Arrays.stream(callbacks)
                .map(SchemaInlineToolCallback::new)
                .toArray(ToolCallback[]::new);
        return ToolCallbackProvider.from(wrapped);
    }
}
