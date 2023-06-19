package com.gccloud.dataroom.core.module.dataset.model.view;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author pan.shun
 * @since 2022/7/21 13:37
 */
@ApiModel
@Data
public class TableRelateModel {

    @ApiModelProperty(value = "主节点表名称")
    private String mainTableName;

    @ApiModelProperty(value = "关联表信息")
    private List<ChildrenRelateModel> children;
}
