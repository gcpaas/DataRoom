package com.gccloud.gcpaas.core.resources.storage;

import com.gccloud.gcpaas.core.entity.ResourceEntity;

import java.io.IOException;

/**
 * 资源存储服务
 */
public interface ResourceStorageService {
    /**
     * 存储类型
     */
    String getStorageType();

    /**
     * 存储资源
     *
     * @param request 存储请求
     * @return 存储结果
     */
    StoredResource store(ResourceStoreRequest request) throws IOException;

    /**
     * 读取资源
     *
     * @param resource 资源记录
     * @param variant 文件类型
     * @return 文件流
     */
    ResourceStream load(ResourceEntity resource, ResourceFileVariant variant) throws IOException;

    /**
     * 删除资源对象
     *
     * @param objectKey 存储对象 key
     */
    void delete(String objectKey) throws IOException;
}
