package com.gccloud.gcpaas.core.config.bean;

import lombok.Data;

/**
 * 单点登录配置
 */
@Data
public class Sso {

    /**
     * 是否启用
     */
    private Boolean enable = true;
    /**
     * 是否默认代理，用于处理无法识别的token
     */
    private Boolean defaultProxy = false;
    /**
     * 颁发者，用于区分token是单点的还是本系统的
     */
    private String issuer = "unknown";
    /**
     * 获取登录用户信息、判断是否登录
     */
    private String currentUserUrl;
    /**
     * 回调认证时其他系统的token名称
     */
    private String tokenKey = "token";
}
