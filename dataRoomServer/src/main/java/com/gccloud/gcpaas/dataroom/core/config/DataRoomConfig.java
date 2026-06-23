package com.gccloud.gcpaas.dataroom.core.config;

import com.gccloud.gcpaas.dataroom.core.config.bean.Groovy;
import com.gccloud.gcpaas.dataroom.core.config.bean.Jwt;
import com.gccloud.gcpaas.dataroom.core.config.bean.ResourceBean;
import com.gccloud.gcpaas.dataroom.core.config.bean.Sso;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Data
@Configuration
@ConfigurationProperties(prefix = "dataroom")
public class DataRoomConfig {
    /**
     * 公钥
     */
    private String publicKey;
    /**
     * 私钥
     */
    private String privateKey;
    /**
     * jwt
     */
    private Jwt jwt = new Jwt();
    /**
     * 素材资源存储访问配置
     */
    private ResourceBean resource = new ResourceBean();
    /**
     * Groovy 脚本执行配置
     */
    private Groovy groovy = new Groovy();
    /**
     * 单点登录配置
     */
    private Sso sso = new Sso();
}
