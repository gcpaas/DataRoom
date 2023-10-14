package com.gccloud.dataroom.core.module.file.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.config.bean.FileConfig;
import com.gccloud.dataroom.core.module.file.config.MinioConfig;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.FileOperationStrategy;
import com.gccloud.dataroom.core.module.file.service.IDataRoomFileService;
import com.gccloud.dataroom.core.module.file.service.IDataRoomOssService;
import com.gccloud.dataroom.core.utils.FileUploadUtils;
import com.gccloud.dataroom.core.utils.MinioFileInterface;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import lombok.SneakyThrows;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Conditional;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.annotation.Resource;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.InputStream;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

/**
 * @Description Description
 * @Author Acechengui
 * @Date Created in 2023-10-14
 */
@Service("minioFileService")
@Conditional(FileOperationStrategy.MinioFileCondition.class)
@Slf4j
public class DataRoomMinioServiceImpl implements IDataRoomOssService {

    @Resource
    private MinioConfig minioConfig;

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
     *
     */
    @SneakyThrows
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
        String module = request.getParameter("module");
        // 不同业务自己控制
        if (StringUtils.isBlank(module)) {
            fileEntity.setModule("other");
        }
        // 重命名
        String id = IdWorker.getIdStr();
        String newFileName = id + "." + extension;
        String filePath = FileUploadUtils.extractFilename(file);
        InputStream inputStream = file.getInputStream();
        PutObjectArgs args = PutObjectArgs.builder()
                .bucket(minioConfig.getBucketName())
                .object(filePath)
                .stream(inputStream, file.getSize(), -1)
                .contentType(file.getContentType())
                .build();
        minioclient.putObject(args);
        String url = minioConfig.getUrl() + "/" + minioConfig.getBucketName() + "/" + filePath;
        fileEntity.setOriginalName(originalFilename);
        fileEntity.setNewName(newFileName);
        fileEntity.setPath(filePath);
        fileEntity.setSize(file.getSize());
        fileEntity.setExtension(extension);
        fileEntity.setUrl(url);
        return fileEntity;
    }

    /**
     * 下载文件
     *
     */
    @SneakyThrows
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
        response.setHeader("filename", URLEncoder.encode(fileEntity.getOriginalName(), StandardCharsets.UTF_8));
        // 解决下载的文件不携带后缀
        response.setHeader("Content-Disposition", "attachment;fileName="+URLEncoder.encode(fileEntity.getOriginalName(), StandardCharsets.UTF_8));
        try {
            InputStream is = minioFileInterface.download(fileEntity.getPath());
            IOUtils.copy(is, response.getOutputStream());
            is.close();
            response.getOutputStream().close();
        } catch (Exception e) {
            response.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            log.error(String.format("下载文件%s失败", fileEntity.getOriginalName()));
        } finally {
            sysFileService.updateDownloadCount(1, fileId);
        }
    }

    /**
     * 删除文件
     */
    @SneakyThrows
    @Override
    public void delete(String fileId) {
        String path = sysFileService.getById(fileId).getPath();
        minioFileInterface.deleteObject(path.substring(path.indexOf(minioConfig.getBucketName())+minioConfig.getBucketName().length()+1));
    }
}
