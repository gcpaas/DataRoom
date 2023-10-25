package com.gccloud.dataroom.core.utils;

import com.gccloud.dataroom.core.config.bean.DataRoomMinioConfig;
import io.minio.*;
import io.minio.http.Method;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.InputStream;

/**
 * Minio快捷操作工具类
 *
 * @author Acechengui
 */
@Component
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "minio")
public class MinioFileInterface {
    @Resource
    private DataRoomMinioConfig minioConfig;

    private MinioClient init() throws Exception {
        MinioClient build = MinioClient.builder().endpoint(minioConfig.getUrl()).credentials(minioConfig.getAccessKey(), minioConfig.getSecretKey()).build();
        //判断bucket是否存在，没有就创建
        boolean found =build.bucketExists(BucketExistsArgs.builder().bucket(minioConfig.getBucketName()).build());
        if (!found) {
            build.makeBucket(MakeBucketArgs.builder().bucket(minioConfig.getBucketName()).build());
        }
        return build;
    }

    /**
     * 删除文件
     * @param objectName 文件名（路径）
     */
    public void deleteObject(String objectName) throws Exception {
        MinioClient minioClient = init();
        //删除文件时，如果对应文件夹下的文件已删除完，文件夹会自动删除
        minioClient.removeObject(RemoveObjectArgs.builder()
                .bucket(minioConfig.getBucketName())
                .object(objectName)
                //.versionId("my-versionid") //还可以删除指定版本号的对象
                .build());
    }

    /**
     * 下载文件
     * @param objectName 文件名（路径）
     */
    public InputStream download(String objectName) throws Exception {
        MinioClient minioClient = init();
        // 获取文件输入流
        return minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(minioConfig.getBucketName())
                        .object(objectName)
                        .build());
    }

    /**
     * 生成一个GET请求的分享链接。
     * 失效时间默认是7天。
     *
     * @param bucketName 存储桶名称
     * @param objectName 存储桶里的对象名称
     * @param expires    失效时间（以秒为单位），默认是7天，不得大于七天
     * @return url
     */
    public String presignedGetObject(String bucketName, String objectName, Integer expires) throws Exception {
        String url = "";
        if (expires == null){
            expires = 604800;
        }
        GetPresignedObjectUrlArgs getPresignedObjectUrlArgs = GetPresignedObjectUrlArgs.builder()
                .method(Method.GET)
                .bucket(bucketName)
                .object(objectName)
                // .expiry(expires)
                .build();
        MinioClient minioClient = init();
        url = minioClient.getPresignedObjectUrl(getPresignedObjectUrlArgs);
        return url;
    }

}
