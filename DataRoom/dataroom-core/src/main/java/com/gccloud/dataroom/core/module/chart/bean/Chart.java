package com.gccloud.dataroom.core.module.chart.bean;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.gccloud.dataroom.core.module.chart.components.datasource.BaseChartDataSource;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * Charts图表
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Data
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "className")
public class Chart {

    @ApiModelProperty(notes = "图表唯一标识")
    private String code;

    @ApiModelProperty(notes = "数据源")
    private BaseChartDataSource dataSource;

    @ApiModelProperty(notes = "显示图表标题")
    private Boolean showTitle = true;

    @ApiModelProperty(notes = "图表标题")
    private String title;

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

    @ApiModelProperty(notes = "出码用到的图表信息")
    private CodeGeneratorInfo codeGeneratorInfo = new CodeGeneratorInfo();

    @Data
    public static class CodeGeneratorInfo {

        @ApiModelProperty(notes = "图表数据查询接口地址")
        private String dataUrl;

        @ApiModelProperty(notes = "图表组件配置是否完善")
        private Boolean configComplete;

    }

}
