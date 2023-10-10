package com.gccloud.dataroom.core.module.type.dto;

import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.gccloud.common.utils.EmptyAsNullDeserializer;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.common.validator.group.Insert;
import com.gccloud.common.validator.group.Update;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/26 9:38
 */
@Data
public class TypeDTO {

    @ApiModelProperty(notes = "主键")
    @JsonDeserialize(using = EmptyAsNullDeserializer.class)
    @NotBlank(message = "id不能为空", groups = Update.class)
    private String id;

    @ApiModelProperty(notes = "分类中文名称")
    private String name;

    @ApiModelProperty(notes = "分类编码")
    private String code;

    /**
     * 参考：{@link PageDesignConstant.CategoryType}
     */
    @ApiModelProperty(notes = "分类类型")
    @NotBlank(message = "类型不能为空", groups = {Update.class, Insert.class})
    private String type;

    @ApiModelProperty(notes = "排序")
    private Integer orderNum;

}
