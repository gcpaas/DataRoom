package com.gccloud.dataroom.core.config.bean;

import com.google.common.collect.Sets;
import lombok.Data;

import java.util.Set;

/**
 * 文件存储配置
 */
@Data
public class FileConfig {
    /**
     * 文件存储的基础路径
     */
    private String basePath;
    /**
     * 文件地址前缀
     */
    private String urlPrefix;
    /**
     * 允许的上传文件后缀类型
     */
    private Set<String> allowedFileExtensionName = Sets.newHashSet(
            "jpg", "jpeg", "png", "gif", "bmp", "svg", "webp", "ico",
            "xls", "xlsx", "csv",
            "ppt", "pptx",
            "doc", "docx",
            "txt", "pdf",
            "mp4", "mov", "mp3",
            "rar", "zip"
    );

    /**
     * ftp配置
     */
    private DataRoomFtpConfig ftp;

    /**
     * sftp配置
     */
    private DataRoomSftpConfig sftp;

    /**
     * minio配置
     */
    private DataRoomMinioConfig minio;
}
