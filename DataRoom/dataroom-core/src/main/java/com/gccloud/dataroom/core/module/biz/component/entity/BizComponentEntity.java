package com.gccloud.dataroom.core.module.biz.component.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.common.entity.SuperEntity;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

/**
 * 页面基本信息表
 *
 * @Author qianxing
 * @Date 2022/06/07
 * @Version 1.0.0
 */
@Data
@TableName(value = "big_screen_biz_component")
@ApiModel
public class BizComponentEntity extends SuperEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(notes = "业务组件中文名称")
    private String name;

    @ApiModelProperty(notes = "业务组件编码，唯一标识符")
    @TableField(updateStrategy = FieldStrategy.NEVER)
    private String code;

    @ApiModelProperty(notes = "设计方式 1.低代码开发 2.在线开发")
    private Integer designType;

    @ApiModelProperty("可用范围 1：大屏 2：PC仪表盘 3：移动仪表盘")
    private Integer scope;

    @ApiModelProperty(notes = "低代码开发时，关联的自定义页面编码(因为这时候，数据保存在page表)")
    private String pageCode;

    @ApiModelProperty(notes = "业务组件所属分组")
    private String type;

    @ApiModelProperty(notes = "组件封面")
    private String coverPicture;

    @ApiModelProperty(notes = "组件源码vue内容")
    private String vueContent;

    @ApiModelProperty(notes = "配置面板源码vue内容")
    private String settingContent;

    @ApiModelProperty(notes = "默认数据json")
    private String defaultData;

    @ApiModelProperty(notes = "组件定义js")
    private String componentDefine;

    @ApiModelProperty(notes = "备注")
    private String remark;

    @ApiModelProperty(notes = "排序")
    private Integer orderNum;

}
