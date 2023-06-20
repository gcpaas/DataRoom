package com.gccloud.dataroom.core.module.chart.bean;

import com.gccloud.dataset.dto.DatasetParamDTO;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/1/11 15:22
 */
@Data
public class Field {

    @ApiModelProperty(notes = "参数名称")
    private String name;

    @ApiModelProperty(notes = "参数标签")
    private String label;

    @ApiModelProperty(notes = "组件类型")
    private String component;

    @ApiModelProperty(notes = "查询规则")
    private String queryRule;

    @ApiModelProperty(notes = "是否显示")
    private boolean display;

    @ApiModelProperty(notes = "枚举值配置")
    private Enumeration enumeration;

    @Data
    public static class Enumeration {

        @ApiModelProperty(notes = "数据集")
        private String dataSetKey;

        @ApiModelProperty(notes = "数据集类型，前端使用")
        private String dataSetType;

        @ApiModelProperty(notes = "显示字段")
        private String itemKeyName;

        @ApiModelProperty(notes = "值字段")
        private String itemValueName;

        @ApiModelProperty(value = "参数")
        private List<DatasetParamDTO> params;

    }

}
