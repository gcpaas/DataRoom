package com.gccloud.dataroom.core.module.file.service.pool.sftp;

import com.gccloud.dataroom.core.config.bean.DataRoomSftpConfig;
import com.jcraft.jsch.ChannelSftp;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;

/**
 * Sftp 连接池服务类
 * @author hongyang
 * @version 1.0
 * @date 2023/10/18 15:21
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "sftp")
public class SftpPoolService {

    /**
     * ftp 连接池生成
     */
    private GenericObjectPool<ChannelSftp> pool;

    /**
     * ftp 客户端配置文件
     */
    @Resource
    private DataRoomSftpConfig config;

    /**
     * ftp 客户端工厂
     */
    @Resource
    private SftpClientFactory factory;

    /**
     * 初始化pool
     */
    @PostConstruct
    private void initPool() {
        log.info("初始化SFTP连接池");
        this.pool = new GenericObjectPool<ChannelSftp>(this.factory, this.config);
    }

    /**
     * 获取sftp
     */
    public ChannelSftp borrowObject() {
        if (this.pool != null) {
            try {
                return this.pool.borrowObject();
            } catch (Exception e) {
                log.error("获取 ChannelSftp 失败", e);
                e.printStackTrace();
            }
        }
        return null;
    }

    /**
     * 归还 sftp
     */
    public void returnObject(ChannelSftp channelSftp) {
        if (this.pool != null && channelSftp != null) {
            this.pool.returnObject(channelSftp);
        }
    }

}
