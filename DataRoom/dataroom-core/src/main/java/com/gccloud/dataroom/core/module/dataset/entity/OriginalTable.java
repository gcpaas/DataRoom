package com.gccloud.dataroom.core.module.dataset.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.dataroom.core.entity.SuperEntity;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author pan.shun
 * @since 2021/9/7 15:02
 */
@TableName("big_screen_datasets_original")
@Data
@ApiModel
public class OriginalTable extends SuperEntity {

    @ApiModelProperty(value = "数据集名称")
    @TableField(exist = false)
    private String name;

    @ApiModelProperty(value = "种类id")
    @TableField(exist = false)
    private String typeId;

    @ApiModelProperty(value = "表名称")
    private String tableName;

    @ApiModelProperty(value = "关联数据源id")
    private String sourceId;

    @ApiModelProperty(value = "描述")
    @TableField(exist = false)
    private String remark;

    @ApiModelProperty(value = "字段描述")
    private String fieldDesc;

    @ApiModelProperty(value = "字段详情")
    private String fieldInfo;

    @ApiModelProperty(value = "去重标识。0、去重 1、不去重")
    private Integer repeatStatus;

    @ApiModelProperty(value = "数据缓存字段")
    private String cacheField;

    @ApiModelProperty(value = "是否可编辑，0 不可编辑 1 可编辑")
    @TableField(exist = false)
    private Integer editable;

    @ApiModelProperty(value = "模块编码")
    @TableField(exist = false)
    private String moduleCode;

    @ApiModelProperty(value = "数据集字段json")
    private String fieldJson;
}
