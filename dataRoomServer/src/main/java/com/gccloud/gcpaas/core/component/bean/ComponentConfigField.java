package com.gccloud.gcpaas.core.component.bean;

import lombok.Data;

import java.util.List;

@Data
public class ComponentConfigField {
    private String field;
    private String type;
    private List<Object> options;
    private String description;
    private Object defaultValue;
}
