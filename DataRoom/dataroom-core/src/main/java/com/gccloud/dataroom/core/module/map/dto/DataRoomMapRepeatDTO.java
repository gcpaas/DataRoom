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

package com.gccloud.dataroom.core.module.map.dto;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/9/7 16:14
 */
@Data
public class DataRoomMapRepeatDTO {

    @ApiModelProperty(notes = "主键")
    private String id;

    @ApiModelProperty(notes = "父级地图id")
    private String parentId;

    @ApiModelProperty(notes = "地图编码")
    private String mapCode;

    @ApiModelProperty(notes = "地图名称")
    private String mapName;
}