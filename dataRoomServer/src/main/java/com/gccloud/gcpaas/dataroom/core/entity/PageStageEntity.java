package com.gccloud.gcpaas.dataroom.core.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import com.gccloud.gcpaas.dataroom.core.constant.PageType;
import com.gccloud.gcpaas.dataroom.core.page.bean.BasePageConfig;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.springframework.ai.tool.annotation.ToolParam;

/**
 * 中转态页面（历史记录、快照）
 */
@Data
@Schema(description = "中转态页面")
@TableName(value = "dr_page_stage", autoResultMap = true)
public class PageStageEntity extends BaseEntity {
    /**
     * 页面编码
     */
    @Schema(description = "页面编码")
    private String pageCode;
    /**
     * 历史记录、快照、版本发布说明
     */
    @ToolParam(required = false, description = "说明，可省略；updatePageConfig 不写入此字段")
    @Schema(description = "说明，可省略；updatePageConfig 不写入此字段")
    private String remark;
    /**
     * 页面状态
     */
    @ToolParam(required = false, description = "外层页面状态，可省略；updatePageConfig 固定更新 design 设计态，不使用此字段定位或写入")
    @Schema(description = "外层页面状态，可省略；updatePageConfig 固定更新 design 设计态，不使用此字段定位或写入")
    private PageStatus pageStatus = PageStatus.DESIGN;
    /**
     * 页面类型
     */
    @ToolParam(required = false, description = "外层页面类型，可省略；updatePageConfig 不写入此字段，不能替代 pageConfig 内必需的 pageType 判别字段")
    @Schema(description = "外层页面类型，可省略；updatePageConfig 不写入此字段，不能替代 pageConfig 内必需的 pageType 判别字段")
    private PageType pageType;
    /**
     * 页面配置
     */
    @ToolParam(description = "完整页面配置，必填；包含 pageType 判别字段及对应类型结构，整体替换设计态配置，不是局部合并")
    @Schema(description = "完整页面配置，必填；包含 pageType 判别字段及对应类型结构，整体替换设计态配置，不是局部合并")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private BasePageConfig pageConfig;

    /**
     * 做一些兼容
     */
    public void compat() {
        pageConfig.compat();
    }
}
