package com.gccloud.gcpaas.core.dataset.bean;

import com.fasterxml.jackson.annotation.JsonSubTypes;
import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.gccloud.gcpaas.core.constant.DatasetType;
import io.swagger.v3.oas.annotations.media.Schema;

@JsonTypeInfo(use = JsonTypeInfo.Id.NAME, include = JsonTypeInfo.As.PROPERTY, property = "datasetType")
@JsonSubTypes({
        @JsonSubTypes.Type(value = JsonDataset.class, name = DatasetType.DIRECTORY_TYPE),
        @JsonSubTypes.Type(value = JsonDataset.class, name = DatasetType.JSON_TYPE),
        @JsonSubTypes.Type(value = HttpDataset.class, name = DatasetType.HTTP_TYPE),
        @JsonSubTypes.Type(value = RelationalDataset.class, name = DatasetType.RELATIONAL_TYPE)
})
public abstract class BaseDataset {

    @Schema(description = "数据集类型",requiredMode = Schema.RequiredMode.REQUIRED)
    private DatasetType datasetType;
}