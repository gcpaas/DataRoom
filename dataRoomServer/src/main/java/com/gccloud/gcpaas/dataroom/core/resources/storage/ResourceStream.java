package com.gccloud.gcpaas.dataroom.core.resources.storage;

import lombok.Builder;
import lombok.Data;

import java.io.InputStream;

/**
 * 资源读取结果
 */
@Data
@Builder
public class ResourceStream {
    /**
     * 文件流
     */
    private InputStream inputStream;
    /**
     * 文件总大小，单位字节
     */
    private Long contentLength;
    /**
     * Content-Type
     */
    private String contentType;
    /**
     * 文件名
     */
    private String fileName;
}
