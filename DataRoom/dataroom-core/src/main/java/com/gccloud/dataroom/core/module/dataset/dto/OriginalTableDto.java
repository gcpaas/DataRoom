package com.gccloud.dataroom.core.module.dataset.dto;

import com.gccloud.dataroom.core.dto.SearchDTO;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author pan.shun
 * @since 2021/9/7 15:10
 */
@ApiModel
@Data
public class OriginalTableDto extends SearchDTO {

    @ApiModelProperty(value = "名称")
    private String name;

    @ApiModelProperty(value = "原始表名称")
    private String tableName;

    @ApiModelProperty(value = "数据源ID")
    private String sourceId;

    @ApiModelProperty(value = "数据源类型")
    private String sourceType;

    @ApiModelProperty(value = "种类ID")
    private String typeId;

    @ApiModelProperty(value = "标签id")
    private String labelId;

    @ApiModelProperty(value = "字段详情")
    private String fieldInfo;

    @ApiModelProperty(value = "数据集id")
    private String id;

    @ApiModelProperty(value = "去重标识。0、去重 1、不去重")
    private Integer repeatStatus;
}
