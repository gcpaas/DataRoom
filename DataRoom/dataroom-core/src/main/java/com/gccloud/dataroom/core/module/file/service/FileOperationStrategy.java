package com.gccloud.dataroom.core.module.file.service;

import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.enums.FileUploadType;
import org.jetbrains.annotations.NotNull;
import org.springframework.context.annotation.Condition;
import org.springframework.context.annotation.ConditionContext;
import org.springframework.core.type.AnnotatedTypeMetadata;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * 文件操作策略类
 * @author Acechengui
 */
@Service
public class FileOperationStrategy {
    private final IDataRoomOssService dataRoomOssService;

    public FileOperationStrategy(IDataRoomOssService  localFileService, IDataRoomOssService  minioFileService) {
        this.dataRoomOssService = localFileService != null ? localFileService : minioFileService;
    }


    public static class LocalFileCondition implements Condition {
        @Override
        public boolean matches(ConditionContext context, @NotNull AnnotatedTypeMetadata metadata) {
            String uploadType = context.getEnvironment().getProperty("gc.starter.file.uploadType");
            return FileUploadType.LOCAL.getValue().equalsIgnoreCase(uploadType);
        }
    }

    public static class MinioFileCondition implements Condition {
        @Override
        public boolean matches(ConditionContext context, @NotNull AnnotatedTypeMetadata metadata) {
            String uploadType = context.getEnvironment().getProperty("gc.starter.file.uploadType");
            return FileUploadType.MINIO.getValue().equalsIgnoreCase(uploadType);
        }
    }

    public DataRoomFileEntity upload(MultipartFile file, DataRoomFileEntity entity, HttpServletResponse response, HttpServletRequest request) {
        return dataRoomOssService.upload(file, entity, response, request);
    }

    public void download(String fileId, HttpServletResponse response, HttpServletRequest request) {
        dataRoomOssService.download(fileId, response, request);
    }

    public void delete(String fileId) {
        dataRoomOssService.delete(fileId);
    }
}