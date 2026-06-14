package com.gccloud.gcpaas.core.config;

import com.gccloud.gcpaas.core.dataset.DatasetController;
import com.gccloud.gcpaas.core.page.PageController;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataRoomMcpConfiguration {

    /**
     * 注册MCP Tool
     * @param datasetController
     * @param pageController
     * @return
     */
    @Bean
    public ToolCallbackProvider datasetTools(DatasetController datasetController, PageController pageController) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(datasetController, pageController)
                .build();
    }
}
