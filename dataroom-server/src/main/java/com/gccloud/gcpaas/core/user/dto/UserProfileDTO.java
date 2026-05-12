package com.gccloud.gcpaas.core.user.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * 当前用户更新个人信息 DTO
 */
@Data
@Schema(description = "更新个人信息")
public class UserProfileDTO {

    @Schema(description = "用户名")
    @NotBlank(message = "用户名不能为空")
    private String username;

    @Schema(description = "新密码（可选，不修改则为空）")
    private String password;
}