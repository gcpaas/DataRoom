package com.gccloud.gcpaas.core.shiro.sso;

import com.alibaba.fastjson2.JSONObject;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.shiro.LoginUser;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

@Service
@ConditionalOnProperty(prefix = "dataroom.sso", name = "adapter", havingValue = "default", matchIfMissing = true)
public class DefaultSsoAdapterService implements ISsoAdapterService {
    @Override
    public LoginUser adapter(JSONObject respObj) {
        int code = respObj.getIntValue("code");
        if (code != 200) {
            throw new DataRoomException("单点登录校验失败");
        }
        JSONObject respDataObj = respObj.getJSONObject("data");
        // 设置当前用户、用于下面去远程获取权限后使用
        LoginUser loginUser = respDataObj.toJavaObject(LoginUser.class);
        return loginUser;
    }
}
