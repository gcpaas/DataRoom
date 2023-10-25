package com.gccloud.dataroom.core.config.bean;

import com.gccloud.common.exception.GlobalException;
import io.minio.MinioClient;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Minio 配置信息
 *
 * @author Acechengui
 */
@Data
@Configuration
@ConfigurationProperties(prefix = "gc.starter.file.minio")
public class DataRoomMinioConfig
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

    @Bean
    @ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "minio")
    public MinioClient getMinioClient() {
        if (StringUtils.isBlank(bucketName)) {
            throw new GlobalException("Minio bucketName 不能为空");
        }
        return MinioClient.builder().endpoint(url).credentials(accessKey, secretKey).build();
    }
}
