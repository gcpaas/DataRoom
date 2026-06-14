package com.gccloud.gcpaas.core.component.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.core.component.bean.ComponentConfig;
import com.gccloud.gcpaas.core.component.bean.ComponentSummary;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ComponentConfigResourceService {

    private static final String BASE_PATH = "mcp/component-configs/";
    private static final String EXPORT_COMMAND = "npm run export:component-configs";
    private static final List<String> PAGE_CONFIG_NAMES = List.of("PageConfig", "VisualScreenPageConfig");

    private final ObjectMapper objectMapper = new ObjectMapper();

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

    private String availableComponentNamesMessage(List<ComponentSummary> components) {
        String names = components.stream()
                .map(ComponentSummary::getComponentName)
                .collect(Collectors.joining(", "));
        return "，可用组件: " + names;
    }
}
