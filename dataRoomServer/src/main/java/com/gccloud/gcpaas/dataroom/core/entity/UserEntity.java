package com.gccloud.gcpaas.dataroom.core.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.gcpaas.dataroom.core.constant.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;
import java.util.Collections;
import java.util.Date;
import java.util.List;

/**
 * 用户实体
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "用户")
@TableName(value = "dr_user", autoResultMap = true)
public class UserEntity extends BaseEntity {

    /**
     * 账号
     */
    @Schema(description = "账号")
    private String account;

    /**
     * 用户名
     */
    @Schema(description = "用户名")
    private String username;

    /**
     * 密码
     */
    @Schema(description = "密码")
    private String password;

    /**
     * 联系电话
     */
    @Schema(description = "联系电话")
    private String phone;

    /**
     * 角色编码，多个用逗号分隔
     */
    @Schema(description = "角色编码，多个用逗号分隔")
    private String role;

    /**
     * 状态
     */
    @Schema(description = "状态")
    private UserStatus status;

    /**
     * 连续登录密码错误次数
     */
    @Schema(description = "连续登录密码错误次数")
    private Integer loginFailCount;

    /**
     * 登录锁定截止时间
     */
    @Schema(description = "登录锁定截止时间")
    private Date loginLockedUntil;

    /**
     * 有效期截止时间，空表示永久有效
     */
    @Schema(description = "有效期截止时间，空表示永久有效")
    private Date expireDate;

    /**
     * 获取角色列表（兼容旧版 roleCodeList）
     */
    @Schema(description = "角色编码列表", hidden = true)
    @TableField(exist = false)
    private List<String> roleCodeList;

    /**
     * 获取角色列表
     */
    public List<String> getRoleCodeList() {
        if (StringUtils.isBlank(role)) {
            return Collections.emptyList();
        }
        return Arrays.asList(role.split(","));
    }

}
