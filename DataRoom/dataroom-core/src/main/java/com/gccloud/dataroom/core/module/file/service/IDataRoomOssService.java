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
