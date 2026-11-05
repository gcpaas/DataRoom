package com.gccloud.gcpaas.dataroom.core.entity;

import com.baomidou.mybatisplus.annotation.FieldStrategy;
import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import com.gccloud.gcpaas.dataroom.core.constant.PageType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.ai.tool.annotation.ToolParam;

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
    @ToolParam(required = false, description = "页面编码；新增时为空或空白则由服务端生成，非空时使用传入值")
    @Schema(description = "页面编码；新增时为空或空白则由服务端生成，非空时使用传入值")
    private String code;
    /**
     * 页面类型
     */
    @ToolParam(required = false, description = "页面类型，可省略，默认 page；可传 page、visualScreen 或 directory")
    @Schema(description = "页面类型，可省略，默认 page；可传 page、visualScreen 或 directory")
    @TableField(updateStrategy = FieldStrategy.NEVER)
    private PageType pageType = PageType.PAGE;
    /**
     * 所属目录编码
     */
    @ToolParam(required = false, description = "所属目录编码，可省略，默认 root；新增时为空或空白也会补为 root")
    @Schema(description = "所属目录编码，可省略，默认 root；新增时为空或空白也会补为 root")
    private String parentCode = "root";
    /**
     * 页面描述
     */
    @ToolParam(required = false, description = "页面描述，可省略")
    @Schema(description = "页面描述，可省略")
    private String remark;
    /**
     * 缩略图、封面
     */
    @ToolParam(required = false, description = "封面地址，可省略")
    @Schema(description = "封面地址，可省略")
    private String thumbnail;
    /**
     * 页面状态
     */
    @ToolParam(required = false, description = "页面状态，可省略；新增时服务端固定设为 design，覆盖传入值")
    @Schema(description = "页面状态，可省略；新增时服务端固定设为 design，覆盖传入值")
    private PageStatus pageStatus = PageStatus.DESIGN;
}
