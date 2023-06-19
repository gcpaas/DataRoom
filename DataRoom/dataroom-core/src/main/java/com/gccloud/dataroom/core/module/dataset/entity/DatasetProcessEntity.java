package com.gccloud.dataroom.core.module.dataset.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.dataroom.core.entity.SuperEntity;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;


/**
 * @Description: 数据集加工
 * @Author yang.hw
 * @Date 2021/9/8 11:24
 */
@Data
@TableName("big_screen_datasets_custom")
@ApiModel("自助数据集")
public class DatasetProcessEntity extends SuperEntity {

    @ApiModelProperty(value = "数据集名称")
    @TableField(exist = false)
    private String name;

    @ApiModelProperty(value = "数据集编码")
    private String code;

    @ApiModelProperty(value = "结果固化形式，1、表 ； 2、视图")
    private String curingType;

    @ApiModelProperty(value = "种类ID")
    @TableField(exist = false)
    private String typeId;

    @ApiModelProperty(value = "数据源id")
    private String sourceId;

    @ApiModelProperty(value = "数据集字段json")
    private String fieldJson;

    @ApiModelProperty(value = "数据集加工类型")
    private String processType;

    @ApiModelProperty(value = "Sql数据处理")
    private String sqlProcess;

    @ApiModelProperty(value = "代码数据处理")
    private String codeProcess;

    @ApiModelProperty(value = "参数配置json")
    private String paramConfig;

    @ApiModelProperty(value = "字段描述")
    private String fieldDesc;

    @ApiModelProperty(value = "结构缓存")
    private String cacheField;

    @ApiModelProperty(value = "结果转换脚本")
    private String script;

    @ApiModelProperty(value = "备注")
    @TableField(exist = false)
    private String remark;

    @ApiModelProperty(value = "是否可编辑，0 不可编辑 1 可编辑")
    @TableField(exist = false)
    private Integer editable;

    @ApiModelProperty(value = "模块编码")
    @TableField(exist = false)
    private String moduleCode;

    @ApiModelProperty(value = "数据集数据预览")
    @TableField(exist = false)
    private Map<String, List<Map<String, Object>>> preview;

    @ApiModelProperty(value = "数据集数据总数")
    @TableField(exist = false)
    private Integer totalCount;

    @ApiModelProperty(value = "种类名称")
    @TableField(exist = false)
    private String typeName;
}
