package com.gccloud.dataroom.core.module.file.service.pool.ftp;

import com.gccloud.dataroom.core.config.DataRoomConfig;
import com.gccloud.dataroom.core.config.bean.DataRoomFtpConfig;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.commons.net.ftp.FTP;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.net.ftp.FTPReply;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.PooledObjectFactory;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**
 * FtpClient 工厂连接对象
 * @author hongyang
 * @version 1.0
 * @date 2023/10/18 10:17
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "ftp")
public class FtpClientFactory implements PooledObjectFactory<FTPClient> {
    /**
     * 注入 ftp 连接配置
     */
    @Resource
    private DataRoomConfig config;

    /**
     * 创建连接到池中
     *
     * @return
     * @throws Exception
     */
    @Override
    public PooledObject<FTPClient> makeObject() throws Exception {
        log.info("创建ftp连接");
        DataRoomFtpConfig ftp = config.getFile().getFtp();
        FTPClient ftpClient = new FTPClient();
        ftpClient.setConnectTimeout(ftp.getClientTimeout());
        ftpClient.connect(ftp.getHost(), ftp.getPort());
        int reply = ftpClient.getReplyCode();
        if (!FTPReply.isPositiveCompletion(reply)) {
            ftpClient.disconnect();
            return null;
        }
        boolean success;
        if (StringUtils.isBlank(ftp.getUsername())) {
            success = ftpClient.login("anonymous", "anonymous");
        } else {
            success = ftpClient.login(ftp.getUsername(), ftp.getPassword());
        }
        if (!success) {
            return null;
        }
        ftpClient.setFileType(ftp.getTransferFileType());
        ftpClient.setBufferSize(1024);
        ftpClient.setControlEncoding(ftp.getEncoding());
        if (ftp.isPassiveMode()) {
            ftpClient.enterLocalPassiveMode();
        }
        log.debug("创建ftp连接");
        return new DefaultPooledObject<>(ftpClient);
    }

    /**
     * 链接状态检查
     *
     * @param pool
     * @return
     */
    @Override
    public boolean validateObject(PooledObject<FTPClient> pool) {
        FTPClient ftpClient = pool.getObject();
        try {
            return ftpClient != null && ftpClient.sendNoOp();
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * 销毁连接，当连接池空闲数量达到上限时，调用此方法销毁连接
     *
     * @param pool
     * @throws Exception
     */
    @Override
    public void destroyObject(PooledObject<FTPClient> pool) throws Exception {
        FTPClient ftpClient = pool.getObject();
        if (ftpClient != null) {
            try {
                ftpClient.disconnect();
                log.debug("销毁ftp连接");
            } catch (Exception e) {
                log.error("销毁FtpClient异常");
                log.error(ExceptionUtils.getStackTrace(e));
            }
        }
    }

    /**
     * 钝化连接
     * 在连接被归还到连接池时，调用此方法
     * @param p
     * @throws Exception
     */
    @Override
    public void passivateObject(PooledObject<FTPClient> p) throws Exception{
        FTPClient ftpClient = p.getObject();
        try {
            ftpClient.changeWorkingDirectory(config.getFile().getBasePath());
            // 钝化链接时，如果logout，下次再使用重新连接时间会长，所以先不做logout操作
            /*
             * ftpClient.logout();
             * if (ftpClient.isConnected()) {
             *     ftpClient.disconnect();
             * }
             */
        } catch (Exception e) {
            log.error("钝化FtpClient异常");
            log.error(ExceptionUtils.getStackTrace(e));
        }
    }

    /**
     * 激活连接
     * 在连接从连接池中取出时，调用此方法
     * @param pool
     * @throws Exception
     */
    @Override
    public void activateObject(PooledObject<FTPClient> pool) throws Exception {
        DataRoomFtpConfig ftp = config.getFile().getFtp();
        FTPClient ftpClient = pool.getObject();
        if (!ftpClient.isConnected()) {
            log.info("ftp连接已关闭，重新连接");
            ftpClient.connect(ftp.getHost(),ftp.getPort());
            ftpClient.login(ftp.getUsername(), ftp.getPassword());
        }
        ftpClient.setControlEncoding(ftp.getEncoding());
        ftpClient.changeWorkingDirectory(config.getFile().getBasePath());
        // 设置上传文件类型为二进制，否则将无法打开文件
        ftpClient.setFileType(FTP.BINARY_FILE_TYPE);
    }

}
