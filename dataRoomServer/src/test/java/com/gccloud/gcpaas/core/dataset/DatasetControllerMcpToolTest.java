package com.gccloud.gcpaas.core.dataset;

import com.gccloud.gcpaas.core.config.DataRoomMcpConfiguration;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.ToolCallbackProvider;
import org.springframework.context.annotation.Bean;

import java.io.IOException;
import java.io.InputStream;
import java.lang.annotation.Annotation;
import java.lang.reflect.Method;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class DatasetControllerMcpToolTest {

    @Test
    void datasetRunEndpointIsExposedAsSpringAiTool() throws Exception {
        Method run = DatasetController.class.getDeclaredMethod("run", DatasetRunRequest.class);
        Annotation tool = findAnnotation(run, "org.springframework.ai.tool.annotation.Tool");

        assertNotNull(tool);
        assertEquals("runDataRoomDataset", annotationValue(tool, "name"));
        assertTrue(annotationValue(tool, "description").toString().contains("执行DataRoom数据集"));
    }

    @Test
    void mcpConfigurationRegistersDatasetControllerTools() throws Exception {
        Method method = DataRoomMcpConfiguration.class.getDeclaredMethod("datasetTools", DatasetController.class);

        assertNotNull(method.getAnnotation(Bean.class));
        assertEquals("org.springframework.ai.tool.ToolCallbackProvider", method.getReturnType().getName());

        ToolCallbackProvider provider = new DataRoomMcpConfiguration().datasetTools(new DatasetController());
        assertTrue(Arrays.stream(provider.getToolCallbacks())
                .anyMatch(callback -> callback.getToolDefinition().name().equals("runDataRoomDataset")
                        && callback.getToolDefinition().description().contains("执行DataRoom数据集")));
    }

    @Test
    void yamlConfiguresAuthenticatedDataRoomMcpEndpoint() throws IOException {
        String applicationBase = readResource("/application-base.yml");

        assertTrue(applicationBase.contains("ai:"));
        assertTrue(applicationBase.contains("mcp:"));
        assertTrue(applicationBase.contains("server:"));
        assertTrue(applicationBase.contains("protocol: streamable"));
        assertTrue(applicationBase.contains("streamable-http:"));
        assertTrue(applicationBase.contains("mcp-endpoint: /mcp/sse"));
    }

    private Annotation findAnnotation(Method method, String annotationClassName) {
        return Arrays.stream(method.getAnnotations())
                .filter(annotation -> annotation.annotationType().getName().equals(annotationClassName))
                .findFirst()
                .orElse(null);
    }

    private Object annotationValue(Annotation annotation, String methodName) throws Exception {
        return annotation.annotationType().getDeclaredMethod(methodName).invoke(annotation);
    }

    private String readResource(String path) throws IOException {
        try (InputStream inputStream = DatasetControllerMcpToolTest.class.getResourceAsStream(path)) {
            assertNotNull(inputStream);
            return new String(inputStream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }
}
