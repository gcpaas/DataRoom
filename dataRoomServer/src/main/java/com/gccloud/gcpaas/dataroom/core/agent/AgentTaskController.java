package com.gccloud.gcpaas.dataroom.core.agent;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.entity.AgentTaskEntity;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Agent 对话任务接口。仅开发者及以上角色可用（Agent 执行的页面操作需要开发者权限）。
 */
@Tag(name = "Agent对话任务")
@RestController
@RequestMapping("/dataRoom/agent/task")
public class AgentTaskController {

    @Resource
    private AgentTaskService agentTaskService;

    @GetMapping("/list")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "任务列表", description = "查询当前用户的Agent对话任务，按更新时间倒序")
    public Resp<List<AgentTaskEntity>> list() {
        return Resp.success(agentTaskService.listByCurrentUser());
    }

    @PostMapping("/create")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "新建任务", description = "创建Agent对话任务")
    public Resp<AgentTaskEntity> create(@RequestBody AgentTaskEntity dto) {
        return Resp.success(agentTaskService.createTask(dto.getThreadId(), dto.getTitle()));
    }

    @GetMapping("/detail/{threadId}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "任务详情", description = "查询任务详情与完整对话记录")
    public Resp<AgentTaskEntity> detail(@PathVariable("threadId") String threadId) {
        return Resp.success(agentTaskService.getOwnedByThreadId(threadId));
    }

    @PostMapping("/save")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "保存对话记录", description = "保存任务元信息与整段对话记录")
    public Resp<Boolean> save(@RequestBody AgentTaskEntity dto) {
        agentTaskService.saveTranscript(dto);
        return Resp.success(true);
    }

    @PostMapping("/rename")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "重命名任务")
    public Resp<Boolean> rename(@RequestBody AgentTaskEntity dto) {
        agentTaskService.rename(dto.getThreadId(), dto.getTitle());
        return Resp.success(true);
    }

    @PostMapping("/delete/{threadId}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "删除任务")
    public Resp<Boolean> delete(@PathVariable("threadId") String threadId) {
        agentTaskService.deleteByThreadId(threadId);
        return Resp.success(true);
    }
}
