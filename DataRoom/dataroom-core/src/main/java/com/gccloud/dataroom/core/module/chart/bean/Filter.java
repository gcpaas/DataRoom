package com.gccloud.dataroom.core.module.chart.bean;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * 过滤条件
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Data
public class Filter {
    @ApiModelProperty(notes = "表格列")
    private String column;
    @ApiModelProperty(notes = "条件")
    private String operator;
    @ApiModelProperty(notes = "值")
    private List<String> value;
}
