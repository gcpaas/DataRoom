package com.gccloud.dataroom.core.module.dataset.model.view;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author pan.shun
 * @since 2022/7/21 11:25
 */
@ApiModel
@Data
public class DataSourceInfoModel {

    @ApiModelProperty(value = "数据源ID")
    private String sourceId;

    @ApiModelProperty(value = "表名")
    private List<String> tableName;

    @ApiModelProperty(value = "数据源类型")
    private String sourceType;
}
