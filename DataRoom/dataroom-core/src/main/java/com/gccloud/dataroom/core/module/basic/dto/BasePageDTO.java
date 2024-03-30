package com.gccloud.dataroom.core.module.basic.dto;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.gccloud.common.utils.EmptyAsNullDeserializer;
import com.gccloud.common.validator.group.Insert;
import com.gccloud.common.validator.group.Update;
import com.gccloud.dataroom.core.constant.PageDesignConstant;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.util.List;
import java.util.Map;

/**
 * 用于反序列化和序列化的
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Data
@JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "className")
public class BasePageDTO implements Serializable {
    private static final long serialVersionUID = 1L;

    @JsonDeserialize(using = EmptyAsNullDeserializer.class)
    @NotBlank(message = "id不能为空", groups = Update.class)
    @ApiModelProperty(notes = "主键id")
    private String id;

    @NotBlank(message = "名称不能为空", groups = {Update.class, Insert.class})
    @ApiModelProperty(notes = "页面名称")
    private String name;

    @NotBlank(message = "编码不能为空", groups = {Update.class})
    @ApiModelProperty(notes = "页面唯一标识符")
    private String code;

    @ApiModelProperty(notes = "父节点编码")
    private String parentCode;

    @ApiModelProperty(notes = "过滤器")
    private Map<String, Object> filters;


    @ApiModelProperty(notes = "图表数据")
    private List<Map<String, Object>> chartList;

    /**
     * 参考：{@link PageDesignConstant.Type}
     */
    @NotBlank(message = "类型不能为空", groups = {Update.class, Insert.class})
    @ApiModelProperty(notes = "类型")
    private String type;

    @ApiModelProperty(notes = "页面封面")
    private String coverPicture;

    @ApiModelProperty(notes = "页面模板id")
    private String pageTemplateId;

    @ApiModelProperty(notes = "排序")
    private Integer orderNum;

    @ApiModelProperty(notes = "备注")
    private String remark;

    @ApiModelProperty(notes = "是否预览")
    private Boolean isPreview;

}
