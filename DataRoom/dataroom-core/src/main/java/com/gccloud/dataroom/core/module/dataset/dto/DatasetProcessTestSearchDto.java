package com.gccloud.dataroom.core.module.dataset.dto;

import com.gccloud.dataroom.core.dto.SearchDTO;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @Description: 数据集加工测试功能分页
 * @Author yang.hw
 * @Date 2021/11/1 16:38
 */
@Data
public class DatasetProcessTestSearchDto extends SearchDTO {
    @ApiModelProperty(value = "sql脚本")
    private String sqlProcess;

    @ApiModelProperty(value = "参数配置")
    private String paramConfig;

    @ApiModelProperty(value = "数据源id")
    private String sourceId;

    @ApiModelProperty(value = "数据集id")
    private String datasetId;

    @ApiModelProperty(value = "固化方式")
    private String curingType;

    @ApiModelProperty(value = "数据集编码")
    private String dataSetCode;

    @ApiModelProperty(value = "数据集加工类型")
    private String processType;

    @ApiModelProperty(value = "编码参数处理")
    private String codeProcess;
}
