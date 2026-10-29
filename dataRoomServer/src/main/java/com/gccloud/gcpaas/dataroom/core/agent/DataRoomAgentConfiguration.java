package com.gccloud.gcpaas.dataroom.core.agent;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.agentscope.core.agent.Agent;
import io.agentscope.core.model.Model;
import io.agentscope.core.permission.PermissionContextState;
import io.agentscope.core.permission.PermissionMode;
import io.agentscope.extensions.model.dashscope.DashScopeChatModel;
import io.agentscope.extensions.model.dashscope.formatter.DashScopeChatFormatter;
import io.agentscope.extensions.model.openai.OpenAIChatModel;
import io.agentscope.extensions.model.openai.formatter.OpenAIChatFormatter;
import io.agentscope.harness.agent.HarnessAgent;
import io.agentscope.harness.agent.tools.McpServerConfig;
import io.agentscope.harness.agent.tools.ToolsConfig;
import io.agentscope.spring.boot.agui.common.AguiAgentRegistryCustomizer;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * 对话式大屏设计 Agent 配置。
 *
 * <p>通过 AG-UI Spring Boot Starter 暴露 SSE 端点（/dataRoom/agui/run），
 * Agent 使用 HarnessAgent，工作区为固定目录（默认 ./agentWorkspace）：
 * 启动时从 classpath 的 agent-workspace/ 种子目录补齐 AGENTS.md 与 skills/，
 * MCP 默认接入本系统暴露的 dataroom-mcp-server（代码写死），
 * 并合并固定目录下 tools.json 中额外声明的 MCP 服务。
 */
@Slf4j
@Configuration
@ConditionalOnProperty(prefix = "dataroom.agent", name = "enabled", havingValue = "true", matchIfMissing = true)
public class DataRoomAgentConfiguration {

    /**
     * 内置 AG-UI 代理 ID
     */
    public static final String AGENT_ID = "dataroom-designer";

    /**
     * classpath 种子目录中的固定文件清单（新增种子文件时需同步维护）
     */
    private static final String[] SEED_FILES = {
            "AGENTS.md",
            "skills/dataroom-page/SKILL.md",
            "skills/dataroom-page/refrence/dataset.md",
    };

    private static final ObjectMapper MAPPER = new ObjectMapper().registerModule(new JavaTimeModule());

    @Resource
    private AgentProperties agentProperties;
    @Resource
    private InternalMcpTokenService internalMcpTokenService;
    @Resource
    private Environment environment;

    private Path workspacePath;
    private volatile boolean mcpAvailable = false;

    @PostConstruct
    public void init() {
        workspacePath = Path.of(agentProperties.getWorkspaceDir()).toAbsolutePath().normalize();
        seedWorkspace();
        mcpAvailable = internalMcpTokenService.ensureInternalToken(
                agentProperties.getInternalTokenAccount(), agentProperties.getInternalTokenName());
        if (!mcpAvailable) {
            log.warn("内置MCP令牌不可用，Agent 将无法调用大屏设计工具，仅保留对话能力");
        }
    }

    /**
     * 注册 AG-UI 代理工厂。server-side-memory 开启时，同一线程（threadId）复用同一 Agent 实例。
     */
    @org.springframework.context.annotation.Bean
    public AguiAgentRegistryCustomizer dataRoomAguiAgentRegistryCustomizer() {
        return registry -> registry.registerFactory(AGENT_ID, this::createAgent);
    }

    private Agent createAgent() {
        AgentProperties.Model modelConfig = agentProperties.getModel();
        HarnessAgent.Builder builder = HarnessAgent.builder()
                .name(AGENT_ID)
                .agentId(AGENT_ID)
                .model(buildModel(modelConfig))
                .workspace(workspacePath)
                .maxIters(modelConfig.getMaxIters())
                // 安全边界：禁止任意命令执行与网页访问，Agent 只能通过 MCP 工具操作系统
                .disableShellTool()
                .disableWebTools()
                // 工具面已收敛到 MCP 与平台工具，默认权限模式下所有工具调用都会挂起等待审批，
                // 对话场景无人值守，直接放行（BYPASS）
                .permissionContext(PermissionContextState.builder().mode(PermissionMode.BYPASS).build());
        ToolsConfig toolsConfig = buildToolsConfig();
        if (toolsConfig != null) {
            builder.toolsConfig(toolsConfig);
        }
        return builder.build();
    }

