package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * 按钮组件
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 16:44
 */
@Data
public class ScreenButtonChart extends Chart {
    
    @ApiModelProperty(notes = "组件类型")
    private String type = PageDesignConstant.BigScreen.Type.BUTTON;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @ApiModelProperty(notes = "名称")
    private String name;

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "类型")
        private String type;

        @ApiModelProperty(notes = "背景颜色")
        private String backgroundColor;

        @ApiModelProperty(notes = "字体颜色")
        private String fontColor;

        @ApiModelProperty(notes = "字体大小")
        private Integer fontSize;

        @ApiModelProperty(notes = "边框样式")
        private BorderStyle borderStyle;

        @ApiModelProperty(notes = "")
        private List<Object> bindComponents;

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

}
