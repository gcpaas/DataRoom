package com.gccloud.gcpaas.dataroom.core.agent;

import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import com.gccloud.gcpaas.dataroom.core.util.LoginUserUtils;
import io.agentscope.core.agent.RuntimeContext;
import io.agentscope.core.agui.runtime.AguiRuntimeContextRequest;
import io.agentscope.core.agui.runtime.AguiRuntimeContextResolver;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

/**
 * 为每次 AG-UI 请求注入当前登录用户身份，作为 Agent 会话与记忆隔离的 userId。
 * 用户身份只取服务端认证链路（Shiro），不信任客户端传入的 forwardedProps。
 */
@Component
@ConditionalOnProperty(prefix = "dataroom.agent", name = "enabled", havingValue = "true", matchIfMissing = true)
public class DataRoomAguiRuntimeContextResolver implements AguiRuntimeContextResolver {

    @Override
    public RuntimeContext resolve(AguiRuntimeContextRequest<?> request) {
        String userId = "anonymous";
        LoginUser currentUser = LoginUserUtils.getCurrentUser();
        if (currentUser != null) {
            userId = StringUtils.defaultIfBlank(currentUser.getId(), currentUser.getAccount());
        }
        return RuntimeContext.builder()
                .userId(userId)
                .build();
    }
}
