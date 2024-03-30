package com.gccloud.dataroom.core.module.manage.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.common.utils.EmptyAsNullDeserializer;
import com.gccloud.common.validator.group.Insert;
import com.gccloud.common.validator.group.Update;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.util.List;
import java.util.Map;

/**
 * 仪表盘页面
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 10:49
 */
@Data
public class DashboardPageDTO extends BasePageDTO {

    @ApiModelProperty(notes = "仪表盘页图标")
    private String icon;

    @ApiModelProperty(notes = "仪表盘页颜色")
    private String iconColor;

    @ApiModelProperty(notes = "仪表盘整体样式")
    private String style;

    @ApiModelProperty(notes = "页面配置")
    private PageConfig pageConfig;


    @Data
    public static class PageConfig {

        @ApiModelProperty(notes = "背景色")
        private String bgColor;

        @ApiModelProperty(notes = "背景图")
        private String bg;

        @ApiModelProperty(notes = "组件标题线宽度")
        private String titleLineWidth;

        @ApiModelProperty(notes = "组件标题线颜色")
        private String titleLineColor;

        @ApiModelProperty(notes = "组件标题字体大小")
        private String titleFontSize;

        @ApiModelProperty(notes = "组件标题字体颜色")
        private String titleFontColor;

        @ApiModelProperty(notes = "背景透明度")
        private Integer opacity;

        @ApiModelProperty(notes = "定时刷新配置")
        private List<RefreshConfig> refreshConfig;

    }


}
