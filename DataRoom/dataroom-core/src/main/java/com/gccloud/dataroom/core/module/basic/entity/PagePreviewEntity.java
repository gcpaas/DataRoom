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

package com.gccloud.dataroom.core.module.basic.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.gccloud.common.entity.SuperEntity;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.type.BasePageDTOTypeHandler;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * 预览缓存临时表
 *
 * @Author qianxing
 * @Date 2022/06/07
 * @Version 1.0.0
 */
@Data
@TableName(value = "big_screen_page_preview", autoResultMap = true)
@ApiModel
public class PagePreviewEntity implements Serializable {

    @TableId
    @ApiModelProperty(notes = "主键")
    private String id;

    /**
     * 参考：{@link com.gccloud.dataroom.core.constant.PageDesignConstant.Type}
     */
    @ApiModelProperty(notes = "类型，bigScreen：大屏，dashboard：仪表盘，component：业务组件")
    private String type;

    @ApiModelProperty(notes = "页面编码，页面唯一标识符")
    private String code;

    @ApiModelProperty(notes = "具体组件配置、JSON格式")
    private String config;

    @TableField(fill = FieldFill.INSERT, updateStrategy = FieldStrategy.NEVER)
    @ApiModelProperty(notes = "创建时间")
    private Date createDate;

}