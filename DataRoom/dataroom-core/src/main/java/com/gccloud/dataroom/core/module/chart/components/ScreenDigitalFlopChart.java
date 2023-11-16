package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Map;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/24 14:36
 */
@Data
public class ScreenDigitalFlopChart extends Chart {

    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.DIGITAL_FLOP;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "字体颜色")
        private String color;

        @ApiModelProperty(notes = "背景颜色")
        private String bgColor;

        @ApiModelProperty(notes = "字体大小")
        private Integer fontSize;

        @ApiModelProperty(notes = "宽度")
        private Integer width;

        @ApiModelProperty(notes = "圆角")
        private Integer borderRadius;

        @ApiModelProperty(notes = "格式化")
        private Integer formatter;

        @ApiModelProperty(notes = "字体粗细")
        private String fontWeight;

        @ApiModelProperty(notes = "左侧插槽")
        private String slotLeft;

        @ApiModelProperty(notes = "右侧插槽")
        private String slotRight;

        @ApiModelProperty(notes = "右侧margin")
        private Integer marginRight;

        @ApiModelProperty(notes = "数字位数")
        private Integer numberDigits;

        @ApiModelProperty(notes = "占位符")
        private String placeHolder;

        @ApiModelProperty(notes = "高度")
        private Integer height;

        @ApiModelProperty(notes = "边框颜色")
        private String borderColor;

        @ApiModelProperty(notes = "边框宽度")
        private Integer borderWidth;

        @ApiModelProperty("字体")
        private String fontFamily;

        @ApiModelProperty("线条样式")
        private Map<String, Object> lineStyle;



    }

}
