package com.gccloud.dataroom.core.module.file.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.config.bean.FileConfig;
import com.gccloud.dataroom.core.config.bean.DataRoomMinioConfig;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomFileService;
import com.gccloud.dataroom.core.module.file.service.IDataRoomOssService;
import com.gccloud.dataroom.core.utils.MinioFileInterface;
import com.gccloud.dataroom.core.utils.PathUtils;
import io.minio.*;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLEncoder;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

/**
 * Minio文件管理
 *
 * @author Acechengui
 */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "minio")
public class DataRoomMinioServiceImpl implements IDataRoomOssService {

    @Resource
    private MinioClient minioclient;

    @Resource
    private DataRoomConfig bigScreenConfig;

    @Resource
    private IDataRoomFileService sysFileService;

    @Resource
    private MinioFileInterface minioFileInterface;

    /**
     * 上传文件
     */
    @Override
    public DataRoomFileEntity upload(MultipartFile file, DataRoomFileEntity fileEntity, HttpServletResponse response, HttpServletRequest request) {
        String originalFilename = file.getOriginalFilename();
        // 提取文件后缀名
        String extension = FilenameUtils.getExtension(originalFilename);
        FileConfig fileConfig = bigScreenConfig.getFile();
        if (!fileConfig.getAllowedFileExtensionName().contains("*") && !fileConfig.getAllowedFileExtensionName().contains(extension)) {
            log.error("不支持 {} 文件类型", extension);
            throw new GlobalException("不支持的文件类型");
        }
        String module = request.getParameter("module");
        // 不同业务自己控制
        if (StringUtils.isBlank(module)) {
            fileEntity.setModule("other");
        }
        // 重命名
        String newFileName = IdWorker.getIdStr() + "." + extension;
        // 组装路径:获取当前日期并格式化为"yyyy/mm/dd"格式的字符串
        String basePath = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyy/MM/dd"));
        String filePath = basePath + "/" + newFileName;
        DataRoomMinioConfig minioConfig = bigScreenConfig.getFile().getMinio();
        try (InputStream inputStream = file.getInputStream()) {
            PutObjectArgs args = PutObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(filePath)
                    .stream(inputStream, file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build();
            minioclient.putObject(args);
        } catch (Exception e) {
            log.error("上传文件到Minio失败");
            log.error(ExceptionUtils.getStackTrace(e));
            throw new GlobalException("上传文件失败");
        }
        // 现在url存储文件的相对路径，对于minio来说，就是bucketName/文件名
        String url = "/" + minioConfig.getBucketName() + "/" + filePath;
        fileEntity.setOriginalName(originalFilename);
        fileEntity.setNewName(newFileName);
        fileEntity.setPath(filePath);
        fileEntity.setSize(file.getSize());
        fileEntity.setExtension(extension);
        fileEntity.setUrl(url);
        fileEntity.setModule(module);
        fileEntity.setBucket(minioConfig.getBucketName());
        return fileEntity;
    }

    @Override
    public DataRoomFileEntity upload(InputStream inputStream, String fileName, long size, DataRoomFileEntity entity) {
        fileName = PathUtils.normalizePath(fileName);
        String extension = FilenameUtils.getExtension(fileName);
        DataRoomMinioConfig minioConfig = bigScreenConfig.getFile().getMinio();
        long fileSize = size == 0 ? -1 : size;
        // 使用minio的最小分片大小
        long partSize = fileSize == -1 ? ObjectWriteArgs.MIN_MULTIPART_SIZE : -1;
        try {
            PutObjectArgs args = PutObjectArgs.builder()
                    .bucket(minioConfig.getBucketName())
                    .object(fileName)
                    .stream(inputStream, fileSize, partSize)
                    .contentType("image/png")
                    .build();
            minioclient.putObject(args);
        } catch (Exception e) {
            log.error("上传文件到Minio失败");
            log.error(ExceptionUtils.getStackTrace(e));
            throw new GlobalException("上传文件失败");
        } finally {
            IOUtils.closeQuietly(inputStream);
        }
        // 现在url存储文件的相对路径，对于minio来说，就是bucketName/文件名
        String url = "/" + minioConfig.getBucketName() + "/" + fileName;
        entity.setOriginalName(fileName);
        entity.setNewName(fileName);
        entity.setPath(fileName);
        entity.setSize(fileSize);
        entity.setExtension(extension);
        entity.setUrl(url);
        entity.setBucket(minioConfig.getBucketName());
        return entity;
    }


    /**
     * 下载文件
     */
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
            response.setHeader("Content-Disposition", "attachment;fileName=" + URLEncoder.encode(fileEntity.getOriginalName(), "UTF-8"));
        } catch (UnsupportedEncodingException e) {
            log.error("文件名编码失败");
            log.error(ExceptionUtils.getStackTrace(e));
        }
        try {
            InputStream is = minioFileInterface.download(fileEntity.getPath());
            IOUtils.copy(is, response.getOutputStream());
            is.close();
            response.getOutputStream().close();
        } catch (Exception e) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            log.error("下载文件失败: {}", fileEntity.getPath());
            log.error(ExceptionUtils.getStackTrace(e));
        } finally {
            sysFileService.updateDownloadCount(1, fileId);
        }
    }

    /**
     * 删除文件
     */
    @Override
    public void delete(String fileId) {
        DataRoomFileEntity fileEntity = sysFileService.getById(fileId);
        if (fileEntity == null) {
            log.error("删除的文件不存在");
            return;
        }
        sysFileService.removeById(fileId);
        String path = fileEntity.getPath();
        try {
            minioFileInterface.deleteObject(path);
        } catch (Exception e) {
            log.error("删除Minio文件失败: {}", path);
            log.error(ExceptionUtils.getStackTrace(e));
        }
    }

    @Override
    public String copy(String sourcePath, String targetPath) {
        DataRoomMinioConfig minioConfig = bigScreenConfig.getFile().getMinio();
        CopySource source = CopySource.builder().bucket(minioConfig.getBucketName()).object(sourcePath).build();
        CopyObjectArgs args = CopyObjectArgs.builder()
                .bucket(minioConfig.getBucketName())
                .object(PathUtils.normalizePath(targetPath))
                .source(source)
                .build();
        try {
            minioclient.copyObject(args);
        } catch (Exception e) {
            log.error("复制Minio文件失败: {}", sourcePath);
            log.error(ExceptionUtils.getStackTrace(e));
            return "";
        }
        return minioConfig.getBucketName() + "/" + targetPath;
    }
}
