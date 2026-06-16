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
     * 获取登录用户信息、判断是否登录
     */
    private String currentUserUrl;
    /**
     * 单点登录适配器
     */
    private String adapter = "default";
    /**
     * 回调认证时其他系统的token名称
     */
    private String headerKey = "token";
    /**
     * 回调认证时其他系统的token值前缀，如：Bearer
     */
    private String headerValuePrefix = "";

}
