package com.gccloud.dataroom.core.module.dataset.dto;

import com.gccloud.dataroom.core.dto.SearchDTO;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author zhang.zeJun
 * @date 2022-11-18-16:15
 */
@ApiModel
@Data
public class ExecuteDto extends SearchDTO {

    @ApiModelProperty(value = "数据源ID")
    private String dataSourceId;

    @ApiModelProperty(value = "sql语句")
    private String sql;

    @ApiModelProperty(value = "数据集id")
    private String dataSetId;

    @ApiModelProperty(value = "参数")
    private List<DatasetParamDto> params;

    @ApiModelProperty(value = "数据集类型")
    private String dataSetType;

    @ApiModelProperty(value = "用于存储数据集配置的字段")
    private String data;
}
