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

package com.gccloud.dataroom.core.module.file.service;


import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;

/**
 * 文件管理
 *
 * @author liuchengbiao
 */
public interface IDataRoomOssService {
    /**
     * 上传文件，文件名重新生成
     *
     * @param file
     * @param entity
     * @param response
     * @param request
     * @return
     */
    DataRoomFileEntity upload(MultipartFile file, DataRoomFileEntity entity, HttpServletResponse response, HttpServletRequest request);


    /**
     * 上传文件, 保留传入的文件名
     * @param inputStream
     * @param fileName
     * @param size
     * @param entity
     * @return
     */
    DataRoomFileEntity upload(InputStream inputStream, String fileName, long size, DataRoomFileEntity entity);


    /**
     * 替换已有文件
     * @param file
     * @param entity
     * @param response
     * @param request
     * @return
     */
    DataRoomFileEntity replace(MultipartFile file, DataRoomFileEntity entity, HttpServletResponse response, HttpServletRequest request);



    /**
     * 下载文件
     *
     * @param fileId
     * @param response
     * @param request
     */
    void download(String fileId, HttpServletResponse response, HttpServletRequest request);


    /**
     * 删除文件
     * @param fileId
     */
    void delete(String fileId);

    /**
     * 复制文件，目前用于封面复制
     * @param sourcePath
     * @param targetPath
     * @return 返回复制后的文件路径
     */
    default String copy(String sourcePath, String targetPath) {return "";}
}