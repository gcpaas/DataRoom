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

import io.swagger.annotations.ApiModelProperty;
import lombok.Builder;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/12/5 13:36
 */
@Data
@Builder
public class FileResourceDTO {

    /**
     * 资源id
     */
    private String id;

    /**
     * 所属分组
     */
    private String module;

    /**
     * 资源类型
     */
    private String type;

    /**
     * 资源名称
     */
    private String originalName;

    /**
     * 引用资源的不存储后缀，保存类型 图片 外链 视频 其他
     */
    private String extension;

    /**
     * 资源url
     */
    private String url;

    /**
     * 引用资源没有path，这里可以用固定的标识来说明这是引用资源
     */
    private String path = "<reference_resource>";

    /**
     * 是否在资源管理中隐藏，0：否，1：是
     */
    private Integer hide;

    /**
     * 封面地址
     */
    private String coverUrl;

    /**
     * 封面文件id
     */
    private String coverId;


}