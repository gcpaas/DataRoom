package com.gccloud.gcpaas.core.resources.storage;

import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.config.bean.ResourceBean;
import com.gccloud.gcpaas.core.entity.ResourceEntity;
import io.minio.BucketExistsArgs;
import io.minio.GetObjectArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.errors.ErrorResponseException;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;

/**
 * MinIO / S3 兼容资源存储
 */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "dataroom.resource.storage", name = "type", havingValue = "minio")
public class MinioResourceStorageServiceImpl implements ResourceStorageService {

    @Resource
    private DataRoomConfig dataRoomConfig;

    private MinioClient minioClient;

    @Override
    public String getStorageType() {
        return "minio";
    }

    @Override
    public StoredResource store(ResourceStoreRequest request) throws IOException {
        String objectKey = normalizeObjectKey(request.getObjectKey());
        try {
            MinioClient client = getClient();
            ResourceBean.Minio config = getMinioConfig();
            ensureBucketExists(client, config);
            client.putObject(
                    PutObjectArgs.builder()
                            .bucket(config.getBucket())
                            .object(objectKey)
                            .stream(request.getFile().getInputStream(), request.getFile().getSize(), -1L)
                            .contentType(request.getFile().getContentType())
                            .build()
            );
            return StoredResource.builder()
                    .objectKey(objectKey)
                    .size((int) (request.getFile().getSize() / 1024))
                    .build();
        } catch (IOException e) {
            throw e;
        } catch (Exception e) {
            throw new IOException("上传文件到 MinIO 失败", e);
        }
    }

    private void ensureBucketExists(MinioClient client, ResourceBean.Minio config) throws Exception {
        if (client.bucketExists(buildBucketExistsArgs(config))) {
            return;
        }
        try {
            client.makeBucket(buildMakeBucketArgs(config));
            log.info("MinIO bucket 不存在，已自动创建，bucket={}", config.getBucket());
        } catch (ErrorResponseException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            if (isBucketAlreadyExists(e)) {
                return;
            }
            throw e;
        }
    }

    private BucketExistsArgs buildBucketExistsArgs(ResourceBean.Minio config) {
        BucketExistsArgs.Builder builder = BucketExistsArgs.builder()
                .bucket(config.getBucket());
        if (StringUtils.isNotBlank(config.getRegion())) {
            builder.region(config.getRegion());
        }
        return builder.build();
    }

    private MakeBucketArgs buildMakeBucketArgs(ResourceBean.Minio config) {
        MakeBucketArgs.Builder builder = MakeBucketArgs.builder()
                .bucket(config.getBucket());
        if (StringUtils.isNotBlank(config.getRegion())) {
            builder.region(config.getRegion());
        }
        return builder.build();
    }

    private boolean isBucketAlreadyExists(ErrorResponseException e) {
        if (e.errorResponse() == null) {
            return false;
        }
        String code = e.errorResponse().code();
        return "BucketAlreadyOwnedByYou".equals(code) || "BucketAlreadyExists".equals(code);
    }

    @Override
    public ResourceStream load(ResourceEntity resource, ResourceFileVariant variant) throws IOException {
        String objectKey = variant == ResourceFileVariant.THUMBNAIL ? resource.getThumbnail() : resource.getPath();
        objectKey = normalizeObjectKey(objectKey);
        if (StringUtils.isBlank(objectKey)) {
            return null;
        }
        try {
            StatObjectResponse stat = getClient().statObject(
                    StatObjectArgs.builder()
                            .bucket(getMinioConfig().getBucket())
                            .object(objectKey)
                            .build()
            );
            return ResourceStream.builder()
                    .inputStream(getClient().getObject(
                            GetObjectArgs.builder()
                                    .bucket(getMinioConfig().getBucket())
                                    .object(objectKey)
                                    .build()
                    ))
                    .contentLength(stat.size())
                    .contentType(stat.contentType())
                    .fileName(FilenameUtils.getName(objectKey))
                    .build();
        } catch (Exception e) {
            throw new IOException("读取 MinIO 文件失败", e);
        }
    }

    @Override
    public void delete(String objectKey) throws IOException {
        objectKey = normalizeObjectKey(objectKey);
        if (StringUtils.isBlank(objectKey)) {
            return;
        }
        try {
            getClient().removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(getMinioConfig().getBucket())
                            .object(objectKey)
                            .build()
            );
        } catch (Exception e) {
            throw new IOException("删除 MinIO 文件失败，objectKey=" + objectKey, e);
        }
    }

    private MinioClient getClient() throws NoSuchAlgorithmException, IOException, InvalidKeyException {
        if (minioClient == null) {
            ResourceBean.Minio config = getMinioConfig();
            validateMinioConfig(config);
            minioClient = MinioClient.builder()
                    .endpoint(config.getEndpoint())
                    .credentials(config.getAccessKey(), config.getSecretKey())
                    .region(config.getRegion())
                    .build();
        }
        return minioClient;
    }

    private ResourceBean.Minio getMinioConfig() {
        return dataRoomConfig.getResource().getStorage().getMinio();
    }

    private void validateMinioConfig(ResourceBean.Minio config) {
        if (config == null) {
            throw new IllegalStateException("MinIO 配置不能为空");
        }
        if (StringUtils.isBlank(config.getEndpoint())) {
            throw new IllegalStateException("MinIO endpoint 不能为空");
        }
        if (StringUtils.isBlank(config.getBucket())) {
            throw new IllegalStateException("MinIO bucket 不能为空");
        }
        if (StringUtils.isBlank(config.getAccessKey())) {
            throw new IllegalStateException("MinIO accessKey 不能为空");
        }
        if (StringUtils.isBlank(config.getSecretKey())) {
            throw new IllegalStateException("MinIO secretKey 不能为空");
        }
    }

    private String normalizeObjectKey(String objectKey) {
        if (StringUtils.isBlank(objectKey)) {
            return "";
        }
        String normalized = objectKey.replace('\\', '/');
        while (normalized.startsWith("/")) {
            normalized = normalized.substring(1);
        }
        return normalized;
    }
}
