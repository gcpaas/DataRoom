package com.gccloud.dataroom.core.module.login.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;


/**
 * @author chen.hu
 * @date 2025/5/8 18:21
 */
@Data
public class SysCurrentUserVO {
    @ApiModelProperty(notes = "用户ID")
    private String userId;

    @ApiModelProperty(notes = "用户名")
    private String username;

}
