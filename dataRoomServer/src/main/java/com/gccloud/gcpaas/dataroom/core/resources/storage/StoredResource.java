package com.gccloud.gcpaas.dataroom.core.resources.storage;

import lombok.Builder;
import lombok.Data;

/**
 * 资源存储结果
 */
@Data
@Builder
public class StoredResource {
    /**
     * 存储对象 key
     */
    private String objectKey;
    /**
     * 可访问地址，local 存储会返回静态资源地址，s3 存储由 Controller 统一规范化
     */
    private String accessUrl;
    /**
     * 文件大小，单位 KB
     */
    private Integer size;
}
