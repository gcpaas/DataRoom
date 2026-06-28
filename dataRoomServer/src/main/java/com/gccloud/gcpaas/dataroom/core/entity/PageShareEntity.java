package com.gccloud.gcpaas.dataroom.core.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.gccloud.gcpaas.dataroom.core.constant.PageType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

import java.util.Date;

/**
 * 页面分享配置
 */
@Data
@EqualsAndHashCode(callSuper = true)
@Schema(description = "页面分享配置")
@TableName("dr_page_share")
public class PageShareEntity extends BaseEntity {

    @Schema(description = "页面编码")
    private String pageCode;

    @Schema(description = "页面类型")
    private PageType pageType;

    @Schema(description = "分享token")
    private String token;

    @Schema(description = "是否启用")
    private Boolean enabled;

    @Schema(description = "过期时间，空表示永不过期")
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", timezone = "GMT+8")
    private Date expireTime;

    @Schema(description = "IP白名单，一行一个IP或CIDR")
    private String ipWhitelist;
}
