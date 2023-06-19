package com.gccloud.dataroom.core.module.dataset.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.dataroom.core.entity.SuperEntity;
import com.gccloud.dataroom.core.vo.TreeVo;
import io.swagger.annotations.ApiModel;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;
import lombok.ToString;

import java.util.List;

/**
 * @author pan.shun
 * @since 2021/9/7 10:58
 */
@ToString(callSuper = true)
@ApiModel("种类树")
@TableName("big_screen_category_tree")
@Data
public class CategoryTree extends SuperEntity implements TreeVo<CategoryTree> {

    @ApiModelProperty(value = "主键")
    private String id;

    @ApiModelProperty(value = "种类树名称")
    private String name;

    @ApiModelProperty(value = "父级ID")
    private String parentId;

    @ApiModelProperty(value = "父级名称")
    private String parentName;

    @ApiModelProperty(value = "等级")
    private String treeLevel = "0";

    @ApiModelProperty(value = "子集")
    @TableField(exist = false)
    private List<CategoryTree> children;

    @ApiModelProperty(value = "表名称")
    private String tableName;

    @ApiModelProperty(value = "模块编码")
    private String moduleCode;
}
