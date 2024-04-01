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

package com.gccloud.dataroom.core.module.template.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.type.BasePageDTOTypeHandler;
import com.gccloud.common.entity.SuperEntity;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/20 16:38
 */
@Data
@TableName(value = "big_screen_page_template", autoResultMap = true)
public class PageTemplateEntity extends SuperEntity {

    @ApiModelProperty(notes = "模板名称")
    private String name;

    /**
     * 参考：{@link PageDesignConstant.Type}
     */
    @ApiModelProperty(notes = "模板类型")
    private String type;

    @ApiModelProperty(notes = "缩略图地址")
    private String thumbnail;

    @ApiModelProperty(notes = "模板配置")
    @TableField(typeHandler = BasePageDTOTypeHandler.class)
    private BasePageDTO config;

    @ApiModelProperty(notes = "备注")
    private String remark;

}