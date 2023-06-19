package com.gccloud.dataroom.core.module.dataset.model.view;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author pan.shun
 * @since 2022/7/21 13:39
 */
@ApiModel
@Data
public class ChildrenRelateModel {

    @ApiModelProperty(value = "表名称")
    private String tableName;

    @ApiModelProperty(value = "字段")
    private String field;

    @ApiModelProperty(value = "关联类型. 分为inner 、left、right 三种")
    private String relateType;

    @ApiModelProperty(value = "关联的字段")
    private String relateField;

    @ApiModelProperty(value = "关联的表名称")
    private String relateTableName;
}
