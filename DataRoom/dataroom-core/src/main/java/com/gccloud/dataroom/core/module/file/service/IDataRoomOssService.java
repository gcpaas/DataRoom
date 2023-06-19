package com.gccloud.dataroom.core.module.file.service;


import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 文件管理
 *
 * @author liuchengbiao
 */
public interface IDataRoomOssService {
    /**
     * 上传文件
     *
     * @param file
     * @param entity
     * @param response
     * @param request
     * @return
     */
    DataRoomFileEntity upload(MultipartFile file, DataRoomFileEntity entity, HttpServletResponse response, HttpServletRequest request);

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
}
