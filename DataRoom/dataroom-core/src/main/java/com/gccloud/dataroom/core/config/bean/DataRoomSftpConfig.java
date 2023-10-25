package com.gccloud.dataroom.core.config.bean;

import lombok.Data;
import org.apache.commons.pool2.impl.GenericObjectPoolConfig;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/10/17 15:18
 */
@Configuration
@ConfigurationProperties(prefix = "gc.starter.file.sftp")
@Data
public class DataRoomSftpConfig extends GenericObjectPoolConfig {

    /**
     * sftp服务器地址
     */
    private String host;

    /**
     * sftp服务器端口
     */
    private Integer port;

    /**
     * sftp服务器用户名
     */
    private String username;

    /**
     * sftp服务器密码
     */
    private String password;

    /**
     * 私钥
     */
    private String privateKey;

    /**
     * 缓存大小
     */
    int bufferSize = 1024;


    /* 连接池配置 */


    /**
     * 最大连接数
     */
    int maxTotal = DEFAULT_MAX_TOTAL;
    /**
     * 最小空闲
     */
    int minIdle = DEFAULT_MIN_IDLE;
    /**
     * 最大空闲
     */
    int maxIdle = DEFAULT_MAX_IDLE;
    /**
     * 最大等待时间 10s
     */
    int maxWait = 10000;
    /**
     * 池对象耗尽之后是否阻塞，maxWait < 0 时一直等待
     */
    boolean blockWhenExhausted = DEFAULT_BLOCK_WHEN_EXHAUSTED;
    /**
     * 取对象时验证
     */
    boolean testOnBorrow = true ;
    /**
     * 回收验证
     */
    boolean testOnReturn = true;
    /**
     * 创建时验证
     */
    boolean testOnCreate = true;
    /**
     * 空闲验证
     */
    boolean testWhileIdle = true;
    /**
     * 后进先出
     */
    boolean lifo = DEFAULT_LIFO;


}
