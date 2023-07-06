package com.gccloud.dataroom.core.module.chart.components;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.bean.Btn;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import com.gccloud.dataroom.core.module.chart.bean.Field;
import com.gccloud.dataroom.core.module.chart.components.datasource.BaseChartDataSource;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 16:44
 */
@Data
public class ScreenTablesChart extends Chart {
    @ApiModelProperty(notes = "数据源")
    private BaseChartDataSource dataSource;

    @ApiModelProperty(notes = "版本")
    private String version;

    @ApiModelProperty(notes = "类型")
    private String type = PageDesignConstant.BigScreen.Type.TABLES;

    @ApiModelProperty(notes = "个性化")
    private Customize customize = new Customize();

    @ApiModelProperty(notes = "快速筛选项配置")
    private List<Field> fields;

    @ApiModelProperty(notes = "查询表单按钮")
    private List<Btn> btns;

    @ApiModelProperty(notes = "操作按钮")
    private List<Btn> opts;

    @ApiModelProperty(notes = "列按钮")
    private List<Btn> colBtns;

    @Data
    public static class Customize {

        @ApiModelProperty(notes = "是否前端分页")
        private boolean webPagination = false;

        @ApiModelProperty(notes = "分页页长，0表示不分页，仅在服务端分页未开启时生效")
        private Integer pageSize;

        /**
         * 大屏表格属性
         */

        @ApiModelProperty(notes = "表格主题")
        private String theme = "dark";

        @ApiModelProperty(notes = "表格头部背景颜色")
        private String headerBackgroundColor = "#1d1d1d";

        @ApiModelProperty(notes = "表格头部字体颜色")
        private String headerFontColor = "#ffffff";

        @ApiModelProperty(notes = "表格头部字体大小")
        private Integer headerFontSize = 14;

        @ApiModelProperty(notes = "表格主体背景颜色")
        private String bodyBackgroundColor = "#1d1d1d";

        @ApiModelProperty(notes = "表格主体字体颜色")
        private String bodyFontColor = "#ffffff";

        @ApiModelProperty(notes = "表格主体字体大小")
        private Integer bodyFontSize = 14;

        @ApiModelProperty(notes = "是否开启斑马纹")
        private boolean stripe = false;

        @ApiModelProperty(notes = "表格偶数行背景颜色")
        private String evenRowBackgroundColor;

        @ApiModelProperty(notes = "表格奇数行背景颜色")
        private String oddRowBackgroundColor;

    }


}
