/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.gccloud.dataroom.core.module.file.service.pool.ftp;

import com.gccloud.dataroom.core.config.bean.DataRoomFtpConfig;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.net.ftp.FTPClient;
import org.apache.commons.pool2.impl.GenericObjectPool;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.Resource;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/10/18 10:20
 */
@Slf4j
@Component
@ConditionalOnProperty(prefix = "gc.starter.file", name = "type", havingValue = "ftp")
public class FtpPoolServiceImpl {

    /**
     * ftp 连接池生成
     */
    private GenericObjectPool<FTPClient> pool;

    /**
     * ftp 客户端配置文件
     */
    @Resource
    private DataRoomFtpConfig config;

    /**
     * ftp 客户端工厂
     */
    @Resource
    private FtpClientFactory factory;

    /**
     * 初始化pool
     */
    @PostConstruct
    private void initPool() {
        log.info("初始化FTP连接池");
        this.pool = new GenericObjectPool<FTPClient>(this.factory, this.config);
    }

    /**
     * 获取ftpClient
     */
    public FTPClient borrowObject() {
        log.info("获取 FTPClient");
        if (this.pool != null) {
            try {
                return this.pool.borrowObject();
            } catch (Exception e) {
                log.error("获取 FTPClient 失败 ", e);
            }
        }
        return null;
    }

    /**
     * 归还 ftpClient
     */
    public void returnObject(FTPClient ftpClient) {
        if (this.pool == null || ftpClient == null) {
            return;
        }
        try {
            ftpClient.changeWorkingDirectory("/");
        } catch (Exception e) {
            log.error("FTPClient 重置目录失败 ", e);
        }
        this.pool.returnObject(ftpClient);
    }

}