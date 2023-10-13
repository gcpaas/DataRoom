package com.gccloud.dataroom.core.module.chart.bean;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.gccloud.dataroom.core.module.chart.components.datasource.BaseChartDataSource;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * Charts图表
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Data
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "className")
public class Chart {

    @ApiModelProperty(notes = "版本")
    private String version;

    @ApiModelProperty(notes = "key")
    private String key;

    @ApiModelProperty(notes = "图表唯一标识")
    private String code;

    @ApiModelProperty(notes = "数据源")
    private BaseChartDataSource dataSource;

    @ApiModelProperty(notes = "显示图表标题")
    private Boolean showTitle = true;

    @ApiModelProperty(notes = "图表标题")
    private String title;

    @ApiModelProperty(notes = "名称")
    private String name;

    @ApiModelProperty(notes = "组件类型")
    private String type;

    @ApiModelProperty(notes = "宽度")
    private Integer w = 1;

    @ApiModelProperty(notes = "高度")
    private Integer h = 1;

    @ApiModelProperty(notes = "X坐标点")
    private Integer x = 0;

    @ApiModelProperty(notes = "Y坐标点")
    private Integer y = 1;

    @ApiModelProperty(notes = "Z图层")
    private Integer z;

    @ApiModelProperty(notes = "分组标识")
    private String group;

    @ApiModelProperty(notes = "锁定")
    private Boolean locked = false;

    @ApiModelProperty(notes = "联动")
    private Linkage linkage = new Linkage();

    @ApiModelProperty(notes = "联动入参配置")
    private List<InParam> inParams;

    /**
     * 主题配置,格式如下
     *  {
     *     dark: {},
     *     light: {}
     *  }
     */
    @ApiModelProperty(notes = "主题配置")
    private Map<String, Object> theme;


    /**
     * 边框配置,格式如下
     * {
     *    type: '',
     *    titleHeight: 60,
     *    fontSize: 30,
     *    color: ['#5B8FF9', '#61DDAA', '#5D7092', '#F6BD16', '#6F5EF9']
     */
    @ApiModelProperty(notes = "边框配置")
    private Map<String, Object> border;

    @ApiModelProperty(notes = "计算表达式")
    private String expression;

    @ApiModelProperty(notes = "表达式关联的组件的code集合")
    private List<String> expressionCodes;

    @ApiModelProperty(notes = "旋转x")
    private Integer rotateX;

    @ApiModelProperty(notes = "旋转y")
    private Integer rotateY;

    @ApiModelProperty(notes = "旋转z")
    private Integer rotateZ;

    @ApiModelProperty(notes = "透视")
    private Integer perspective;

    @ApiModelProperty(notes = "倾斜x")
    private Integer skewX;

    @ApiModelProperty(notes = "倾斜y")
    private Integer skewY;


}
