package com.gccloud.gcpaas.core.resources.storage;

import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.config.bean.ResourceBean;
import com.gccloud.gcpaas.core.entity.ResourceEntity;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.BooleanUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectResponse;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import java.io.IOException;
import java.net.URI;

/**
 * S3 兼容资源存储
 */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "dataroom.resource.storage", name = "type", havingValue = "s3")
public class S3ResourceStorageServiceImpl implements IResourceStorageService {

    @Resource
    private DataRoomConfig dataRoomConfig;

    private S3Client s3Client;

    @Override
    public String getStorageType() {
        return "s3";
    }

    @PostConstruct
    public void init() {
        ResourceBean.S3 config = getS3Config();
        validateS3Config(config);
        s3Client = S3Client.builder()
                .endpointOverride(URI.create(config.getEndpoint()))
                .region(Region.of(config.getRegion()))
                .credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(config.getAccessKey(), config.getSecretKey())))
                .serviceConfiguration(S3Configuration.builder()
                        .pathStyleAccessEnabled(BooleanUtils.isNotFalse(config.getPathStyleAccess()))
                        .build())
                .build();
    }

    @Override
    public StoredResource store(ResourceStoreRequest request) throws IOException {
        String objectKey = normalizeObjectKey(request.getObjectKey());
        try {
            ResourceBean.S3 config = getS3Config();
            ensureBucketExists(s3Client, config);
            s3Client.putObject(
                    PutObjectRequest.builder()
                            .bucket(config.getBucket())
                            .key(objectKey)
                            .contentType(request.getFile().getContentType())
                            .build(),
                    RequestBody.fromInputStream(request.getFile().getInputStream(), request.getFile().getSize())
            );
            return StoredResource.builder()
                    .objectKey(objectKey)
                    .size((int) (request.getFile().getSize() / 1024))
                    .build();
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw e;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new IOException("上传文件到 S3 兼容存储失败", e);
        }
    }

    private void ensureBucketExists(S3Client client, ResourceBean.S3 config) {
        try {
            client.headBucket(HeadBucketRequest.builder()
                    .bucket(config.getBucket())
                    .build());
        } catch (NoSuchBucketException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            createBucketIfMissing(client, config);
        } catch (S3Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            if (isNoSuchBucket(e)) {
                createBucketIfMissing(client, config);
                return;
            }
            throw e;
        }
    }

    private void createBucketIfMissing(S3Client client, ResourceBean.S3 config) {
        try {
            client.createBucket(CreateBucketRequest.builder()
                    .bucket(config.getBucket())
                    .build());
            log.info("S3 bucket 不存在，已自动创建，bucket={}", config.getBucket());
        } catch (S3Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            if (isBucketAlreadyExists(e)) {
                return;
            }
            throw e;
        }
    }

    private boolean isNoSuchBucket(S3Exception e) {
        return "NoSuchBucket".equals(getErrorCode(e)) || e.statusCode() == 404;
    }

    private boolean isBucketAlreadyExists(S3Exception e) {
        String code = getErrorCode(e);
        return "BucketAlreadyOwnedByYou".equals(code) || "BucketAlreadyExists".equals(code);
    }

    private boolean isObjectNotFound(S3Exception e) {
        String code = getErrorCode(e);
        return "NoSuchKey".equals(code) || "NotFound".equals(code) || e.statusCode() == 404;
    }

    private String getErrorCode(S3Exception e) {
        if (e.awsErrorDetails() == null) {
            return "";
        }
        return StringUtils.defaultString(e.awsErrorDetails().errorCode());
    }

    @Override
    public ResourceStream load(ResourceEntity resource, ResourceFileVariant variant) throws IOException {
        String objectKey = variant == ResourceFileVariant.THUMBNAIL ? resource.getThumbnail() : resource.getPath();
        objectKey = normalizeObjectKey(objectKey);
        if (StringUtils.isBlank(objectKey)) {
            return null;
        }
        try {
            ResourceBean.S3 config = getS3Config();
            HeadObjectResponse stat = s3Client.headObject(
                    HeadObjectRequest.builder()
                            .bucket(config.getBucket())
                            .key(objectKey)
                            .build()
            );
            return ResourceStream.builder()
                    .inputStream(s3Client.getObject(
                            GetObjectRequest.builder()
                                    .bucket(config.getBucket())
                                    .key(objectKey)
                                    .build()
                    ))
                    .contentLength(stat.contentLength())
                    .contentType(stat.contentType())
                    .fileName(FilenameUtils.getName(objectKey))
                    .build();
        } catch (S3Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            if (isObjectNotFound(e)) {
                return null;
            }
            throw new IOException("读取 S3 兼容存储文件失败", e);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new IOException("读取 S3 兼容存储文件失败", e);
        }
    }

    @Override
    public void delete(String objectKey) throws IOException {
        objectKey = normalizeObjectKey(objectKey);
        if (StringUtils.isBlank(objectKey)) {
            return;
        }
        try {
            s3Client.deleteObject(
                    DeleteObjectRequest.builder()
                            .bucket(getS3Config().getBucket())
                            .key(objectKey)
                            .build()
            );
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new IOException("删除 S3 兼容存储文件失败，objectKey=" + objectKey, e);
        }
    }

    private ResourceBean.S3 getS3Config() {
        return dataRoomConfig.getResource().getStorage().getS3();
    }

    private void validateS3Config(ResourceBean.S3 config) {
        if (config == null) {
            throw new IllegalStateException("S3 配置不能为空");
        }
        if (StringUtils.isBlank(config.getEndpoint())) {
            throw new IllegalStateException("S3 endpoint 不能为空");
        }
        if (StringUtils.isBlank(config.getBucket())) {
            throw new IllegalStateException("S3 bucket 不能为空");
        }
        if (StringUtils.isBlank(config.getAccessKey())) {
            throw new IllegalStateException("S3 accessKey 不能为空");
        }
        if (StringUtils.isBlank(config.getSecretKey())) {
            throw new IllegalStateException("S3 secretKey 不能为空");
        }
        if (StringUtils.isBlank(config.getRegion())) {
            config.setRegion("us-east-1");
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
