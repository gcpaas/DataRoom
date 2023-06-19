package com.gccloud.dataroom.core.entity;

import com.baomidou.mybatisplus.annotation.*;
import com.gccloud.dataroom.core.constant.DataRoomConst;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.io.Serializable;
import java.util.Date;

/**
 * @author liuchengbiao
 * @date 2020-07-07 10:02
 */
@Data
@ApiModel
public class SuperEntity implements Serializable {

    @TableId
    @ApiModelProperty(notes = "主键")
    private String id;

    @TableField(fill = FieldFill.INSERT, updateStrategy = FieldStrategy.NEVER)
    @ApiModelProperty(notes = "创建时间")
    private Date createDate;

    @TableField(fill = FieldFill.INSERT_UPDATE)
    @ApiModelProperty(notes = "更新时间")
    private Date updateDate;

    @TableLogic(delval = DataRoomConst.DelFlag.DELETE + "", value = DataRoomConst.DelFlag.NOAMAL + "")
    @ApiModelProperty(notes = "删除标识(0：正常，1：删除)", hidden = true)
    private Integer delFlag = 0;
}
