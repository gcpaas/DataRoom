package com.gccloud.dataroom.core.module.login.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.hibernate.validator.constraints.Length;

import javax.validation.constraints.NotBlank;

/**
 * @author chen.hu
 * @date 2025/5/6 17:35
 */
@Data
public class SysLoginDTO {
    @NotBlank(message = "用户名不能为空")
    @ApiModelProperty(notes = "用户名")
    @Length(min = 1, max = 100, message = "用户名长度必须在1~100之间")
    private String username;

    @NotBlank(message = "密码不能为空")
    @Length(min = 1, max = 500, message = "密码长度必须在1~500之间")
    @ApiModelProperty(notes = "密码")
    private String password;

    @ApiModelProperty(notes = "验证码")
    private String captcha;

    @ApiModelProperty(notes = "UUID")
    private String uuid;
}
