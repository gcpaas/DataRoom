package com.gccloud.dataroom.core.module.biz.component.dto;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.gccloud.common.utils.EmptyAsNullDeserializer;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/5 11:41
 */
@Data
public class BizComponentDTO {

    @JsonDeserialize(using = EmptyAsNullDeserializer.class)
    @ApiModelProperty(notes = "主键")
    private String id;

    @ApiModelProperty(notes = "业务组件中文名称")
    private String name;

    @ApiModelProperty(notes = "业务组件编码，页面唯一标识符")
    @TableField(updateStrategy = FieldStrategy.NEVER)
    private String code;

    @ApiModelProperty(notes = "业务组件所属分组")
    private String type;

    @ApiModelProperty(notes = "组件封面")
    private String coverPicture;

    @ApiModelProperty(notes = "vue组件内容")
    private String vueContent;

    @ApiModelProperty(notes = "组件配置内容")
    private String settingContent;

    @ApiModelProperty(notes = "备注")
    private String remark;

    @ApiModelProperty(notes = "排序")
    private Integer orderNum;

    @ApiModelProperty(notes = "模块编码")
    private String moduleCode;
}
