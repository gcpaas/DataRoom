package com.gccloud.dataroom.core.module.file.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.gccloud.dataroom.core.entity.SuperEntity;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.ToString;
import lombok.experimental.Accessors;

import java.io.Serializable;

/**
 * 文件
 */
@Data
@Accessors(chain = true)
@TableName("big_screen_file")
@ApiModel
@ToString(callSuper = true)
public class DataRoomFileEntity extends SuperEntity implements Serializable {

    private static final long serialVersionUID = 1L;

    @ApiModelProperty(notes = "业务所属模块，从业务字典FILE_MODULE获取值")
    private String module;

    @ApiModelProperty(notes = "原文件名")
    private String originalName;

    @ApiModelProperty(notes = "新文件名")
    private String newName;

    @ApiModelProperty(notes = "后缀名(如: txt、png、doc、java等)")
    private String extension;

    @ApiModelProperty(notes = "路径")
    private String path;

    @ApiModelProperty(notes = "访问地址")
    private String url;

    @ApiModelProperty(notes = "文件大小")
    private Long size;

    @ApiModelProperty(notes = "下载次数")
    private Integer downloadCount = 0;

    @ApiModelProperty(notes = "上传用户")
    private String userName;

    @ApiModelProperty(notes = "桶名")
    private String bucket;

}
