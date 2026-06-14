package com.gccloud.gcpaas.core.component.service;

import com.gccloud.gcpaas.core.component.bean.ComponentConfig;
import com.gccloud.gcpaas.core.component.bean.ComponentSummary;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class ComponentConfigResourceServiceTest {

    private final ComponentConfigResourceService service = new ComponentConfigResourceService();

    @Test
    void listComponentsReadsIndexJson() {
        List<ComponentSummary> components = service.listComponents();

        assertEquals(2, components.size());
        assertEquals("DrText", components.get(0).getComponentName());
        assertEquals("文本", components.get(0).getDisplayName());
        assertEquals("文字、文本、数字", components.get(0).getDescription());
    }

    @Test
    void getComponentConfigReadsComponentFile() {
        ComponentConfig config = service.getComponentConfig("DrText");

        assertEquals("DrText", config.getComponentName());
        assertEquals("文本", config.getDisplayName());
        assertEquals(2, config.getFields().size());
        assertEquals("align", config.getFields().get(1).getField());
        assertEquals("enum", config.getFields().get(1).getType());
        assertEquals(List.of("left", "center", "right"), config.getFields().get(1).getOptions());
    }

    @Test
    void getComponentConfigRejectsBlankName() {
        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.getComponentConfig(" "));

        assertEquals("组件名称不能为空", exception.getMessage());
    }

    @Test
    void getComponentConfigReportsAvailableNamesWhenMissing() {
        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.getComponentConfig("MissingComponent"));

        assertTrue(exception.getMessage().contains("组件不存在: MissingComponent"));
        assertTrue(exception.getMessage().contains("DrText"));
    }

    @Test
    void getComponentConfigRejectsStaleDetailFileWhenMissingFromIndex() {
        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.getComponentConfig("DrStale"));

        assertTrue(exception.getMessage().contains("组件不存在: DrStale"));
        assertTrue(exception.getMessage().contains("DrText"));
    }

    @Test
    void getComponentConfigReportsExportCommandWhenDetailFileIsMissing() {
        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.getComponentConfig("DrMissingDetail"));

        assertTrue(exception.getMessage().contains("组件配置文件不存在: DrMissingDetail"));
        assertTrue(exception.getMessage().contains("npm run export:component-configs"));
    }
}
