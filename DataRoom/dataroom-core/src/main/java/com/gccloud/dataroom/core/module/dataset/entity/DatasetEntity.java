package com.gccloud.dataroom.core.module.dataset.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.dataroom.core.entity.SuperEntity;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;


/**
 * @author zhang.zeJun
 * @date 2022-11-14-9:57
 */
@Data
@TableName("big_screen_dataset")
@ApiModel("主数据集")
public class DatasetEntity extends SuperEntity {

    @ApiModelProperty(value = "数据集编码")
    @TableField(exist = false)
    private String code;

    @TableField(exist = false)
    private String tableName;

    @ApiModelProperty(value = "数据集名称")
    private String name;

    @ApiModelProperty(value = "种类ID")
    private String typeId;

    @ApiModelProperty(value = "备注")
    private String remark;

    @ApiModelProperty(value = "数据集类型")
    private String datasetType;

    @ApiModelProperty(value = "数据集关联id")
    private String datasetRelId;

    @ApiModelProperty(value = "模块编码")
    private String moduleCode;

    @ApiModelProperty(value = "是否可编辑，0 不可编辑 1 可编辑")
    private Integer editable;

    @TableField(exist = false)
    private int cacheCoherence;

    @TableField(exist = false)
    private int dataSetStatus;

    @TableField(exist = false)
    private String sourceId;

    @ApiModelProperty(value = "用于存储数据集配置的字段")
    private String data;

    @TableField(exist = false)
    private Object childrenDataSet;
}
