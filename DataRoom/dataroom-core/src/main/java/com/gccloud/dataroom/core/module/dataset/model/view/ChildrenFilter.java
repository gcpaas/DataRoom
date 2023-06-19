package com.gccloud.dataroom.core.module.dataset.model.view;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author pan.shun
 * @since 2022/7/23 14:34
 */
@ApiModel
@Data
public class ChildrenFilter {

    @ApiModelProperty(value = "且、或关系")
    private String joiner;

    @ApiModelProperty(value = "操作符")
    private String op;

    @ApiModelProperty(value = "字段值")
    private String value;
}
