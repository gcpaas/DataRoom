package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * tab切换
 * @author hongyang
 * @version 1.0
 * @date 2023/8/24 17:03
 */
@Data
public class ChartTabChart extends Chart{


    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.TAB_CHART;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "组件tab列表")
        private List<Tab> tabList;

        @ApiModelProperty(notes = "字体大小")
        private Integer fontSize;

        @ApiModelProperty(notes = "字体粗细")
        private Integer fontWeight;

        @ApiModelProperty(notes = "字体颜色")
        private String color;

        @ApiModelProperty(notes = "线条颜色")
        private String lineColor;

        @ApiModelProperty(notes = "线条位置")
        private String position;

    }

    @Data
    public static class Tab {

        @ApiModelProperty(notes = "组件编码")
        private String chartCode;

        @ApiModelProperty(notes = "组件名称")
        private String name;

        @ApiModelProperty(notes = "tab图表")
        private Chart chart;
    }

    /**
     * 获取内部图表
     * @param chartCode
     * @return
     */
    public Chart getInnerChart(String chartCode) {
        if (customize == null) {
            return null;
        }
        if (customize.tabList == null || customize.tabList.isEmpty()) {
            return null;
        }
        for (Tab tab : customize.tabList) {
            if (tab.getChartCode().equals(chartCode)) {
                return tab.getChart();
            }
        }
        return null;
    }

}
