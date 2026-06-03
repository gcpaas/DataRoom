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
    /**
     * 素材存储配置
     */
    private Storage storage = new Storage();

    @Data
    public static class Storage {
        /**
         * 存储类型：local、minio
         */
        private String type = "local";
        /**
         * MinIO / S3 兼容存储配置
         */
        private Minio minio = new Minio();
    }

    @Data
    public static class Minio {
        /**
         * Endpoint，例如 http://127.0.0.1:9000
         */
        private String endpoint;
        /**
         * Bucket 名称
         */
        private String bucket;
        /**
         * Access Key
         */
        private String accessKey;
        /**
         * Secret Key
         */
        private String secretKey;
        /**
         * Region
         */
        private String region = "us-east-1";
        /**
         * 是否使用 path-style access
         */
        private Boolean pathStyleAccess = true;
    }
}
