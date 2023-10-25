package com.gccloud.dataroom.core.module.file.service.pool.sftp;

import com.gccloud.dataroom.core.config.bean.DataRoomSftpConfig;
import com.jcraft.jsch.ChannelSftp;
import com.jcraft.jsch.JSch;
import com.jcraft.jsch.Session;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.apache.commons.pool2.BasePooledObjectFactory;
import org.apache.commons.pool2.PooledObject;
import org.apache.commons.pool2.impl.DefaultPooledObject;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;
import java.util.Properties;

/**
 * SFTP 工厂连接对象
 * @author hongyang
 * @version 1.0
 * @date 2023/10/18 15:17
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "sftp")
public class SftpClientFactory extends BasePooledObjectFactory<ChannelSftp>{

    @Resource
    private DataRoomSftpConfig config;

    /**
     * 新建对象
     */
    @Override
    public ChannelSftp create() {
        ChannelSftp channel = null;
        try {
            // 用户名密码不能为空
            if (StringUtils.isBlank(config.getUsername()) || StringUtils.isBlank(config.getPassword())) {
                log.error("SFTP用户名密码不能为空");
                return null;
            }
            JSch jsch = new JSch();
            // 设置私钥
            if (StringUtils.isNotBlank(config.getPrivateKey())) {
                jsch.addIdentity(config.getPrivateKey());
            }
            // jsch的session需要补充设置sshConfig.put("PreferredAuthentications", "publickey,keyboard-interactive,password")来跳过Kerberos认证，同样的HutoolSFTPUtil工具类里面也有这个问题
            Session sshSession = jsch.getSession(config.getUsername(), config.getHost(), config.getPort());
            sshSession.setPassword(config.getPassword());
            Properties sshConfig = new Properties();
            // “StrictHostKeyChecking”如果设置成“yes”，ssh就不会自动把计算机的密匙加入“$HOME/.ssh/known_hosts”文件，并且一旦计算机的密匙发生了变化，就拒绝连接。
            sshConfig.put("StrictHostKeyChecking", "no");
            sshSession.setConfig(sshConfig);
            sshSession.connect();
            channel = (ChannelSftp) sshSession.openChannel("sftp");
            channel.connect();
        } catch (Exception e) {
            log.error("连接 sftp 失败，请检查配置");
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return channel;
    }

    /**
     * 创建一个连接
     *
     * @param channelSftp
     * @return
     */
    @Override
    public PooledObject<ChannelSftp> wrap(ChannelSftp channelSftp) {
        return new DefaultPooledObject<>(channelSftp);
    }

    /**
     * 销毁一个连接
     *
     * @param p
     */
    @Override
    public void destroyObject(PooledObject<ChannelSftp> p) {
        ChannelSftp channelSftp = p.getObject();
        channelSftp.disconnect();
    }

    @Override
    public boolean validateObject(final PooledObject<ChannelSftp> p) {
        final ChannelSftp channelSftp = p.getObject();
        try {
            if (channelSftp.isClosed()) {
                return false;
            }
            channelSftp.cd("/");
        } catch (Exception e) {
            log.error("ChannelSftp 不可用");
            log.error(ExceptionUtils.getStackTrace(e));
            return false;
        }
        return true;
    }

}
