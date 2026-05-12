package com.gccloud.gcpaas.core.constant;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * 用户状态枚举
 */
@Getter
@AllArgsConstructor
@Schema(description = "用户状态")
public enum UserStatus {

    /**
     * 正常
     */
    NORMAL("NORMAL", "正常"),

    /**
     * 禁用
     */
    DISABLED("DISABLED", "禁用"),

    /**
     * 密码过期
     */
    PASSWORD_EXPIRED("PASSWORD_EXPIRED", "密码过期");

    /**
     * 状态编码
     */
    @Schema(description = "状态编码")
    private final String code;

    /**
     * 状态描述
     */
    @Schema(description = "状态描述")
    private final String description;
}