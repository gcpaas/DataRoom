package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 装饰
 * @author hongyang
 * @version 1.0
 * @date 2023/3/16 9:53
 */
@Data
public class ScreenDecorationChart extends Chart {

    @ApiModelProperty(notes = "个性化配置")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "装饰颜色1")
        private String decorationColor1;

        @ApiModelProperty(notes = "装饰颜色2")
        private String decorationColor2;

        @ApiModelProperty(notes = "是否反转")
        private Boolean reverse;

        @ApiModelProperty(notes = "动画时长")
        private Integer dur;

        @ApiModelProperty(notes = "扫描动画时长")
        private Integer scanDur;

        @ApiModelProperty(notes = "光晕动画时长")
        private Integer haloDur;

        @ApiModelProperty(notes = "标题")
        private String title;

        @ApiModelProperty(notes = "字体大小")
        private Integer fontSize;

        @ApiModelProperty(notes = "字体粗细")
        private Integer fontWeight;

        @ApiModelProperty(notes = "字体颜色")
        private String color;

        @ApiModelProperty(notes = "边框颜色")
        private String borderColor;

        @ApiModelProperty(notes = "边框宽度")
        private Integer borderWidth;
    }

}
