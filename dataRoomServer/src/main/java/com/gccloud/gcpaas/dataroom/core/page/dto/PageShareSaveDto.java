package com.gccloud.gcpaas.dataroom.core.page.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;

@Data
@Schema(description = "页面分享保存参数")
public class PageShareSaveDto {

    @Schema(description = "页面编码")
    private String pageCode;

    @Schema(description = "是否启用分享")
    private Boolean enabled;

    @Schema(description = "过期时间，空表示永不过期")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date expireTime;

    @Schema(description = "IP白名单，一行一个IP或CIDR")
    private String ipWhitelist;

    @Schema(description = "是否刷新token")
    private Boolean refreshToken;
}
