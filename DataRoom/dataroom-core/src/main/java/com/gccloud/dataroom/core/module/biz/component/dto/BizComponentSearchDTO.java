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

package com.gccloud.dataroom.core.module.biz.component.dto;

import com.gccloud.common.dto.SearchDTO;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/5 11:41
 */
@Data
public class BizComponentSearchDTO extends SearchDTO {

    @ApiModelProperty(value = "所属分组")
    private String type;

    @ApiModelProperty(value = "名称")
    private String name;

    @ApiModelProperty(notes = "设计方式 1.低代码开发 2.在线开发")
    private Integer designType;

    @ApiModelProperty("可用范围 1：大屏 2：PC仪表盘 3：移动仪表盘")
    private List<Integer> scope;
}