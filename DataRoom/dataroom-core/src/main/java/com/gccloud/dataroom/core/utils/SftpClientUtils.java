package com.gccloud.dataroom.core.utils;

import com.gccloud.dataroom.core.config.bean.DataRoomSftpConfig;
import com.gccloud.dataroom.core.module.file.service.pool.sftp.SftpPoolService;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.SftpException;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;

/**
 * Sftp 客户端工具类
 * @author hongyang
 * @version 1.0
 * @date 2023/10/18 15:28
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "sftp")
public class SftpClientUtils {

    @Resource
    private DataRoomSftpConfig config;

    @Resource
    private SftpPoolService sFtpPoolService;


    /**
     * 上传文件
     * @param uploadPath
     * @param fileName
     * @param inputStream
     * @return
     */
    public boolean upload(String uploadPath, String fileName, InputStream inputStream) {
        ChannelSftp sftp = sFtpPoolService.borrowObject();

        String[] paths = PathUtils.handlePath(uploadPath, fileName);
        uploadPath = paths[0];
        // TODO 检查目录是否存在，不存在则创建
        if (!this.exist(uploadPath)) {
            try {
                sftp.mkdir(uploadPath);
            } catch (SftpException e) {
                log.error(ExceptionUtils.getStackTrace(e));
                return false;
            }
        }
        fileName = "/" + paths[1];
        String filePath = uploadPath.concat(fileName);
        try {
            sftp.put(inputStream, filePath);
            /**
             * 权限
             */
            String permission = "755";
            sftp.chmod(Integer.parseInt(permission, 8), filePath);
            log.info("文件上传成功:{}", filePath);
            return true;
        } catch (SftpException e) {
            log.error("文件上传失败:{}", filePath);
            log.error(ExceptionUtils.getStackTrace(e));
        } finally {
            if (null != inputStream){
                try {
                    inputStream.close();
                } catch (IOException e) {
                    log.error(ExceptionUtils.getStackTrace(e));
                }
            }
            sFtpPoolService.returnObject(sftp);
        }
        return false;
    }

    /**
     * 下载文件
     * @param sftpPath
     * @param fileName
     * @param outputStream
     * @return
     */
    public boolean download(String sftpPath, String fileName, OutputStream outputStream) {
        ChannelSftp sftp = sFtpPoolService.borrowObject();
        String[] paths = PathUtils.handlePath(sftpPath, fileName);
        sftpPath = paths[0];
        fileName = "/" + paths[1];
        String filePath = sftpPath.concat(fileName);
        try (InputStream inputStream = sftp.get(filePath)){
            // 将输入流的数据复制到输出流中
            byte[] bytes = new byte[config.getBufferSize()];
            int len;
            while ((len = inputStream.read(bytes)) != -1) {
                outputStream.write(bytes, 0, len);
            }
            log.info("文件下载成功:{}", filePath);
            return true;
        } catch (Exception e ) {
            log.info("文件下载失败:{}", filePath);
            log.error(ExceptionUtils.getStackTrace(e));
        } finally {
            if (null != outputStream){
                try {
                    outputStream.close();
                } catch (IOException e) {
                    log.error(ExceptionUtils.getStackTrace(e));
                }
            }
            sFtpPoolService.returnObject(sftp);
        }
        return false;
    }

    /**
     * 从SFTP服务器删除文件
     * 存在文件的目录无法删除
     *
     * @param sftpPath  服务器文件存储路径
     * @param fileName 服务器文件存储名称
     * @return 删除结果
     */
    public boolean delete(String sftpPath, String fileName) {
        ChannelSftp sftp = sFtpPoolService.borrowObject();
        String[] paths = PathUtils.handlePath(sftpPath, fileName);
        sftpPath = paths[0];
        fileName = "/" + paths[1];
        String filePath = sftpPath.concat(fileName);
        // 检查文件是否存在
        if (!this.exist(filePath)) {
            log.info("文件不存在:{}", filePath);
            return true;
        }
        // 检查是否为文件夹
        if (this.isDirectory(filePath)) {
            log.info("该路径为文件夹:{}，无法删除", filePath);
            return false;
        }
        try {
            sftp.rm(filePath);
            log.info("文件删除成功:{}", filePath);
            return true;
        } catch (SftpException e) {
            log.info("文件删除失败:{}", filePath);
            log.error(ExceptionUtils.getStackTrace(e));
        } finally {
            sFtpPoolService.returnObject(sftp);
        }
        return false;
    }

    /**
     * 文件复制，目前只支持文件复制
     * @param sourcePath
     * @param targetPath
     */
    public boolean copy(String sourcePath, String targetPath) {
        ChannelSftp sftp1 = sFtpPoolService.borrowObject();
        ChannelSftp sftp2 = sFtpPoolService.borrowObject();
        sourcePath = PathUtils.normalizePath(sourcePath);
        targetPath = PathUtils.normalizePath(targetPath);
        // 检查源文件是否存在
        if (!this.exist(sourcePath)) {
            log.error("复制源文件不存在:{}", sourcePath);
            return false;
        }
        // 检查源文件是否为文件夹
        if (this.isDirectory(sourcePath)) {
            log.error("源文件为文件夹:{}，无法复制", sourcePath);
            return false;
        }
        // 复制
        InputStream inputStream = null;
        try {
            inputStream = sftp1.get(sourcePath);
            sftp2.put(inputStream, targetPath);
            log.info("文件复制成功:{}", sourcePath);
            return true;
        } catch (SftpException e) {
            log.error("文件复制失败:{}", sourcePath);
            log.error(ExceptionUtils.getStackTrace(e));
        } finally {
            if (null != inputStream){
                try {
                    inputStream.close();
                } catch (IOException e) {
                    log.error(ExceptionUtils.getStackTrace(e));
                }
            }
            sFtpPoolService.returnObject(sftp1);
            sFtpPoolService.returnObject(sftp2);
        }
        return false;
    }

    /**
     * 判断SFTP上的path是否为文件夹
     * 注:如果该路径不存在，那么会返回false
     *
     * @param path SFTP上的路径
     * @return 判断结果
     */
    public boolean isDirectory(String path) {
        ChannelSftp sftp = sFtpPoolService.borrowObject();
        // 合法的错误id
        // int legalErrorId = 4;
        try {
            sftp.cd(path);
            return true;
        } catch (SftpException e) {
            // 如果 path不存在，那么报错信息为【No such file】，错误id为【2】
            // 如果 path存在，但是不能cd进去，那么报错信息形如【Can't change directory: /files/sqljdbc4-3.0.jar】，错误id为【4】
            return false;
        } finally {
            sFtpPoolService.returnObject(sftp);
        }
    }

    /**
     * 检查文件是否存在
     * @param filePath
     * @return
     */
    private boolean exist(String filePath) {
        ChannelSftp sftp = sFtpPoolService.borrowObject();
        try {
            sftp.lstat(filePath);
            return true;
        } catch (SftpException e) {
            return false;
        } finally {
            sFtpPoolService.returnObject(sftp);
        }
    }

}
