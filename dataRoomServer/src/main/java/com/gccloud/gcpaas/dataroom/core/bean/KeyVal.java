package com.gccloud.gcpaas.dataroom.core.bean;

import lombok.Data;

@Data
public class KeyVal {
    private String key;
    private String val;
    private Boolean encrypted;
}
