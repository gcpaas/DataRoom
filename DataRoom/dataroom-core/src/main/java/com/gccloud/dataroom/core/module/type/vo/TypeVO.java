package com.gccloud.dataroom.core.module.type.vo;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/26 9:38
 */
@Data
public class TypeVO {

    @ApiModelProperty(notes = "主键")
    private String id;

    @ApiModelProperty(notes = "分类中文名称")
    private String name;

    @ApiModelProperty(notes = "分类编码")
    private String code;

    /**
     * 参考：{@link PageDesignConstant.CategoryType}
     */
    @ApiModelProperty(notes = "分类类型")
    private String type;

    @ApiModelProperty(notes = "排序")
    private Integer orderNum;

}
