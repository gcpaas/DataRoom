package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 指标卡组件
 * @author hongyang
 * @version 1.0
 * @date 2023/10/7 10:58
 */
@Data
public class ScreenIndexCardChart extends Chart {

    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.INDEX_CARD;

    @ApiModelProperty(notes = "个性化配置")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "图片地址")
        private String src;

        @ApiModelProperty(notes = "边框圆角")
        private Integer borderRadius;

        @ApiModelProperty(notes = "边框宽度")
        private Integer borderWidth;

        @ApiModelProperty(notes = "边框线距离")
        private Integer lineDistance;

        @ApiModelProperty(notes = "边框颜色")
        private String borderColor;

        @ApiModelProperty(notes = "背景颜色")
        private String bgColor;

        @ApiModelProperty(notes = "距离")
        private Integer distance;

        @ApiModelProperty(notes = "图片大小")
        private Integer imgSize;

        @ApiModelProperty(notes = "第一行字体大小")
        private Integer firstSize;

        @ApiModelProperty(notes = "第一行字体颜色")
        private String firstColor;

        @ApiModelProperty(notes = "第一行字体粗细")
        private Integer firstWeight;

        @ApiModelProperty(notes = "第二行字体大小")
        private Integer secondSize;

        @ApiModelProperty(notes = "第二行字体颜色")
        private String secondColor;

        @ApiModelProperty(notes = "第二行字体粗细")
        private Integer secondWeight;

        @ApiModelProperty(notes = "第二行字体内容")
        private String secondLine;

        @ApiModelProperty(notes = "字体")
        private String fontFamily;

        @ApiModelProperty(notes = "单位")
        private String unit;

        @ApiModelProperty(notes = "单位字体大小")
        private Integer unitSize;

        @ApiModelProperty(notes = "单位字体颜色")
        private String unitColor;

        @ApiModelProperty(notes = "渐变方向")
        private String gradientDirection;

        @ApiModelProperty(notes = "渐变颜色0")
        private String gradientColor0;

        @ApiModelProperty(notes = "渐变颜色1")
        private String gradientColor1;

    }

}
