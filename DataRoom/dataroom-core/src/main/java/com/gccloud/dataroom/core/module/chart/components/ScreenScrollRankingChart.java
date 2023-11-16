package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/22 16:10
 */
@Data
public class ScreenScrollRankingChart extends Chart {

    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.SCREEN_SCROLL_RANKING;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "滚动条数")
        private Integer rowNum;

        @ApiModelProperty(notes = "滚动间隔时间")
        private Integer waitTime;

        @ApiModelProperty(notes = "是否轮播")
        private String carousel;

        @ApiModelProperty(notes = "单位")
        private String unit;

        @ApiModelProperty(notes = "是否自动排序")
        private Boolean sort;

        @ApiModelProperty("排名字体大小")
        private Integer rankFontSize;

        @ApiModelProperty("排名字体颜色")
        private String rankColor;

        @ApiModelProperty("名称字体大小")
        private Integer infoNameFontSize;

        @ApiModelProperty("名称字体颜色")
        private String infoNameColor;

        @ApiModelProperty("值字体大小")
        private Integer rankingValueFontSize;

        @ApiModelProperty("值字体颜色")
        private String rankingValueColor;

        @ApiModelProperty("内部柱子颜色")
        private String insideColumnColor;

        @ApiModelProperty("排名柱子底部颜色")
        private String rankingColumnBorderBottomColor;

    }

}
