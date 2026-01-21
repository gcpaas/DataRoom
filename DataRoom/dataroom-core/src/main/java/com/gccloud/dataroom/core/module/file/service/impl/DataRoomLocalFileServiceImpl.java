package com.gccloud.dataroom.core.module.file.service.impl;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.config.bean.FileConfig;
import com.gccloud.dataroom.core.module.file.entity.DataRoomFileEntity;
import com.gccloud.dataroom.core.module.file.service.IDataRoomFileService;
import com.gccloud.dataroom.core.module.file.service.IDataRoomOssService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.io.IOUtils;
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
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * 文件管理
 */
@Slf4j
@Service
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "local", matchIfMissing = true)
public class DataRoomLocalFileServiceImpl implements IDataRoomOssService {

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
        // 重命名
        String id = IdWorker.getIdStr();
        String newFileName = id + "." + extension;
        // 上传文件保存到的路径，根据实际情况修改，也可能是从配置文件获取到的文件存储路径
        String basePath = fileConfig.getBasePath();
        long size = file.getSize();
        try {
            Path baseDir = Paths.get(basePath).toAbsolutePath().normalize();
            Files.createDirectories(baseDir);
            Path targetPath = baseDir.resolve(newFileName);
            file.transferTo(targetPath.toFile());
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            log.error(String.format("文件 %s 存储到 %s 失败", originalFilename, basePath));
            throw new GlobalException("文件上传失败");
        }
        fileEntity.setOriginalName(originalFilename);
        fileEntity.setNewName(newFileName);
        fileEntity.setPath(basePath);
        fileEntity.setSize(size);
        fileEntity.setExtension(extension);
        fileEntity.setUrl("/" + newFileName);
        return fileEntity;
    }


    @Override
    public DataRoomFileEntity upload(InputStream inputStream, String fileName, long size, DataRoomFileEntity fileEntity) {
        // 上传文件保存到的路径, 从配置文件获取
        String basePath = bigScreenConfig.getFile().getBasePath();
        // 提取文件后缀名
        String extension = FilenameUtils.getExtension(fileName);
        String destPath = basePath + File.separator + fileName;
        try {
            File dest = new File(destPath);
            // 检查文件所在的目录是否存在，不存在则创建
            String parent = dest.getParent();
            File parentFile = new File(parent);
            if (!parentFile.exists()) {
                FileUtils.forceMkdir(parentFile);
            }
            FileOutputStream outputStream = new FileOutputStream(dest);
            byte[] buffer = new byte[1024];
            int length;
            while ((length = inputStream.read(buffer)) > 0) {
                outputStream.write(buffer, 0, length);
            }
            outputStream.close();
            inputStream.close();
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            log.error(String.format("文件 %s 存储到 %s 失败", fileName, destPath));
            throw new GlobalException("文件上传失败");
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
        String filePath = fileEntity.getPath() + File.separator + fileEntity.getNewName();
        File file = new File(filePath);
        if (!file.exists()) {
            response.setStatus(HttpStatus.NOT_FOUND.value());
            log.error("下载的文件不存在");
            return;
        }
        try {
            InputStream is = new FileInputStream(file);
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


    @Override
    public void delete(String fileId) {
        DataRoomFileEntity fileEntity = sysFileService.getById(fileId);
        sysFileService.removeById(fileId);
        if (fileEntity == null) {
            log.error("删除的文件不存在");
            return;
        }
        String filePath = fileEntity.getPath() + File.separator + fileEntity.getNewName();
        File file = new File(filePath);
        if (!file.exists()) {
            log.error("删除的文件不存在");
            return;
        }
        file.delete();
    }

    @Override
    public String copy(String sourcePath, String targetPath) {
        String basePath = bigScreenConfig.getFile().getBasePath() + File.separator;
        File sourceFile = new File(basePath + sourcePath);
        File targetFile = new File(basePath + targetPath);
        // 检查源文件是否存在
        if (!sourceFile.exists()) {
            log.error("复制源文件不存在:{}", sourcePath);
            return "";
        }
        // 检查源文件是否是文件夹
        if (sourceFile.isDirectory()) {
            log.error("源文件为文件夹:{}，无法复制", sourcePath);
            return "";
        }
        try {
            FileUtils.copyFile(sourceFile, targetFile);
        } catch (IOException e) {
            log.error(String.format("文件 %s 复制到 %s 失败", sourcePath, targetPath));
            log.error(ExceptionUtils.getStackTrace(e));
            return "";
        }
        return targetPath;
    }
}
