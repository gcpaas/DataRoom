package com.gccloud.gcpaas.core.resources.storage;

import com.gccloud.gcpaas.core.constant.ResourceType;
import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

/**
 * 资源存储请求
 */
@Data
@Builder
public class ResourceStoreRequest {
    /**
     * 上传文件
     */
    private MultipartFile file;
    /**
     * 存储对象 key
     */
    private String objectKey;
    /**
     * 资源类型
     */
    private ResourceType resourceType;
}
