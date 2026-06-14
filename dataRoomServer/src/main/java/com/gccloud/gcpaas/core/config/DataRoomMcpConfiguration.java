package com.gccloud.gcpaas.core.config;

import com.gccloud.gcpaas.core.dataset.DatasetController;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.ai.tool.method.MethodToolCallbackProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataRoomMcpConfiguration {

    @Bean
    public ToolCallbackProvider datasetTools(DatasetController datasetController) {
        return MethodToolCallbackProvider.builder()
                .toolObjects(datasetController)
                .build();
    }
}
