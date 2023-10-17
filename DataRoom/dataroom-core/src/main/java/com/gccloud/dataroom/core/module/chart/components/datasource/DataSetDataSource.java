package com.gccloud.dataroom.core.module.chart.components.datasource;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.HashMap;
import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2022/11/19 10:45
 */
@Data
public class DataSetDataSource extends BaseChartDataSource {

    @ApiModelProperty(notes = "数据来源，可能为数据集或者表达式")
    private String source;

    @ApiModelProperty(notes = "数据集标识")
    private String businessKey;

    @ApiModelProperty(notes = "数据源标识")
    private String dataSourceKey;

    @ApiModelProperty(notes = "数据集类型")
    private String dataSetType;

    @ApiModelProperty(notes = "数据集参数")
    private HashMap<String, Object> params;

    @ApiModelProperty(notes = "x轴维度字段")
    private String dimensionField;

    @ApiModelProperty(notes = "y轴指标字段")
    private String metricField;

    @ApiModelProperty(notes = "拆分字段")
    private String seriesField;

    @ApiModelProperty(notes = "维度字段列表")
    private List<String> dimensionFieldList;

    @ApiModelProperty(notes = "指标字段列表")
    private List<String> metricFieldList;

    @ApiModelProperty(notes = "拆分字段列表")
    private List<String> seriesFieldList;

    @ApiModelProperty(notes = "服务端分页")
    private Boolean serverPagination;

    @ApiModelProperty(notes = "服务端分页页长")
    private Integer pageSize;

    /**
     * 散点图特殊配置
     */

    @ApiModelProperty(notes = "颜色字段")
    private String colorField;

    @ApiModelProperty(notes = "形状字段")
    private String shapeField;

    @ApiModelProperty(notes = "散点大小字段")
    private String sizeField;

}
