package com.gccloud.dataroom.core.module.file.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.config.bean.FileConfig;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomFileService;
import com.gccloud.dataroom.core.module.file.service.IDataRoomOssService;
import com.gccloud.dataroom.core.utils.SftpClientUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.*;
import java.net.URLEncoder;

/**
 * sftp文件管理实现类
 * 将文件上传至sftp服务器，需要配置sftp服务器相关信息
 * 由于该方案无法直接通过url访问文件，所以需要手动在对应的服务器上部署nginx等服务，将sftp服务器上的文件开放访问，然后将该服务地址配置到gc.starter.file.urlPrefix中
 * @author hongyang
 * @version 1.0
 * @date 2023/10/17 15:12
 */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "sftp")
public class DataRoomSftpFileServiceImpl implements IDataRoomOssService {

    @Resource
    private SftpClientUtils sftpUtil;
    @Resource
    private DataRoomConfig bigScreenConfig;
    @Resource
    private IDataRoomFileService sysFileService;


    @Override
    public DataRoomFileEntity upload(MultipartFile file, DataRoomFileEntity fileEntity, HttpServletResponse response, HttpServletRequest request) {
        String originalFilename = file.getOriginalFilename();
        // 提取文件后缀名
        String extension = FilenameUtils.getExtension(originalFilename);
        FileConfig fileConfig = bigScreenConfig.getFile();
        if (!fileConfig.getAllowedFileExtensionName().contains("*") && !fileConfig.getAllowedFileExtensionName().contains(extension)) {
            log.error("不支持 {} 文件类型",extension);
            throw new GlobalException("不支持的文件类型");
        }
        long size = file.getSize();
        // 重命名
        String id = IdWorker.getIdStr();
        String newFileName = id + "." + extension;
        InputStream inputStream;
        try {
            inputStream = file.getInputStream();
        } catch (IOException e) {
            log.error("上传文件到SFTP服务失败：获取文件流失败");
            log.error(ExceptionUtils.getStackTrace(e));
            throw new GlobalException("获取文件流失败");
        }
        this.upload(inputStream, newFileName, size, fileEntity);
        return fileEntity;
    }


    @Override
    public DataRoomFileEntity upload(InputStream inputStream, String fileName, long size, DataRoomFileEntity fileEntity) {
        // 提取文件后缀名
        String extension = FilenameUtils.getExtension(fileName);
        // 上传的目标路径
        String basePath = bigScreenConfig.getFile().getBasePath();
        // 上传文件到sftp
        boolean upload = sftpUtil.upload(basePath, fileName, inputStream);
        if (!upload) {
            log.error("上传文件到sftp失败");
            throw new GlobalException("上传文件到sftp失败");
        }
        fileEntity.setOriginalName(fileName);
        fileEntity.setNewName(fileName);
        fileEntity.setPath(basePath);
        fileEntity.setSize(size);
        fileEntity.setExtension(extension);
        fileEntity.setUrl("/" + fileName);
        return fileEntity;
    }

    @Override
    public void download(String fileId, HttpServletResponse response, HttpServletRequest request) {
        DataRoomFileEntity fileEntity = sysFileService.getById(fileId);
        if (fileEntity == null) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            log.error("下载的文件不存在");
            return;
        }
        response.setContentType("application/x-msdownload");
        response.setContentType("multipart/form-data");
        // 不设置前端无法从header获取文件名
        response.setHeader("Access-Control-Expose-Headers", "filename");
        try {
            response.setHeader("filename", URLEncoder.encode(fileEntity.getOriginalName(), "UTF-8"));
            // 解决下载的文件不携带后缀
            response.setHeader("Content-Disposition", "attachment;fileName="+URLEncoder.encode(fileEntity.getOriginalName(),"UTF-8"));
        } catch (UnsupportedEncodingException e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        OutputStream outputStream;
        try {
            outputStream = response.getOutputStream();
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            return;
        }
        boolean download = sftpUtil.download(fileEntity.getPath(), fileEntity.getNewName(), outputStream);
        if (!download) {
            log.error("下载文件失败");
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
        }
        try {
            outputStream.close();
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        sysFileService.updateDownloadCount(1, fileId);
    }

    @Override
    public void delete(String fileId) {
        DataRoomFileEntity fileEntity = sysFileService.getById(fileId);
        if (fileEntity == null) {
            log.error("删除的文件不存在");
            return;
        }
        sysFileService.removeById(fileId);
        // 删除sftp上的文件
        sftpUtil.delete(fileEntity.getPath(), fileEntity.getNewName());
    }


    @Override
    public String copy(String sourcePath, String targetPath) {
        String basePath = bigScreenConfig.getFile().getBasePath() + File.separator;

        boolean copySuccess = sftpUtil.copy(basePath + sourcePath, basePath + targetPath);
        if (!copySuccess) {
            return "";
        }
        return targetPath;
    }
}
