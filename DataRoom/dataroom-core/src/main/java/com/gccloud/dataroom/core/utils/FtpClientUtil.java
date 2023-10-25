package com.gccloud.dataroom.core.utils;


import com.gccloud.dataroom.core.config.bean.DataRoomFtpConfig;
import com.gccloud.dataroom.core.module.file.service.pool.ftp.FtpPoolServiceImpl;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPFile;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * 2023/2/5 15:04
 *
 * @author HZ
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "ftp")
public class FtpClientUtil {

    @Resource
    private DataRoomFtpConfig config;

    /**
     * ftp 连接池
     */
    @Resource
    private FtpPoolServiceImpl ftpPoolService;


    /**
     * 上传文件
     *
     * @param uploadPath 上传路径
     * @param fileName   文件名
     * @param input      文件输入流
     * @return 上传结果
     */
    public boolean upload(String uploadPath, String fileName, InputStream input) {
        String[] paths = PathUtils.handlePath(uploadPath, fileName);
        uploadPath = paths[0];
        fileName = paths[1];
        boolean success = false;
        FTPClient ftpClient = ftpPoolService.borrowObject();
        try {
            boolean changeSuccess = this.changeWorkingDirectory(uploadPath, ftpClient);
            if (!changeSuccess) {
                log.info("切换目录失败,目录:{}", uploadPath);
                return false;
            }
            String workingDir = ftpClient.printWorkingDirectory();
            log.info("当前工作目录:{}", workingDir);
            ftpClient.enterLocalPassiveMode();
            ftpClient.setControlEncoding("UTF-8");
            ftpClient.setBufferSize(config.getBufferSize());
            ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
            ftpClient.setFileTransferMode(FTP.STREAM_TRANSFER_MODE);
            success = ftpClient.storeFile(fileName, input);
            if (success) {
                log.info("文件上传成功:{}", uploadPath + "/" + fileName);
            } else {
                log.info("文件上传失败:{}", uploadPath + "/" + fileName);
            }
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
        } finally {
            if (null != input){
                try {
                    input.close();
                } catch (IOException e) {
                    log.error(ExceptionUtils.getStackTrace(e));
                }
            }
            ftpPoolService.returnObject(ftpClient);
        }
        return success;
    }


