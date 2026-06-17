package com.gccloud.gcpaas.core.component;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.mcp.ChartComponentMcpToolService;
import com.gccloud.gcpaas.dataroom.core.mcp.PageConfigMcpToolService;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.ComponentConfig;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.ComponentSummary;
import com.gccloud.gcpaas.dataroom.core.mcp.service.ComponentConfigResourceService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.annotation.Tool;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ComponentMcpToolTest {

    private final ChartComponentMcpToolService tool = new ChartComponentMcpToolService(new ComponentConfigResourceService());
    private final PageConfigMcpToolService pageTool = new PageConfigMcpToolService(new ComponentConfigResourceService());

    @Test
    void listComponentsReturnsResourceData() {
        Resp<List<ComponentSummary>> response = tool.listComponents();

        assertEquals(200, response.getCode());
        assertEquals("DrText", response.getData().get(0).getComponentName());
    }

    @Test
    void getComponentConfigReturnsResourceData() {
        Resp<ComponentConfig> response = tool.getComponentConfig("DrText");

        assertEquals(200, response.getCode());
        assertEquals("DrText", response.getData().getComponentName());
        assertEquals("align", response.getData().getFields().get(1).getField());
    }

    @Test
    void methodsAreMcpTools() throws NoSuchMethodException {
        Method listMethod = ChartComponentMcpToolService.class.getMethod("listComponents");
        Method detailMethod = ChartComponentMcpToolService.class.getMethod("getComponentConfig", String.class);

        assertNotNull(listMethod.getAnnotation(Tool.class));
        assertEquals("listComponents", listMethod.getAnnotation(Tool.class).name());
        assertNotNull(detailMethod.getAnnotation(Tool.class));
        assertEquals("getComponentConfig", detailMethod.getAnnotation(Tool.class).name());
    }

    @Test
    void getPageConfigReturnsResourceData() {
        Resp<ComponentConfig> response = pageTool.getPageConfig();

        assertEquals(200, response.getCode());
        assertEquals("PageConfig", response.getData().getComponentName());
        assertEquals("page", response.getData().getFields().get(0).getDefaultValue());
    }

    @Test
    void getVisualScreenPageConfigReturnsResourceData() {
        Resp<ComponentConfig> response = pageTool.getVisualScreenPageConfig();

        assertEquals(200, response.getCode());
        assertEquals("VisualScreenPageConfig", response.getData().getComponentName());
        assertEquals("visualScreen", response.getData().getFields().get(0).getDefaultValue());
    }

    @Test
    void pageConfigMethodsAreMcpTools() throws NoSuchMethodException {
        Method pageMethod = PageConfigMcpToolService.class.getMethod("getPageConfig");
        Method visualScreenMethod = PageConfigMcpToolService.class.getMethod("getVisualScreenPageConfig");

        assertNotNull(pageMethod.getAnnotation(Tool.class));
        assertEquals("getPageConfig", pageMethod.getAnnotation(Tool.class).name());
        assertNotNull(visualScreenMethod.getAnnotation(Tool.class));
        assertEquals("getVisualScreenPageConfig", visualScreenMethod.getAnnotation(Tool.class).name());
    }
}
