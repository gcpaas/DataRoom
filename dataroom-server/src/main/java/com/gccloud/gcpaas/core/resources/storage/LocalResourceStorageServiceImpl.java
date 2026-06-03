package com.gccloud.gcpaas.core.resources.storage;

import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.entity.ResourceEntity;
import jakarta.annotation.Resource;
import org.apache.commons.io.FileUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;

/**
 * 本地文件系统资源存储
 */
@Service
@ConditionalOnProperty(prefix = "dataroom.resource.storage", name = "type", havingValue = "local", matchIfMissing = true)
public class LocalResourceStorageServiceImpl implements ResourceStorageService {

    @Resource
    private DataRoomConfig dataRoomConfig;

    @Override
    public String getStorageType() {
        return "local";
    }

    @Override
    public StoredResource store(ResourceStoreRequest request) throws IOException {
        String objectKey = normalizeObjectKey(request.getObjectKey());
        File target = new File(dataRoomConfig.getResource().getBasePath(), objectKey);
        FileUtils.copyInputStreamToFile(request.getFile().getInputStream(), target);
        return StoredResource.builder()
                .objectKey(objectKey)
                .accessUrl("/" + objectKey.replace(File.separatorChar, '/'))
                .size((int) (request.getFile().getSize() / 1024))
                .build();
    }

    @Override
    public ResourceStream load(ResourceEntity resource, ResourceFileVariant variant) throws IOException {
        String objectKey = getObjectKey(resource, variant);
        File file = new File(dataRoomConfig.getResource().getBasePath(), normalizeObjectKey(objectKey));
        if (!file.exists() || !file.isFile()) {
            return null;
        }
        return ResourceStream.builder()
                .inputStream(Files.newInputStream(file.toPath()))
                .contentLength(file.length())
                .contentType(Files.probeContentType(file.toPath()))
                .fileName(file.getName())
                .build();
    }

    @Override
    public void delete(String objectKey) throws IOException {
        if (StringUtils.isBlank(objectKey)) {
            return;
        }
        File file = new File(dataRoomConfig.getResource().getBasePath(), normalizeObjectKey(objectKey));
        if (file.exists() && !FileUtils.deleteQuietly(file)) {
            throw new IOException("删除本地文件失败: " + file.getAbsolutePath());
        }
    }

    private String getObjectKey(ResourceEntity resource, ResourceFileVariant variant) {
        if (variant == ResourceFileVariant.THUMBNAIL) {
            return resource.getThumbnail();
        }
        return resource.getPath();
    }

    private String normalizeObjectKey(String objectKey) {
        if (StringUtils.isBlank(objectKey)) {
            return "";
        }
        String normalized = objectKey.replace('\\', '/');
        if (normalized.startsWith(dataRoomConfig.getResource().getUrlPrefix())) {
            normalized = normalized.substring(dataRoomConfig.getResource().getUrlPrefix().length());
        }
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        return normalized;
    }
}
