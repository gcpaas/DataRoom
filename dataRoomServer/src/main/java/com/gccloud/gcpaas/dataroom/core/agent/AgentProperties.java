package com.gccloud.gcpaas.dataroom.core.agent;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/**
 * 对话式大屏设计 Agent 配置。模型通过 YAML 配置，API Key 使用环境变量引用，不落地真实密钥。
 */
@Data
@Component
@ConfigurationProperties(prefix = "dataroom.agent")
public class AgentProperties {

    /**
     * 是否启用 Agent 对话功能
     */
    private boolean enabled = true;

    /**
     * Agent 工作区固定目录，包含 AGENTS.md、skills/、tools.json（可选扩展 MCP）。
     * 相对路径基于服务启动目录。
     */
    private String workspaceDir = "./agentWorkspace";

    /**
     * 内置 MCP 服务名（连接本系统暴露的 dataroom-mcp-server）
     */
    private String mcpServerName = "dataroom";

    /**
     * 内置 MCP 令牌名称（启动时自动创建/轮换，仅内存持有明文）
     */
    private String internalTokenName = "agent-internal";

    /**
     * 内置令牌归属账号（默认管理员）
     */
    private String internalTokenAccount = "admin";

    private Model model = new Model();

    @Data
    public static class Model {
        /**
         * 模型提供方：dashscope（阿里百炼）/ openai（OpenAI 及兼容端点，如 DeepSeek、Kimi）
         */
        private String provider = "dashscope";

        /**
         * 模型名称，如 qwen-plus、gpt-4.1-mini、deepseek-chat
         */
        private String modelName = "qwen-plus";

        /**
         * API Key，必须通过环境变量引用配置，例如 ${DASHSCOPE_API_KEY:}
         */
        private String apiKey = "";

        /**
         * 自定义端点，provider 为 openai 兼容服务时必填，例如 https://api.deepseek.com/v1
         */
        private String baseUrl = "";

        /**
         * 是否流式输出
         */
        private boolean stream = true;

        /**
         * 是否开启思考模式（仅部分模型支持）
         */
        private boolean enableThinking = false;

        /**
         * 最大推理迭代次数
         */
        private int maxIters = 30;
    }
}
