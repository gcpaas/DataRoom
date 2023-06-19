package com.gccloud.dataroom.core.module.dataset.dto;
import com.gccloud.dataroom.core.module.dataset.constant.ReportConstant;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @Description:数据集参数
 * @Author yang.hw
 * @Date 2021/9/15 11:11
 */
@Data
public class DatasetParamDto {

    @ApiModelProperty(value = "参数名称")
    private String name;

    /**
     * 参考：{@link ReportConstant.SqlParamsType}
     */
    @ApiModelProperty(value = "参数类型")
    private String type;

    @ApiModelProperty(value = "参数值")
    private String value;

    /**
     * 参考：{@link ReportConstant.SqlParamsStatus}
     */
    @ApiModelProperty(value = "参数状态")
    private Integer status;
}
