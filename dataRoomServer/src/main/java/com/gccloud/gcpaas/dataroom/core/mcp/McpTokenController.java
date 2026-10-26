package com.gccloud.gcpaas.dataroom.core.mcp;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.entity.McpTokenEntity;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.McpTokenAddDto;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.McpTokenCreatedVo;
import com.gccloud.gcpaas.dataroom.core.mcp.service.McpTokenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.annotation.Resource;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@Tag(name = "个人MCP令牌")
@RequestMapping("/dataRoom/mcpToken")
public class McpTokenController {

    @Resource
    private McpTokenService mcpTokenService;

    @GetMapping("/list")
    @Operation(summary = "查询个人MCP令牌")
    @RequiresRoles(DataRoomRole.SHARER)
    public Resp<List<McpTokenEntity>> list() {
        return Resp.success(mcpTokenService.list());
    }

    // 不添加@Operation：该接口包含一次性明文，不能进入操作日志切点。
    @PostMapping("/add")
    @RequiresRoles(DataRoomRole.SHARER)
    public Resp<McpTokenCreatedVo> add(@RequestBody McpTokenAddDto dto, HttpServletResponse response) {
        response.setHeader("Cache-Control", "no-store");
        response.setHeader("Pragma", "no-cache");
        return Resp.success(mcpTokenService.add(dto));
    }

    @PostMapping("/delete/{id}")
    @Operation(summary = "撤销个人MCP令牌")
    @RequiresRoles(DataRoomRole.SHARER)
    public Resp<Void> delete(@PathVariable("id") String id) {
        mcpTokenService.delete(id);
        return Resp.success(null);
    }
}
