package com.gccloud.dataroom.core.module.chart.dto;

import com.gccloud.dataroom.core.module.chart.bean.Chart;
import com.gccloud.dataroom.core.module.chart.bean.Filter;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * 数据查询
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Data
public class ChartDataSearchDTO {

    @ApiModelProperty(notes = "页面编码")
    private String pageCode;

    @ApiModelProperty(notes = "图表编码")
    private String chartCode;

    @ApiModelProperty(notes = "内部图表编码")
    private String innerChartCode;

    @ApiModelProperty(notes = "类型")
    private String type;

    @ApiModelProperty(notes = "当前页")
    private Integer current;

    @ApiModelProperty(notes = "每页记录数")
    private Integer size;

    @ApiModelProperty(notes = "树父节点id")
    private String treeParentId;

    @ApiModelProperty(notes = "图表配置，仅在根据配置临时获取数据时使用")
    private Chart chart;

    @ApiModelProperty(notes = "过滤条件")
    private List<Filter> filterList;

}

