package com.gccloud.gcpaas.dataroom.core.agent;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Agent 对话基础信息接口。仅开发者及以上角色可用，与对话入口权限保持一致。
 */
@Tag(name = "Agent对话")
@RestController
@RequestMapping("/dataRoom/agent")
public class AgentController {

    @Resource
    private AgentProperties agentProperties;

    @GetMapping("/model")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    @Operation(summary = "模型信息", description = "返回当前Agent使用的大模型提供方与名称，不包含密钥等敏感配置")
    public Resp<Map<String, String>> model() {
        Map<String, String> info = new LinkedHashMap<>();
        info.put("provider", agentProperties.getModel().getProvider());
        info.put("modelName", agentProperties.getModel().getModelName());
        return Resp.success(info);
    }
}
