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

    @ApiModelProperty(notes = "页面编码，页面唯一标识符")
    private String code;

    @ApiModelProperty(notes = "具体组件配置、JSON格式")
    @TableField(typeHandler = BasePageDTOTypeHandler.class)
    private BasePageDTO config;

    @TableField(fill = FieldFill.INSERT, updateStrategy = FieldStrategy.NEVER)
    @ApiModelProperty(notes = "创建时间")
    private Date createDate;

}
