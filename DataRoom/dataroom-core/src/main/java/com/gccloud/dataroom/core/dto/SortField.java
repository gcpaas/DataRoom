package com.gccloud.dataroom.core.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * 排序
 */
@Data
@ApiModel
public class SortField {

    @ApiModelProperty(notes = "待排序的属性")
    private String fieldName;

    @ApiModelProperty(notes = "排序的方式")
    private String order;
}
