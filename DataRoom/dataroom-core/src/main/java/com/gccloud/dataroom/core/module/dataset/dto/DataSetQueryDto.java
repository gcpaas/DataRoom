package com.gccloud.dataroom.core.module.dataset.dto;

import com.gccloud.dataroom.core.dto.SearchDTO;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author zhang.zeJun
 * @date 2022-11-15-10:08
 */
@Data
public class DataSetQueryDto extends SearchDTO {

    @ApiModelProperty(value = "数据集ID")
    private String id;

    @ApiModelProperty(value = "名称")
    private String name;

    @ApiModelProperty(value = "数据集编码")
    private String code;

    @ApiModelProperty(value = "种类id")
    private String typeId;

    @ApiModelProperty(value = "数据集类型")
    private String datasetType;

    @ApiModelProperty(value = "模块编码")
    private String moduleCode;

}
