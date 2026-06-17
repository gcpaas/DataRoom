package com.gccloud.gcpaas.dataroom.core.mcp.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.ComponentConfig;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.ComponentSummary;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

/**
 * 组件配置资源读取服务。
 * <p>
 * 负责从 classpath 下的 {@code mcp/component-configs/} 目录读取组件索引和组件配置详情，
 * 为 MCP 工具提供可用组件列表及组件扁平化配置字段。
 */
@Slf4j
@Service
public class ComponentConfigResourceService {

    /**
     * 组件配置资源所在的 classpath 基础目录。
     */
    private static final String BASE_PATH = "mcp/component-configs/";

    /**
     * 前端导出组件配置资源的命令，用于在配置文件缺失时提示开发者。
     */
    private static final String EXPORT_COMMAND = "npm run export:component-configs";

    /**
     * 页面配置类名称列表。
     * <p>
     * 这些配置不出现在组件索引中，但允许通过 {@link #getComponentConfig(String)} 直接读取。
     */
    private static final List<String> PAGE_CONFIG_NAMES = List.of("PageConfig", "VisualScreenPageConfig");

    /**
     * 用于反序列化组件配置 JSON 的 Jackson 对象映射器。
     */
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * 获取当前系统可用组件概要列表。
     *
     * @return 组件概要列表，包含组件名称、展示名称和描述
     * @throws DataRoomException 当组件索引文件不存在或读取失败时抛出
     */
    public List<ComponentSummary> listComponents() {
        ClassPathResource resource = new ClassPathResource(BASE_PATH + "index.json");
        if (!resource.exists()) {
            throw new DataRoomException("组件配置索引文件不存在，请先执行 " + EXPORT_COMMAND);
        }
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, new TypeReference<List<ComponentSummary>>() {
            });
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("组件配置索引文件读取失败", e);
        }
    }

    /**
     * 根据组件名称获取组件完整配置。
     * <p>
     * 普通组件会先通过组件索引校验是否存在，页面配置类允许直接读取对应配置文件。
     *
     * @param componentName 组件名称，例如 DrText、DrBarChart、PageConfig
     * @return 组件完整配置，包含组件元数据和扁平化配置字段列表
     * @throws DataRoomException 当组件名称为空、组件不存在或配置文件读取失败时抛出
     */
    public ComponentConfig getComponentConfig(String componentName) {
        if (StringUtils.isBlank(componentName)) {
            throw new DataRoomException("组件名称不能为空");
        }
        String normalizedName = componentName.trim();
        if (PAGE_CONFIG_NAMES.contains(normalizedName)) {
            return readConfig(normalizedName);
        }
        List<ComponentSummary> components = listComponents();
        boolean componentExists = components.stream()
                .anyMatch(component -> StringUtils.equals(component.getComponentName(), normalizedName));
        if (!componentExists) {
            throw new DataRoomException("组件不存在: " + normalizedName + availableComponentNamesMessage(components));
        }
        return readConfig(normalizedName);
    }

    /**
     * 读取指定名称对应的组件配置文件。
     *
     * @param configName 配置名称，对应 {@code {configName}.config.json}
     * @return 组件完整配置
     * @throws DataRoomException 当配置文件不存在或读取失败时抛出
     */
    private ComponentConfig readConfig(String configName) {
        ClassPathResource resource = new ClassPathResource(BASE_PATH + configName + ".config.json");
        if (!resource.exists()) {
            throw new DataRoomException("组件配置文件不存在: " + configName + "，请先执行 " + EXPORT_COMMAND);
        }
        try (InputStream inputStream = resource.getInputStream()) {
            return objectMapper.readValue(inputStream, ComponentConfig.class);
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new DataRoomException("组件配置文件读取失败: " + configName, e);
        }
    }

    /**
     * 生成组件不存在时的可用组件名称提示信息。
     *
     * @param components 可用组件概要列表
     * @return 拼接后的可用组件名称提示
     */
    private String availableComponentNamesMessage(List<ComponentSummary> components) {
        String names = components.stream()
                .map(ComponentSummary::getComponentName)
                .collect(Collectors.joining(", "));
        return "，可用组件: " + names;
    }
}
