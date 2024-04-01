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

package com.gccloud.dataroom.core.module.manage.dto;

import com.gccloud.common.dto.SearchDTO;
import lombok.Data;

/**
 * @author hongynag
 * @version 1.0
 */
@Data
public class DataRoomSearchDTO extends SearchDTO {

    /**
     * 所属分组
     */
    private String parentCode;

    /**
     * 类型
     */
    private String type;
}