package com.gccloud.gcpaas.core.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.gcpaas.core.constant.PageStatus;
import com.gccloud.gcpaas.core.constant.PageType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 页面、包含仪表盘、大屏
 */
@Data
@Schema(description = "页面实体")
@TableName("dr_page")
public class PageEntity extends BaseEntity {
    /**
     * 页面名称
     */
    @Schema(description = "页面名称")
    private String name;
    /**
     * 页面编码
     */
    @Schema(description = "页面编码")
    private String code;
    /**
     * 页面类型
     */
    @Schema(description = "页面类型")
    @TableField(updateStrategy = FieldStrategy.NEVER)
    private PageType pageType = PageType.PAGE;
    /**
     * 所属目录编码
     */
    @Schema(description = "所属目录编码")
    private String parentCode = "root";
    /**
     * 页面描述
     */
    @Schema(description = "页面描述")
    private String remark;
    /**
     * 缩略图、封面
     */
    @Schema(description = "封面地址")
    private String thumbnail;
    /**
     * 页面状态
     */
    @Schema(description = "页面状态")
    private PageStatus pageStatus = PageStatus.DESIGN;
}
