package com.gccloud.gcpaas.core.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import com.gccloud.gcpaas.core.constant.ResourceType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 资源、素材、目录
 */
@Data
@Schema(description = "资源")
@TableName("dr_resource")
public class ResourceEntity extends BaseEntity {
    /**
     * 显示的名称、默认为上传的名称
     */
    @Schema(description = "名称")
    private String name;
    /**
     * 原始文件名称
     */
    @Schema(description = "原始名称")
    private String originalName;
    /**
     * 资源类型
     */
    @Schema(description = "资源类型")
    private ResourceType resourceType;
    /**
     * 上级目录
     */
    @Schema(description = "上级目录")
    private String parentCode = "root";
    /**
     * 存储的路径
     */
    @Schema(description = "存储的路径")
    private String path;
    /**
     * 访问地址
     */
    @Schema(description = "访问地址")
    private String url;
    /**
     * 缩略图、封面
     */
    @Schema(description = "缩略图、封面地址")
    private String thumbnail;
    /**
     * 文件大小（单位：KB）
     */
    @Schema(description = "文件大小（单位：KB）")
    private Integer size;
    /**
     * 描述
     */
    @Schema(description = "描述")
    private String remark;
}
