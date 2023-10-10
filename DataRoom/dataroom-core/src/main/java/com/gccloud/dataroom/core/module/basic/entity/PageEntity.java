package com.gccloud.dataroom.core.module.basic.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.type.BasePageDTOTypeHandler;
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
@TableName(value = "big_screen_page", autoResultMap = true)
@ApiModel
public class PageEntity extends SuperEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(notes = "页面中文名称")
    private String name;

    @ApiModelProperty(notes = "页面编码，页面唯一标识符")
    private String code;

    @ApiModelProperty(notes = "父节点编码/所属分组编码")
    private String parentCode;

    /**
     * 参考：{@link PageDesignConstant.Type}
     */
    @ApiModelProperty(notes = "页面类型")
    private String type;

    @ApiModelProperty(notes = "大屏首页封面")
    private String coverPicture;

    @ApiModelProperty(notes = "具体组件配置、JSON格式")
    @TableField(typeHandler = BasePageDTOTypeHandler.class)
    private BasePageDTO config;

    @ApiModelProperty(notes = "备注")
    private String remark;

    @ApiModelProperty(notes = "排序")
    private Integer orderNum;

    @ApiModelProperty(notes = "所属应用编码")
    private String appCode;



}
