package com.gccloud.gcpaas.core.user.dto;

import com.gccloud.gcpaas.core.constant.UserStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * 用户编辑 DTO
 */
@Data
@Schema(description = "用户编辑")
public class UserDTO {

    @Schema(description = "主键ID，编辑时必填")
    private String id;

    @Schema(description = "账号")
    @NotBlank(message = "账号不能为空")
    private String account;

    @Schema(description = "用户名")
    @NotBlank(message = "用户名不能为空")
    private String username;

    @Schema(description = "密码")
    private String password;

    @Schema(description = "联系电话")
    private String phone;

    @Schema(description = "角色编码，多个用逗号分隔")
    private String role;

    @Schema(description = "状态")
    @NotNull(message = "状态不能为空")
    private UserStatus status;
}