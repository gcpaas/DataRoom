package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Map;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/8/24 17:03
 */
@Data
public class ScreenMarqueeChart extends Chart{


    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.MARQUEE;

    @ApiModelProperty(notes = "自定义处理数据源脚本")
    private String dataHandler;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "标题")
        private String title;

        @ApiModelProperty(notes = "字体大小")
        private Integer fontSize = 20;

        @ApiModelProperty(notes = "字体权重")
        private Integer fontWeight = 700;

        @ApiModelProperty(notes = "图标")
        private Map<String, String> icon;

        @ApiModelProperty(notes = "文字颜色类型: 纯色、渐变")
        private String textColorType;

        @ApiModelProperty(notes = "文字颜色")
        private String textColor;

        @ApiModelProperty(notes = "文字渐变开始颜色")
        private String textGradientColor0;

        @ApiModelProperty(notes = "文字渐变结束颜色")
        private String textGradientColor1;

        @ApiModelProperty(notes = "文字渐变方向")
        private String textGradientDirection;

        @ApiModelProperty(notes = "滚动方向")
        private String direction;

        @ApiModelProperty(notes = "滚动间隔")
        private String dur;

        @ApiModelProperty(notes = "背景色类型：纯色、渐变、透明")
        private String backgroundColorType;

        @ApiModelProperty(notes = "背景色")
        private String backgroundColor;

        @ApiModelProperty(notes = "背景渐变色开始颜色")
        private String bgGradientColor0;

        @ApiModelProperty(notes = "背景渐变色结束颜色")
        private String bgGradientColor1;

        @ApiModelProperty(notes = "背景色渐变方向")
        private String bgGradientDirection;

        @ApiModelProperty(notes = "语音播报")
        private Boolean voiceBroadcast;
    }

}
