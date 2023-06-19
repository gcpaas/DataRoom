package com.gccloud.dataroom.core.module.dataset.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.dataroom.core.entity.SuperEntity;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

/**
 * @author pan.shun
 * @since 2021/9/6 14:49
 */
@Data
@TableName("big_screen_datasource_config")
@ApiModel("数据源配置")
public class DatasourceConfig extends SuperEntity {

    @ApiModelProperty(value = "数据源名称 ")
    private String sourceName;

    @ApiModelProperty(value = "数据源类型")
    private String sourceType;

    @ApiModelProperty(value = "连接驱动")
    private String driverClassName;

    @ApiModelProperty(value = "数据库")
    @TableField(exist = false)
    private String database;

    @ApiModelProperty(value = "主机")
    private String host;

    @ApiModelProperty(value = "端口")
    private Integer port;

    @ApiModelProperty(value = "用户名")
    private String username;

    @ApiModelProperty(value = "密码")
    @TableField(updateStrategy = FieldStrategy.NOT_NULL)
    private String password;

    @ApiModelProperty(value = "编码")
    private String coding;

    @ApiModelProperty(value = "连接url")
    private String url;

    @ApiModelProperty(value = "是否启用高级设置")
    private Integer advanceSettingFlag;

    @ApiModelProperty(value = "初始化连接数")
    private Integer initConnNum;

    @ApiModelProperty(value = "最大活动连接数")
    private Integer maxActiveConnNum;

    @ApiModelProperty(value = "最大空闲连接数")
    private Integer maxIdleConnNum;

    @ApiModelProperty(value = "最小空闲连接数")
    private Integer minIdleConnNum;

    @ApiModelProperty(value = "最大等待时间")
    private String maxWaitConnNum;

    @ApiModelProperty(value = "SQL验证查询")
    private String sqlCheck;

    @ApiModelProperty(value = "获取连接是否校验")
    private Integer getconnCheckFlag;

    @ApiModelProperty(value = "归还连接是否校验")
    private Integer returnCheckFlag;

    @ApiModelProperty(value = "开启空闲回收期校验")
    private Integer startIdleCheckFlag;

    @ApiModelProperty(value = "空闲连接回收器休眠时间")
    private Integer idleConnDormantTime;

    @ApiModelProperty(value = "空闲连接回收检查数")
    private Integer idleConnCheckNum;

    @ApiModelProperty(value = "保持空闲最小时间值")
    private Integer keepIdleMinTime;

    @ApiModelProperty(value = "模块编码")
    private String moduleCode;

    @ApiModelProperty(value = "是否可编辑，0 不可编辑 1 可编辑")
    private Integer editable;

    @ApiModelProperty(value = "备注")
    private String remark;
}
