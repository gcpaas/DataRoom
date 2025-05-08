package com.gccloud.dataroom.core.module.login.cache;

import com.fasterxml.jackson.annotation.JsonIgnore;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Date;

/**
 * @author chen.hu
 * @date 2025/5/7 11:03
 */
@Data
@ApiModel
public class SysTokenCache {

    @ApiModelProperty(notes = "token标识")
    private String id;

    @JsonIgnore
    @ApiModelProperty(notes = "token")
    private String token;

    @JsonIgnore
    @ApiModelProperty(notes = "refreshToken")
    private String refreshToken;

    @ApiModelProperty(notes = "用户名称")
    private String userName;

    @ApiModelProperty(notes = "登录的客户端IP")
    private String ip;

    @ApiModelProperty(notes = "设备名")
    private String deviceName;

    @ApiModelProperty(notes = "浏览器")
    private String browserName;

    @ApiModelProperty(notes = "用户代理")
    private String userAgent;

    @ApiModelProperty(notes = "创建时间")
    private Date createDate;

    @ApiModelProperty(notes = "最后访问时间")
    private Date updateDate;

    @ApiModelProperty(notes = "到期时间")
    private Date deadDate;

    @ApiModelProperty(notes = "有效期")
    private String expireTime;
}
