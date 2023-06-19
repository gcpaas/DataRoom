package com.gccloud.dataroom.core.module.chart.bean;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/1/4 16:39
 */
@Data
public class Linkage {

    @ApiModelProperty(notes = "联动执行的逻辑")
    private Action action;

    @ApiModelProperty(notes = "组件的唯一标识，用于知道和谁做联动")
    private List<Component> components;

    @Data
    public static class Action {

        @ApiModelProperty("联动类型")
        private String type;

        @ApiModelProperty("联动执行的逻辑")
        private String script;
    }

    @Data
    public static class Component {

        @ApiModelProperty("组件的唯一标识，用于知道和谁做联动")
        private String componentKey;

        @ApiModelProperty("使用数据模型已有的关联关系进行联动查询")
        private boolean linkByRelation;

        @ApiModelProperty("映射关系")
        private List<Mapping> maps;
    }

    @Data
    public static class Mapping {

        @ApiModelProperty("源字段")
        private String sourceField;

        @ApiModelProperty("目标字段")
        private String targetField;

        @ApiModelProperty("查询规则")
        private String queryRule;
    }


}
