package com.gccloud.gcpaas.core.entity;

import com.baomidou.mybatisplus.annotation.TableField;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.extension.handlers.JacksonTypeHandler;
import com.gccloud.gcpaas.core.constant.PageStatus;
import com.gccloud.gcpaas.core.constant.PageType;
import com.gccloud.gcpaas.core.page.bean.BasePageConfig;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

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
    @Schema(description = "说明")
    private String remark;
    /**
     * 页面状态
     */
    @Schema(description = "页面状态")
    private PageStatus pageStatus = PageStatus.DESIGN;
    /**
     * 页面类型
     */
    @Schema(description = "页面类型")
    private PageType pageType;
    /**
     * 页面配置
     */
    @Schema(description = "页面配置")
    @TableField(typeHandler = JacksonTypeHandler.class)
    private BasePageConfig pageConfig;

    /**
     * 做一些兼容
     */
    public void compat() {
        pageConfig.compat();
    }
}
