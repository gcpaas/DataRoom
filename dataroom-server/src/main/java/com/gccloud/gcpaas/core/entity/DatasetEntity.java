package com.gccloud.gcpaas.core.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.gccloud.gcpaas.core.constant.DatasetType;
import com.gccloud.gcpaas.core.dataset.bean.BaseDataset;
import com.gccloud.gcpaas.core.dataset.bean.DatasetInputParam;
import com.gccloud.gcpaas.core.dataset.bean.DatasetOutputParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

/**
 * 数据集定义
 */
@Data
@Schema
@TableName(value = "dr_dataset", autoResultMap = true)
public class DatasetEntity extends BaseEntity {
    /**
     * 数据源编码
     */
    @Schema(description = "数据源编码",requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String dataSourceCode;
    /**
     * 名称
     */
    @Schema(description = "名称")
    private String name;
    /**
     * 唯一编码
     */
    @TableField(updateStrategy = FieldStrategy.NEVER)
    @Schema(description = "编码")
    private String code;

    /**
     * 数据集类型
     */
    @Schema(description = "数据集类型")
    private DatasetType datasetType;
    /**
     * 所属目录编码
     */
    @Schema(description = "所属目录编码")
    private String parentCode;
    /**
     * 实际数据集
     */
    @Schema(description = "数据集配置")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private BaseDataset dataset;
    /**
     * 入参列表
     */
    @Schema(description = "入参列表")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<DatasetInputParam> inputList = new ArrayList<>();
    /**
     * 出参列表
     */
    @Schema(description = "出参列表")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<DatasetOutputParam> outputList = new ArrayList<>();
}
