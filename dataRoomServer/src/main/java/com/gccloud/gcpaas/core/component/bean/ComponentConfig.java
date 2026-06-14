package com.gccloud.gcpaas.core.component.bean;

import lombok.Data;

import java.util.List;

@Data
public class ComponentConfig {
    private String componentName;
    private String displayName;
    private String description;
    private List<ComponentConfigField> fields;
}
