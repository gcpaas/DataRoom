package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 下拉选择
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 16:44
 */
@Data
public class ScreenSelectChart extends Chart {
    
    @ApiModelProperty(notes = "组件类型")
    private String type = PageDesignConstant.BigScreen.Type.SELECT;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {
        @ApiModelProperty("输入框背景颜色")
        private String backgroundColor;

        @ApiModelProperty("输入框字体大小")
        private Integer fontSize;

        @ApiModelProperty("输入框字体颜色")
        private String fontColor;

        @ApiModelProperty("下拉框背景颜色")
        private String dropDownBackgroundColor;

        @ApiModelProperty("下拉框字体颜色")
        private String dropDownFontColor;

        @ApiModelProperty("下拉项hover背景颜色")
        private String dropDownHoverBackgroundColor;

        @ApiModelProperty("下拉项hover字体颜色")
        private String dropDownHoverFontColor;

        @ApiModelProperty("激活项背景颜色")
        private String activeBackgroundColor;

        @ApiModelProperty("激活项字体颜色")
        private String activeFontColor;

        @ApiModelProperty("占位提示")
        private String placeholder;

        @ApiModelProperty("边框颜色")
        private String borderColor;

        @ApiModelProperty("占位符字体颜色")
        private String placeholderColor;

        @ApiModelProperty("占位符字体大小")
        private Integer placeholderFontSize;

    }


}
