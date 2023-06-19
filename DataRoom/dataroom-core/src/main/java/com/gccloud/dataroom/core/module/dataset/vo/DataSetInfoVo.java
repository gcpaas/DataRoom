package com.gccloud.dataroom.core.module.dataset.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import org.json.JSONArray;

/**
 * @author zhang.zeJun
 * @date 2022-11-17-10:28
 */
@Data
public class DataSetInfoVo {

    @ApiModelProperty(value = "数据集ID")
    private String id;

    @ApiModelProperty(value = "数据集名称")
    private String name;

    @ApiModelProperty(value = "数据源ID")
    private String dataSourceKey;

    @ApiModelProperty(value = "数据集类型")
    private String type;

    @ApiModelProperty(value = "SQL脚本或JSON数据")
    private String data;

    @ApiModelProperty(value = "处理数据的脚本")
    private String dataHandler;

    @ApiModelProperty(value = "是否可编辑，0不可编辑，1可编辑")
    private Integer editAble;

    @ApiModelProperty(value = "参数")
    private JSONArray params;

    @ApiModelProperty(value = "字段信息")
    private JSONArray fields;
}

