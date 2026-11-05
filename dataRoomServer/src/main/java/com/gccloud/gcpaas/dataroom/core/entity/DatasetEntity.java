package com.gccloud.gcpaas.dataroom.core.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.BaseDataset;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.DatasetInputParam;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.DatasetOutputParam;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.ai.tool.annotation.ToolParam;

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
    @ToolParam(required = false, description = "数据源编码；目录、JSON、HTTP 数据集可省略，SQL 等依赖数据源的类型需提供有效编码")
    @Schema(description = "数据源编码；目录、JSON、HTTP 数据集可省略，SQL 等依赖数据源的类型需提供有效编码", requiredMode = Schema.RequiredMode.NOT_REQUIRED)
    private String dataSourceCode;
    /**
     * 名称
     */
    @ToolParam(description = "数据集或目录名称，创建时必填")
    @Schema(description = "数据集或目录名称，创建时必填")
    private String name;
    /**
     * 唯一编码
     */
    @TableField(updateStrategy = FieldStrategy.NEVER)
    @ToolParam(required = false, description = "数据集或目录编码；新增时可省略，服务端生成并覆盖传入值；更新时必填，仅用于定位且不可修改")
    @Schema(description = "数据集或目录编码；新增时可省略，服务端生成并覆盖传入值；更新时必填，仅用于定位且不可修改")
    private String code;

    /**
     * 数据集类型
     */
    @ToolParam(description = "数据集类型，创建时必填；目录传 directory，其他类型与 dataset 内的 datasetType 保持一致")
    @Schema(description = "数据集类型，创建时必填；目录传 directory，其他类型与 dataset 内的 datasetType 保持一致")
    private DatasetType datasetType;
    /**
     * 所属目录编码
     */
    @ToolParam(description = "所属目录编码；根级请显式传 root，服务端不会自动补为 root")
    @Schema(description = "所属目录编码；根级请显式传 root，服务端不会自动补为 root")
    private String parentCode;
    /**
     * 实际数据集
     */
    @ToolParam(required = false, description = "数据集配置；目录可省略，非目录需提供对应类型的配置以供执行，包含 datasetType 判别字段")
    @Schema(description = "数据集配置；目录可省略，非目录需提供对应类型的配置以供执行，包含 datasetType 判别字段")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private BaseDataset dataset;
    /**
     * 入参列表
     */
    @ToolParam(required = false, description = "入参列表，可选；省略时初始化为空列表，更新时可能清空原列表，需要保留时请传入原值")
    @Schema(description = "入参列表，可选；省略时初始化为空列表，更新时可能清空原列表，需要保留时请传入原值")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<DatasetInputParam> inputList = new ArrayList<>();
    /**
     * 出参列表
     */
    @ToolParam(required = false, description = "出参列表，可选；省略时初始化为空列表，更新时可能清空原列表，需要保留时请传入原值")
    @Schema(description = "出参列表，可选；省略时初始化为空列表，更新时可能清空原列表，需要保留时请传入原值")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private List<DatasetOutputParam> outputList = new ArrayList<>();
}
