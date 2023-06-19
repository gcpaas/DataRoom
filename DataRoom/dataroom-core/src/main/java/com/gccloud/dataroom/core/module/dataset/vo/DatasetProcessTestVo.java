package com.gccloud.dataroom.core.module.dataset.vo;

import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * @Description: 数据集加工测试分页vo
 * @Author yang.hw
 * @Date 2021/11/1 17:00
 */
@Data
public class DatasetProcessTestVo {
    @ApiModelProperty(value = "脚本测试数据")
    private Map<String, List<Map<String, Object>>> dataMap;

    @ApiModelProperty(value = "数据总数")
    private Integer totalCount;

    @ApiModelProperty(value = "状态码")
    private Integer code;

    @ApiModelProperty(value = "异常堆栈信息")
    private String exception;

    @ApiModelProperty(value = "响应信息")
    private String msg;

    @ApiModelProperty(value = "执行sql语句")
    private String sql;

    @ApiModelProperty(value = "缓存一致性标识。0、一致,  1、不一致")
    private int cacheCoherence;

    @ApiModelProperty(value = "表名")
    private List<String> tableNameList;
}
