package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 输入框
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 16:44
 */
@Data
public class ScreenInputChart extends Chart {
    
    @ApiModelProperty(notes = "组件类型")
    private String type = PageDesignConstant.BigScreen.Type.INPUT;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "是否显示标题")
        private boolean showTitle;

        @ApiModelProperty(notes = "标题")
        private String title;

        @ApiModelProperty(notes = "标题样式")
        private TitleStyle titleStyle;

        @ApiModelProperty(notes = "输入框样式")
        private InputStyle inputStyle;

        @ApiModelProperty(notes = "占位符样式")
        private PlaceholderStyle placeholderStyle;

        @ApiModelProperty(notes = "边框样式")
        private BorderStyle borderStyle;

        @ApiModelProperty(notes = "背景样式")
        private BackgroundStyle backgroundStyle;

        @ApiModelProperty(notes = "图标")
        private Icon icon;

    }

    @Data
    public static class Icon {
        @ApiModelProperty(notes = "图标名称")
        private String name;

        @ApiModelProperty(notes = "位置")
        private String position;
    }

    @Data
    public static class InputStyle {
        @ApiModelProperty(notes = "输入值字体大小")
        private Integer fontSize;

        @ApiModelProperty(notes = "输入值字体颜色")
        private String color;

    }

    @Data
    public static class TitleStyle {
        @ApiModelProperty(notes = "标题大小")
        private Integer fontSize;

        @ApiModelProperty(notes = "标题颜色")
        private String color;

        @ApiModelProperty(notes = "标题间距")
        private Integer marginRight;
    }

    @Data
    public static class BorderStyle {
        @ApiModelProperty(notes = "边框颜色")
        private String borderColor;

        @ApiModelProperty(notes = "边框宽度")
        private Integer borderWidth;

        @ApiModelProperty(notes = "边框样式")
        private String borderStyle;

        @ApiModelProperty(notes = "边框圆角")
        private Integer borderRadius;
    }

    @Data
    public static class BackgroundStyle {
        @ApiModelProperty(notes = "背景颜色")
        private String backgroundColor;
    }


    @Data
    public static class PlaceholderStyle {

        @ApiModelProperty(notes = "占位符")
        private String placeholder;

        @ApiModelProperty(notes = "占位符字体颜色")
        private String placeholderColor;

        @ApiModelProperty(notes = "占位符字体大小")
        private Integer placeholderFontSize;

    }
}
