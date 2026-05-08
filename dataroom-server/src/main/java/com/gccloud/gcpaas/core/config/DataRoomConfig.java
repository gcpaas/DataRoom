package com.gccloud.gcpaas.core.config;

import com.gccloud.gcpaas.core.config.bean.Jwt;
import com.gccloud.gcpaas.core.config.bean.ResourceBean;
import com.gccloud.gcpaas.core.config.bean.Sso;
import com.gccloud.gcpaas.core.entity.UserEntity;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.ArrayList;
import java.util.List;

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
     * 单点登录配置
     */
    private List<Sso> ssoList = new ArrayList<>();
    /**
     * 用户配置
     */
    private List<UserEntity> userList = new ArrayList<>();
}
