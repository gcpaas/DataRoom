package com.gccloud.dataroom.core.module.dataset.model;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * @author pan.shun
 * @since 2022/7/26 16:23
 */
@ApiModel
@Data
@Builder
public class SqlConditionModel {

    @ApiModelProperty(value = "字段名")
    private String field;

    @ApiModelProperty(value = "表名")
    private String tableName;

    @ApiModelProperty(value = "操作符")
    private String op;

    @ApiModelProperty(value = "值")
    private String value;

    @ApiModelProperty(value = "类型：分为字符串(text)、数值(number)和日期(date)三种")
    private String type;

    @ApiModelProperty(value = "与或连接")
    private String joiner;

    @ApiModelProperty(value = "数据源类型")
    private String sourceType;

    @ApiModelProperty(value = "日期类型")
    private String dateType;

    @Override
    public String toString() {
        return "SqlConditionModel{" +
                "field='" + field + '\'' +
                ", tableName='" + tableName + '\'' +
                ", op='" + op + '\'' +
                ", value='" + value + '\'' +
                ", type='" + type + '\'' +
                ", joiner='" + joiner + '\'' +
                ", sourceType='" + sourceType + '\'' +
                ", dateType='" + dateType + '\'' +
                '}';
    }
}
