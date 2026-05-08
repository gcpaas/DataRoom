package com.gccloud.gcpaas.core.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import lombok.Data;

import java.util.List;

/**
 * 用户
 */
@Data
public class UserEntity {
    /**
     * 账号
     */
    private String username;
    /**
     * 登录密码
     */
    private String password;
    /**
     * 姓名
     */
    private String realName;
    /**
     * 手机号
     */
    private String phone;
    /**
     * 邮箱
     */
    private String email;
    /**
     * 状态
     */
    private String state;
    /**
     * 租户编码
     */
    private String tenantCode;
    /**
     * 角色编码
     */
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<String> roleCodeList;
}
