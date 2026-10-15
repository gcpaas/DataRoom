package com.gccloud.gcpaas.core.component;

import com.gccloud.gcpaas.dataroom.core.dataset.DatasetController;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import org.junit.jupiter.api.Test;
import org.springframework.ai.tool.annotation.Tool;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

/**
 * 数据集 MCP 工具注解测试。
 * <p>
 * 校验 DatasetController 中暴露为 MCP 工具的方法均带有正确命名和中文说明的 {@link Tool} 注解。
 */
class DatasetMcpToolTest {

    @Test
    void insertDatasetIsMcpTool() throws NoSuchMethodException {
        Method method = DatasetController.class.getMethod("insert", DatasetEntity.class);

        assertNotNull(method.getAnnotation(Tool.class));
        assertEquals("insertDataset", method.getAnnotation(Tool.class).name());
    }

    @Test
    void updateDatasetIsMcpTool() throws NoSuchMethodException {
        Method method = DatasetController.class.getMethod("update", DatasetEntity.class);

        assertNotNull(method.getAnnotation(Tool.class));
        assertEquals("updateDataset", method.getAnnotation(Tool.class).name());
    }

    @Test
    void getDatasetDetailIsMcpTool() throws NoSuchMethodException {
        Method method = DatasetController.class.getMethod("detail", String.class);

        assertNotNull(method.getAnnotation(Tool.class));
        assertEquals("getDatasetDetail", method.getAnnotation(Tool.class).name());
    }
}
