package com.gccloud.dataroom.core.module.chart.dto;

import com.gccloud.dataroom.core.module.chart.bean.Filter;
import com.gccloud.dataroom.core.module.chart.components.datasource.DataSetDataSource;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

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

    @ApiModelProperty(notes = "当前页")
    private Integer current;

    @ApiModelProperty(notes = "每页记录数")
    private Integer size;

    @ApiModelProperty(notes = "数据来源")
    private DataSetDataSource dataSource;

    @ApiModelProperty(notes = "过滤条件")
    private List<Filter> filterList;

}

