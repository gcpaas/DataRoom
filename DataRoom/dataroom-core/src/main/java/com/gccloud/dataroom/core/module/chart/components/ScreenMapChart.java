package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.module.chart.bean.Chart;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 地图组件
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 16:44
 */
@Data
public class ScreenMapChart extends Chart {

    @ApiModelProperty(notes = "组件类型")
    private String type = PageDesignConstant.DataRoom.Type.MAP;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "是否显示文字")
        private Boolean mapName;

        @ApiModelProperty(notes = "地图背景色")
        private String backgroundColor;

        @ApiModelProperty(notes = "是否打点")
        private Boolean scatter;

        @ApiModelProperty(notes = "悬浮框背景色")
        private String tooltipBackgroundColor;

        @ApiModelProperty(notes = "悬浮框边框色")
        private String borderColor;

        @ApiModelProperty(notes = "打点图背景颜色")
        private String scatterBackgroundColor;

        @ApiModelProperty(notes = "打点图文字颜色")
        private String scatterColor;

        @ApiModelProperty(notes = "分割线颜色")
        private String mapLineColor;

        @ApiModelProperty(notes = "地图级别")
        private String level;

        @ApiModelProperty(notes = "范围")
        private String scope;

        @ApiModelProperty(notes = "地图区域颜色")
        private String areaColor;

        @ApiModelProperty(notes = "是否开启筛选")
        private Boolean visual;

        @ApiModelProperty(notes = "筛选范围")
        private String[] range;

        @ApiModelProperty(notes = "从上到下的颜色")
        private String[] rangeColor;

        @ApiModelProperty(notes = "地图数据")
        private String dataMap;

        @ApiModelProperty(notes = "经度")
        private String xaxis;

        @ApiModelProperty(notes = "纬度")
        private String yaxis;

        @ApiModelProperty(notes = "名称")
        private String name;

        @ApiModelProperty(notes = "值")
        private String value;

    }


}
