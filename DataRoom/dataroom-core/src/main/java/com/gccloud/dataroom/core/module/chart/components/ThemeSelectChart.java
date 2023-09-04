package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 主题选择器
 * @author hongyang
 * @version 1.0
 * @date 2023/8/24 17:03
 */
@Data
public class ThemeSelectChart extends Chart{


    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.THEME_SELECT;

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

        @ApiModelProperty(notes = "字体颜色")
        private String color;

    }

}
