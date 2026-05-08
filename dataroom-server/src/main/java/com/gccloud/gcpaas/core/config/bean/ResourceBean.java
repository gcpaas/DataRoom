package com.gccloud.gcpaas.core.config.bean;

import lombok.Data;

@Data
public class ResourceBean {
    /**
     * 素材上传的目录
     */
    private String basePath;
    /**
     * 素材访问的地址前缀
     */
    private String urlPrefix;
}
