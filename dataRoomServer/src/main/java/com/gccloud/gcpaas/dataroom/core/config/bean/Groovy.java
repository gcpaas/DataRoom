package com.gccloud.gcpaas.dataroom.core.config.bean;

import lombok.Data;

@Data
public class Groovy {

    /**
     * 是否允许执行 Groovy 脚本，默认关闭。
     */
    private Boolean enable = false;
}
