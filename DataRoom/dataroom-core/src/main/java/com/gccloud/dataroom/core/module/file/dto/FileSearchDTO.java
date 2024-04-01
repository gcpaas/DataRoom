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

package com.gccloud.dataroom.core.module.file.dto;

import com.gccloud.common.dto.SearchDTO;
import lombok.Data;

import java.util.List;

@Data
public class FileSearchDTO extends SearchDTO {

    /**
     * 所属模块
     */
    private String module;

    /**
     * 文件后缀
     */
    private String extension;

    /**
     * 素材类型
     */
    private List<String> type;


    /**
     * 文件后缀列表，批量过滤
     */
    private List<String> extensionList;

    /**
     * 是否在资源管理中隐藏，0：否，1：是
     */
    private Integer hide;



}