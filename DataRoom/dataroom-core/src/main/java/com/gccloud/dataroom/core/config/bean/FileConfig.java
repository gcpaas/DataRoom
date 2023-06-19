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
            "txt",
            "pdf",
            "xls",
            "xlsx",
            "csv",
            "doc",
            "docx",
            "png",
            "jpg",
            "gif",
            "mp4",
            "mov",
            "mp3",
            "rar",
            "zip",
            "ppt",
            "svg"
    );
}
