package com.gccloud.dataroom.core.module.login.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author chen.hu
 * @date 2025/5/6 17:36
 */
@Data
public class SysTokenVO {
    @ApiModelProperty(notes = "token")
    private String token;

    @ApiModelProperty(notes = "refreshToken")
    private String refreshToken;
}
