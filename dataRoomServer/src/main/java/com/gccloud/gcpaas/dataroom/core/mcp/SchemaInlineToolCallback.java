package com.gccloud.gcpaas.dataroom.core.mcp;

import org.springframework.ai.tool.ToolCallback;
import org.springframework.ai.tool.definition.DefaultToolDefinition;
import org.springframework.ai.tool.definition.ToolDefinition;
import org.springframework.ai.tool.metadata.ToolMetadata;
import org.springframework.ai.chat.model.ToolContext;

/**
 * 对 ToolCallback 做 inputSchema 引用内联及数据集枚举契约修正，调用行为完全委托给原回调。
 */
public class SchemaInlineToolCallback implements ToolCallback {

    private final ToolCallback delegate;
    private final ToolDefinition toolDefinition;

    public SchemaInlineToolCallback(ToolCallback delegate) {
        this.delegate = delegate;
        ToolDefinition origin = delegate.getToolDefinition();
        this.toolDefinition = DefaultToolDefinition.builder()
                .name(origin.name())
                .description(origin.description())
                .inputSchema(ToolSchemaInlineSupport.normalizeInputSchema(origin.name(), origin.inputSchema()))
                .build();
    }

    @Override
    public ToolDefinition getToolDefinition() {
        return toolDefinition;
    }

    @Override
    public ToolMetadata getToolMetadata() {
        return delegate.getToolMetadata();
    }

    @Override
    public String call(String toolInput) {
        return delegate.call(toolInput);
    }

    @Override
    public String call(String toolInput, ToolContext toolContext) {
        return delegate.call(toolInput, toolContext);
    }
}
