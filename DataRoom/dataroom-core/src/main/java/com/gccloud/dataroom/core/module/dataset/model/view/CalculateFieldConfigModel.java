package com.gccloud.dataroom.core.module.dataset.model.view;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author pan.shun
 * @since 2022/7/21 11:27
 */
@Data
@ApiModel
public class CalculateFieldConfigModel {

    @ApiModelProperty(value = "字段描述名称")
    private String name;

    @ApiModelProperty(value = "字段别名")
    private String fieldAlias;

    @ApiModelProperty(value = "配置类型  0、普调配置 1、高级配置")
    private Integer type;

    @ApiModelProperty(value = "表名")
    private String tableName;

    @ApiModelProperty(value = "字段名称")
    private String fieldName;

    @ApiModelProperty(value = "聚合方式")
    private String aggregationMethod;

    @ApiModelProperty(value = "字段表达式")
    private String fieldExpression;

    @ApiModelProperty(value = "是否加入分组聚合 0、不加入 1、加入")
    private Integer ifJoinGroup;
}
