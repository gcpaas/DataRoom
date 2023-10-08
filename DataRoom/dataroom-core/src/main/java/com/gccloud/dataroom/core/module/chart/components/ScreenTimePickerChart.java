package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 时间选择
 * @author hongyang
 * @version 1.0
 * @date 2023/09/14 16:44
 */
@Data
public class ScreenTimePickerChart extends Chart {
    
    @ApiModelProperty(notes = "组件类型")
    private String type = PageDesignConstant.BigScreen.Type.TIME_PICKER;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "选择框背景颜色")
        private String backgroundColor;

        @ApiModelProperty(notes = "选择框文字颜色")
        private String fontColor;

        @ApiModelProperty(notes = "选择框文字大小")
        private Integer fontSize;

        @ApiModelProperty(notes = "下拉框背景颜色")
        private String dropDownBackgroundColor;

        @ApiModelProperty(notes = "下拉框字体颜色")
        private String dropDownFontColor;

        @ApiModelProperty(notes = "下拉项hover背景颜色")
        private String dropDownHoverBackgroundColor;

        @ApiModelProperty(notes = "下拉项hover字体颜色")
        private String dropDownHoverFontColor;

        @ApiModelProperty(notes = "下拉项激活文字颜色")
        private String dropDownSelectedFontColor;

        @ApiModelProperty(notes = "时间格式化类型:Date 对象（default），时间戳（timestamp），自定义（custom）")
        private String formatType;

        @ApiModelProperty(notes = "绑定值的格式")
        private String valueFormat;

        @ApiModelProperty(notes = "显示的格式")
        private String format;


    }


}
