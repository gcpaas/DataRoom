package com.gccloud.dataroom.core.module.dataset.model.view;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author pan.shun
 * @since 2022/7/21 13:35
 */
@ApiModel
@Data
public class FilterConditionModel {

    @ApiModelProperty(value = "且、或关系")
    private String joiner;

    @ApiModelProperty(value = "字段名称")
    private String field;

    @ApiModelProperty(value = "表名称")
    private String tableName;

    @ApiModelProperty(value = "类型，分为字符串、数值、日期 ")
    private String type;

    @ApiModelProperty(value = "日期类型，分为date、dateTime 、dateMonth 三种")
    private String dateType;

    @ApiModelProperty(value = "当前字段的其他条件")
    private List<ChildrenFilter> children;
}
