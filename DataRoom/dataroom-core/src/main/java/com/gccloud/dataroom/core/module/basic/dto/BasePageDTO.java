package com.gccloud.dataroom.core.module.basic.dto;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;

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

    @ApiModelProperty(notes = "所属应用编码")
    private String appCode;

}
