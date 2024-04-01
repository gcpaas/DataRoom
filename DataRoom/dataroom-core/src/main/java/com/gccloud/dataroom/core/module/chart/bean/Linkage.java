/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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