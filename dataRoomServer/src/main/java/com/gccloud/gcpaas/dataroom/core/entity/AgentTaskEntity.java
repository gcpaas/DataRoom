package com.gccloud.gcpaas.dataroom.core.entity;

import com.baomidou.mybatisplus.annotation.TableName;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import lombok.EqualsAndHashCode;

/**
 * Agent 对话任务
 */
@Data
@EqualsAndHashCode(callSuper = true)
@TableName("dr_agent_task")
@Schema(description = "Agent对话任务")
public class AgentTaskEntity extends BaseEntity {

    /**
     * AG-UI 线程ID（前端生成，全局唯一）
     */
    @Schema(description = "AG-UI线程ID")
    private String threadId;

    /**
     * 任务标题（通常取首条消息摘要）
     */
    @Schema(description = "任务标题")
    private String title;

    /**
     * 对话记录（JSON 数组，含消息与工具调用结果卡片数据）
     */
    @Schema(description = "对话记录JSON")
    private String transcript;
}
