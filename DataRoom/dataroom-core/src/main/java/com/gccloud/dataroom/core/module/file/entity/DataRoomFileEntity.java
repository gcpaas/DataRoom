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

package com.gccloud.dataroom.core.module.file.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.common.entity.SuperEntity;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.ToString;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 文件
 */
@Data
@Accessors(chain = true)
@TableName("big_screen_file")
@ApiModel
@ToString(callSuper = true)
public class DataRoomFileEntity extends SuperEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    /**
     * 导入/引用的资源，文件不由当前系统管理，仅仅通过url引用
     */
    public static final String IMPORT_RESOURCE = "<reference_resource>";

    @ApiModelProperty(notes = "业务所属模块，分组")
    private String module;

    @ApiModelProperty(notes = "图片：picture、视频：video、引用：reference,其他：other")
    private String type;

    @ApiModelProperty(notes = "原文件名")
    private String originalName;

    @ApiModelProperty(notes = "新文件名")
    private String newName;

    @ApiModelProperty(notes = "后缀名(如: txt、png、doc、java等)")
    private String extension;

    @ApiModelProperty(notes = "存储路径")
    private String path;

    @ApiModelProperty(notes = "访问地址")
    private String url;

    @ApiModelProperty(notes = "文件大小")
    private Long size;

    @ApiModelProperty(notes = "下载次数")
    private Integer downloadCount = 0;

    @ApiModelProperty(notes = "上传用户")
    private String userName;

    @ApiModelProperty(notes = "桶名, 用于存储在云存储中的桶名")
    private String bucket;

    @ApiModelProperty(notes = "是否在资源管理中隐藏，0：否，1：是")
    private Integer hide;

    @ApiModelProperty(notes = "封面地址")
    private String coverUrl;

    @ApiModelProperty(notes = "封面文件id")
    private String coverId;


}