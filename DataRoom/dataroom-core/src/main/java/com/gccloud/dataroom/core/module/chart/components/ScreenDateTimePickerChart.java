package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Map;

/**
 * 日期时间选择
 * @author hongyang
 * @version 1.0
 * @date 2023/09/14 16:44
 */
@Data
public class ScreenDateTimePickerChart extends Chart {
    
    @ApiModelProperty(notes = "组件类型")
    private String type = PageDesignConstant.BigScreen.Type.DATE_TIME_PICKER;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "选择框背景颜色")
        private String bgColor;

        @ApiModelProperty(notes = "选择框文字颜色")
        private String fontColor;

        @ApiModelProperty(notes = "选择框文字大小")
        private Integer fontSize;

        @ApiModelProperty(notes = "显示类型 year/month/date/week/ datetime/datetimerange/daterange")
        private String type;

        @ApiModelProperty(notes = "时间格式化类型:Date 对象（default），时间戳（timestamp），自定义（custom）")
        private String formatType;

        @ApiModelProperty(notes = "绑定值的格式")
        private String valueFormat;

        @ApiModelProperty(notes = "显示的格式")
        private String format;

        @ApiModelProperty(notes = "下拉框")
        private Map<String, Object> dropDownBox;

    }


}
