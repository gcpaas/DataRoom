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
