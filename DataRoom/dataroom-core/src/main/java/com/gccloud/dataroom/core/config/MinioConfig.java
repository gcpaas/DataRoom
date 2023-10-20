package com.gccloud.dataroom.core.config;

import io.minio.MinioClient;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Minio 配置信息
 *
 * @author Acechengui
 */
@Configuration
@ConfigurationProperties(prefix = "minio")
public class MinioConfig
{
    /**
     * 服务地址
     */
    private String url;

    /**
     * 用户名
     */
    private String accessKey;

    /**
     * 密码
     */
    private String secretKey;

    /**
     * 存储桶名称
     */
    private String bucketName;

    public String getUrl()
    {
        return url;
    }

    public void setUrl(String url)
    {
        this.url = url;
    }

    public String getAccessKey()
    {
        return accessKey;
    }

    public void setAccessKey(String accessKey)
    {
        this.accessKey = accessKey;
    }

    public String getSecretKey()
    {
        return secretKey;
    }

    public void setSecretKey(String secretKey)
    {
        this.secretKey = secretKey;
    }

    public String getBucketName()
    {
        return bucketName;
    }

    public void setBucketName(String bucketName)
    {
        this.bucketName = bucketName;
    }

    @Bean
    public MinioClient getMinioClient() {
        if (StringUtils.isEmpty(url) || StringUtils.isEmpty(accessKey) || StringUtils.isEmpty(secretKey)) {
            // 如果未配置Minio相关的配置项，则使用本地文件存储
            // 或者返回一个默认的MinioClient实例，用于本地文件存储
            return createDefaultMinioClient();
        }
        return MinioClient.builder().endpoint(url).credentials(accessKey, secretKey).build();
    }

    private MinioClient createDefaultMinioClient() {
        return MinioClient.builder()
                .endpoint("http://minio.example.com")
                .credentials("accessKey", "secretKey")
                .build();
    }
}
