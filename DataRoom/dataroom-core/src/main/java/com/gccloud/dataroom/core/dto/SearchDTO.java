package com.gccloud.dataroom.core.dto;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 查询DTO，其他查询可以继承该类实现查询条件扩展
 *
 * @Author maoshufeng
 * @Date 2020-06-13 15:08
 * @Version 1.0
 */
@Data
@ApiModel
public class SearchDTO {

    @ApiModelProperty(notes = "当前显示页数")
    private Integer current;

    @ApiModelProperty(notes = "每页展示数据条数")
    private Integer size;

    @ApiModelProperty(notes = "查询条件")
    private String searchKey;

    @ApiModelProperty(notes = "排序(支持多个字段，按照顺序进行先后排序)")
    private Map<String,String> sortFieldMap;

    @ApiModelProperty(notes = "排序(支持多个字段，按照顺序进行先后排序)")
    private List<String> sortFieldOrderList;
}
