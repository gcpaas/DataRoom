package com.gccloud.gcpaas.dataroom.core.page.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.gccloud.gcpaas.dataroom.core.constant.PageType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.Date;

@Data
@Schema(description = "页面分享配置")
public class PageShareVo {

    @Schema(description = "页面编码")
    private String pageCode;

    @Schema(description = "页面类型")
    private PageType pageType;

    @Schema(description = "是否启用分享")
    private Boolean enabled;

    @Schema(description = "过期时间，空表示永不过期")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date expireTime;

    @Schema(description = "IP白名单，一行一个IP或CIDR")
    private String ipWhitelist;

    @Schema(description = "分享token")
    private String token;

    @Schema(description = "分享链接")
    private String shareUrl;

    @Schema(description = "是否已创建分享记录")
    private Boolean created;
}
