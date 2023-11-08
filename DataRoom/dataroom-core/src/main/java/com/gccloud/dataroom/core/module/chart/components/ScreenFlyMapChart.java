package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 飞线地图
 * @author hongyang
 * @version 1.0
 * @date 2023/8/24 17:03
 */
@Data
public class ScreenFlyMapChart extends Chart{


    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.FLY_MAP;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "数据配置")
        private Map<String, Object> dataField;

        @ApiModelProperty(notes = "地图id")
        private String mapId;

        @ApiModelProperty(notes = "是否显示文字")
        private Boolean mapName;

        @ApiModelProperty(notes = "文字颜色")
        private String mapNameColor;

        @ApiModelProperty(notes = "文字大小")
        private Integer mapNameSize;

        @ApiModelProperty(notes = "文字权重")
        private Integer mapNameWeight;

        @ApiModelProperty(notes = "悬浮框背景色")
        private String tooltipBackgroundColor;

        @ApiModelProperty(notes = "悬浮框边框色")
        private String borderColor;

        @ApiModelProperty(notes = "悬浮框字体颜色")
        private String fontColor;

        @ApiModelProperty(notes = "打点图背景颜色")
        private String scatterBackgroundColor;

        @ApiModelProperty(notes = "打点图文字颜色")
        private String scatterColor;

        @ApiModelProperty(notes = "打点图中心点文字颜色")
        private String scatterCenterColor;

        @ApiModelProperty(notes = "分割线颜色")
        private String mapLineColor;

        @ApiModelProperty(notes = "是否开启下钻")
        private Boolean down;

        @ApiModelProperty(notes = "允许下钻的层级")
        private Integer downLevel;

        @ApiModelProperty(notes = "轨迹图像")
        private String symbol;

        @ApiModelProperty(notes = "轨迹颜色")
        private String symbolColor;

        @ApiModelProperty(notes = "轨迹大小")
        private Integer symbolSize;

        @ApiModelProperty(notes = "地图级别")
        private String level;

        @ApiModelProperty(notes = "范围")
        private String scope;

        @ApiModelProperty(notes = "地图区域颜色")
        private String areaColor;

        @ApiModelProperty(notes = "是否开启筛选")
        private Boolean visual;

        @ApiModelProperty(notes = "筛选范围")
        private List<Integer> range;

        @ApiModelProperty(notes = "打点图格式化脚本")
        private String scatterFormatter;

        @ApiModelProperty(notes = "轨迹格式化脚本")
        private String lineFormatter;

        @ApiModelProperty(notes = "从上到下的颜色")
        private List<String> rangeColor;

        @ApiModelProperty(notes = "地图数据")
        private String dataMap;

        @ApiModelProperty(notes = "展示字段")
        private String value;

        @ApiModelProperty(notes = "横坐标")
        private String xaxis;

        @ApiModelProperty(notes = "纵坐标")
        private String yaxis;

        @ApiModelProperty(notes = "名称")
        private String name;

        @ApiModelProperty(notes = "图形")
        private List<String> graphic;

        @ApiModelProperty(notes = "图形字体颜色")
        private String fontGraphicColor;

        @ApiModelProperty(notes = "图形字体大小")
        private String fontSize;

    }

}
