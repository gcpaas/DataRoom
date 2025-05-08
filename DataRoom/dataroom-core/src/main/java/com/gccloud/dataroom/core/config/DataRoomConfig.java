package com.gccloud.dataroom.core.config;

import com.gccloud.dataroom.core.config.bean.Captcha;
import com.gccloud.dataroom.core.config.bean.DemoEnv;
import com.gccloud.dataroom.core.config.bean.FileConfig;
import com.gccloud.dataroom.core.config.bean.Jwt;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.NestedConfigurationProperty;
import org.springframework.context.annotation.Configuration;

/**
 * @Author qianxing
 * @Date 2020-06-16
 * @Version 1.0.0
 */
@Slf4j
@Configuration
@ConfigurationProperties(prefix = "gc.starter")
@Data
public class DataRoomConfig {

    /**
     * 文件存储配置
     */
    @NestedConfigurationProperty
    private FileConfig file = new FileConfig();
    /**
     * 演示环境
     */
    @NestedConfigurationProperty
    private DemoEnv demoEnv = new DemoEnv();

    /**
     * jwt的配置
     */
    @NestedConfigurationProperty
    private Jwt jwt = new Jwt();
    /**
     * 验证码配置
     */
    @NestedConfigurationProperty
    private Captcha captcha = new Captcha();
}