    private Model buildModel(AgentProperties.Model modelConfig) {
        if (StringUtils.isBlank(modelConfig.getApiKey())) {
            log.warn("dataroom.agent.model.api-key 未配置，Agent 调用模型将失败，请在环境变量中配置对应密钥");
        }
        String provider = StringUtils.defaultIfBlank(modelConfig.getProvider(), "dashscope").trim().toLowerCase();
        if ("openai".equals(provider)) {
            OpenAIChatModel.Builder builder = OpenAIChatModel.builder()
                    .apiKey(modelConfig.getApiKey())
                    .modelName(modelConfig.getModelName())
                    .stream(modelConfig.isStream())
                    .formatter(new OpenAIChatFormatter());
            if (StringUtils.isNotBlank(modelConfig.getBaseUrl())) {
                builder.baseUrl(modelConfig.getBaseUrl());
            }
            return builder.build();
        }
        DashScopeChatModel.Builder builder = DashScopeChatModel.builder()
                .apiKey(modelConfig.getApiKey())
                .modelName(modelConfig.getModelName())
                .stream(modelConfig.isStream())
                .enableThinking(modelConfig.isEnableThinking())
                .formatter(new DashScopeChatFormatter());
        if (StringUtils.isNotBlank(modelConfig.getBaseUrl())) {
            builder.baseUrl(modelConfig.getBaseUrl());
        }
        return builder.build();
    }

    /**
     * 构造工具配置：内置本系统 MCP 服务（代码写死），合并固定目录 tools.json 中额外声明的 MCP 服务。
     */
    private ToolsConfig buildToolsConfig() {
        ToolsConfig toolsConfig = loadWorkspaceToolsConfig();
        if (!mcpAvailable) {
            return toolsConfig;
        }
        String mcpUrl = resolveInternalMcpUrl();
        McpServerConfig dataroomServer = new McpServerConfig();
        dataroomServer.setTransport("streamableHttp");
        dataroomServer.setUrl(mcpUrl);
        dataroomServer.setHeaders(Map.of("Authorization", "Bearer " + internalMcpTokenService.getRawToken()));
        Map<String, McpServerConfig> servers = toolsConfig.getMcpServers() == null
                ? new LinkedHashMap<>() : new LinkedHashMap<>(toolsConfig.getMcpServers());
        // 内置服务固定覆盖同名配置
        servers.put(agentProperties.getMcpServerName(), dataroomServer);
        toolsConfig.setMcpServers(servers);
        return toolsConfig;
    }

    /**
     * 读取固定工作区下的 tools.json（可选），仅作为额外 MCP 服务的扩展入口；解析失败时忽略。
     */
    private ToolsConfig loadWorkspaceToolsConfig() {
        Path toolsJson = workspacePath.resolve("tools.json");
        if (!Files.isRegularFile(toolsJson)) {
            return new ToolsConfig();
        }
        try {
            ToolsConfig config = MAPPER.readValue(toolsJson.toFile(), ToolsConfig.class);
            return config == null ? new ToolsConfig() : config;
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return new ToolsConfig();
        }
    }

    private String resolveInternalMcpUrl() {
        String port = environment.getProperty("local.server.port");
        if (StringUtils.isBlank(port)) {
            port = environment.getProperty("server.port", "8081");
        }
        String contextPath = environment.getProperty("server.servlet.context-path", "");
        return "http://127.0.0.1:" + port + contextPath + "/mcp";
    }

    /**
     * 从 classpath 种子目录补齐工作区文件，已存在的文件不覆盖（允许用户在工作区中调整）。
     */
    private void seedWorkspace() {
        for (String relative : SEED_FILES) {
            Path target = workspacePath.resolve(relative);
            if (Files.exists(target)) {
                continue;
            }
            String resourcePath = "agent-workspace/" + relative;
            try (InputStream in = getClass().getClassLoader().getResourceAsStream(resourcePath)) {
                if (in == null) {
                    log.warn("Agent 工作区种子资源缺失：{}", resourcePath);
                    continue;
                }
                Files.createDirectories(target.getParent());
                Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                log.error(ExceptionUtils.getStackTrace(e));
            }
        }
        log.info("Agent 工作区目录：{}", workspacePath);
    }
}
