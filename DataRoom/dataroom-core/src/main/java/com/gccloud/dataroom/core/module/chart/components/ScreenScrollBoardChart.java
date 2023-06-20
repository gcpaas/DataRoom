package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.HashMap;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/22 14:50
 */
@Data
public class ScreenScrollBoardChart extends Chart {

    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.SCREEN_SCROLL_BOARD;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @Data
    public static class Customize{

        @ApiModelProperty(notes = "列配置")
        private List<HashMap<String, Object>> columnConfig;

        @ApiModelProperty(notes = "滚动条数")
        private Integer rowNum;

        @ApiModelProperty(notes = "表头背景色")
        private String headerBGC;

        @ApiModelProperty(notes = "奇数行背景色")
        private String oddRowBGC;

        @ApiModelProperty(notes = "偶数行背景色")
        private String evenRowBGC;

        @ApiModelProperty(notes = "滚动间隔时间")
        private Integer waitTime;

        @ApiModelProperty(notes = "表头高度")
        private Integer headerHeight;

        @ApiModelProperty(notes = "列宽")
        private List<String> columnWidth;

        @ApiModelProperty(notes = "对齐方式")
        private List<String> align;

        @ApiModelProperty(notes = "是否显示行号")
        private Boolean index;

        @ApiModelProperty(notes = "序号表头")
        private String indexHeader;

        @ApiModelProperty(notes = "滚动方向")
        private String carousel;

        @ApiModelProperty(notes = "鼠标悬停是否暂停")
        private Boolean hoverPause;
    }

}
