package com.gccloud.dataroom.core.module.template.vo;

import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.Date;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/20 16:38
 */
@Data
@ApiModel
public class PageTemplateVO {

    @ApiModelProperty(notes = "主键")
    private String id;

    @ApiModelProperty(notes = "模板名称")
    private String name;

    @ApiModelProperty(notes = "模板分类")
    private String type;

    @ApiModelProperty(notes = "模板配置")
    private String config;

    @ApiModelProperty(notes = "缩略图")
    private String thumbnail;

    @ApiModelProperty(notes = "备注")
    private String remark;

    @ApiModelProperty(notes = "创建者账号")
    private String createUser;

    @ApiModelProperty(notes = "创建时间")
    private Date createDate;

    @ApiModelProperty(notes = "更新者账号")
    private String updateUser;

    @ApiModelProperty(notes = "更新时间")
    private Date updateDate;
}
