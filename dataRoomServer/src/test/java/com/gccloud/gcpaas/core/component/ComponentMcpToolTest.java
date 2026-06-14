package com.gccloud.gcpaas.core.component;

import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.component.bean.ComponentConfig;
import com.gccloud.gcpaas.core.component.bean.ComponentSummary;
import com.gccloud.gcpaas.core.component.service.ComponentConfigResourceService;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.annotation.Tool;

import java.lang.reflect.Method;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

class ComponentMcpToolTest {

    private final ComponentMcpTool tool = new ComponentMcpTool(new ComponentConfigResourceService());

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
        Method listMethod = ComponentMcpTool.class.getMethod("listComponents");
        Method detailMethod = ComponentMcpTool.class.getMethod("getComponentConfig", String.class);

        assertNotNull(listMethod.getAnnotation(Tool.class));
        assertEquals("listComponents", listMethod.getAnnotation(Tool.class).name());
        assertNotNull(detailMethod.getAnnotation(Tool.class));
        assertEquals("getComponentConfig", detailMethod.getAnnotation(Tool.class).name());
    }
}
