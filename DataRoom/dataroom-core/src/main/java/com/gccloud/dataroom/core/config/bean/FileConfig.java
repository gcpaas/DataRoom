/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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
            "rar", "zip",
            "glb", "gltf"
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