package com.gccloud.dataroom.core.vo;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.Accessors;

@Data
@ApiModel(description = "接口返回的对象")
@Accessors(chain = true)
@NoArgsConstructor
public class MixinsResp<T> extends R<T> {

    @JsonTypeInfo(use = JsonTypeInfo.Id.CLASS, include = JsonTypeInfo.As.PROPERTY, property = "className")
    @ApiModelProperty(notes = "返回的数据")
    private T data;
}