    /**
     * 下载文件到输出流
     * @param ftpPath FTP服务器文件目录
     * @param ftpFileName 文件名称
     * @param outputStream 输出流
     * @return 下载结果
     */
    public boolean download(String ftpPath, String ftpFileName, OutputStream outputStream) {
        String[] paths = PathUtils.handlePath(ftpPath, ftpFileName);
        ftpPath = paths[0] + "/";
        ftpFileName = paths[1];
        FTPClient ftpClient = ftpPoolService.borrowObject();
        try {
            // 检查目标文件是否存在
            String finalFtpFileName = ftpFileName;
            FTPFile[] ftpFiles = ftpClient.listFiles(ftpPath, file -> file.isFile() && file.getName().equals(finalFtpFileName));
            if (ftpFiles == null || ftpFiles.length == 0) {
                log.info("FTP服务器文件不存在:{}", ftpPath + ftpFileName);
                return false;
            }
            ftpClient.setControlEncoding("UTF-8");
            ftpClient.setFileType(FTPClient.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();
            ftpClient.changeWorkingDirectory(ftpPath);
            boolean success = ftpClient.retrieveFile(finalFtpFileName, outputStream);
            if (!success) {
                log.info("FTP文件下载失败:{}", ftpPath + ftpFileName);
                return false;
            }
            log.info("FTP文件下载成功:{}", ftpPath + ftpFileName);
            return true;
        } catch (Exception e) {
            log.info("FTP文件下载失败:{}", ftpPath + ftpFileName);
            log.error(ExceptionUtils.getStackTrace(e));
        } finally {
            try {
                if (outputStream != null) {
                    outputStream.close();
                }
            } catch (IOException e) {
                log.error(ExceptionUtils.getStackTrace(e));
            }
            ftpPoolService.returnObject(ftpClient);
        }
        return false;
    }



    /**
     * 从FTP服务器删除文件
     * 存在文件的目录无法删除
     *
     * @param ftpPath  服务器文件存储路径
     * @param fileName 服务器文件存储名称
     * @return 删除结果
     */
    public boolean delete(String ftpPath, String fileName) {
        String[] paths = PathUtils.handlePath(ftpPath, fileName);
        ftpPath = paths[0] + "/";
        fileName = paths[1];
        FTPClient ftpClient = ftpPoolService.borrowObject();
        try {
            // 在 ftp 目录下获取文件名与 fileName 匹配的文件信息
            String finalFileName = fileName;
            FTPFile[] ftpFiles = ftpClient.listFiles(ftpPath, file -> file.isFile() && file.getName().equals(finalFileName));
            if (ftpFiles == null || ftpFiles.length == 0) {
                log.error("FTP服务器文件不存在:{},", ftpPath + fileName);
                return false;
            }
            // 删除文件
            boolean del;
            ftpClient.changeWorkingDirectory(ftpPath);
            del = ftpClient.deleteFile(finalFileName);
            log.info(del ? "文件:{}删除成功" : "文件:{}删除失败", ftpPath + fileName);
            return del;
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
        } finally {
            ftpPoolService.returnObject(ftpClient);
        }
        return false;
    }

    /**
     * 复制文件，目前仅支持文件复制
     * @param sourcePath
     * @param targetPath
     */
    public boolean copy(String sourcePath, String targetPath) {
        sourcePath = PathUtils.normalizePath(sourcePath);
        targetPath = PathUtils.normalizePath(targetPath);
        // 分割路径和文件名
        String[] sourceSplit = sourcePath.split("/");
        String[] targetSplit = targetPath.split("/");
        sourcePath = sourcePath.substring(0, sourcePath.length() - sourceSplit[sourceSplit.length - 1].length());
        targetPath = targetPath.substring(0, targetPath.length() - targetSplit[targetSplit.length - 1].length());
        String sourceFileName = sourceSplit[sourceSplit.length - 1];
        String targetFileName = targetSplit[targetSplit.length - 1];
        FTPClient ftpClient = ftpPoolService.borrowObject();
        try {
            // 检查目标文件是否存在
            FTPFile[] ftpFiles = ftpClient.listFiles(sourcePath, file -> file.isFile() && file.getName().equals(sourceFileName));
            if (ftpFiles == null || ftpFiles.length == 0) {
                log.error("FTP服务器文件不存在:{}", sourcePath + sourceFileName);
                return false;
            }
            ftpClient.setControlEncoding("UTF-8");
            ftpClient.setFileType(FTPClient.BINARY_FILE_TYPE);
            ftpClient.enterLocalPassiveMode();
            ftpClient.changeWorkingDirectory(sourcePath);
            boolean success = ftpClient.retrieveFile(sourceFileName, new FileOutputStream(targetPath + targetFileName));
            if (!success) {
                log.error("FTP文件复制失败:{}", sourcePath + sourceFileName);
                return false;
            }
            log.info("FTP文件复制成功:{}", targetPath + targetFileName);
            return true;
        } catch (Exception e) {
            log.info("FTP文件复制失败:{}", sourcePath + sourceFileName);
            log.error(ExceptionUtils.getStackTrace(e));
        } finally {
            ftpPoolService.returnObject(ftpClient);
        }
        return false;
    }

    /**
     * 改变当前目录
     *
     * @param workPath 新的当前工作目录
     * @return
     */
    private boolean changeWorkingDirectory(String workPath, FTPClient ftpClient) throws IOException {
        boolean success = ftpClient.changeWorkingDirectory(workPath);
        if (!success) {
            String[] dirs = workPath.split("/");
            for (String str : dirs) {
                if(StringUtils.isBlank(str)) {
                    continue;
                }
                if (!ftpClient.changeWorkingDirectory(str)) {
                    boolean makeDirectory = ftpClient.makeDirectory(str);
                    log.info("创建目录:{}, 结果: {}", str, makeDirectory ? "成功" : "失败");
                    success = ftpClient.changeWorkingDirectory(str);
                }
            }
        }
        return success;
    }

}

