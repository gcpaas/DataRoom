package com.gccloud.gcpaas.core.shiro.sso;

import com.alibaba.fastjson2.JSONObject;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.shiro.LoginUser;
import com.google.common.base.Joiner;
import org.apache.commons.lang3.StringUtils;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 适配若依的 /getInfo 接口
 */
@Service
@ConditionalOnProperty(prefix = "dataroom.sso", name = "adapter", havingValue = "ruoyi")
public class RuoYiSsoAdapterService implements ISsoAdapterService {
    @Override
    public LoginUser adapter(JSONObject respObj) {
        int code = respObj.getIntValue("code");
        if (code != 200) {
            throw new DataRoomException("单点登录校验失败");
        }
        JSONObject respUserObj = respObj.getJSONObject("user");
        LoginUser loginUser = new LoginUser();
        loginUser.setAccount(respUserObj.getString("userName"));
        loginUser.setUsername(respUserObj.getString("nickName"));
        if (StringUtils.isBlank(loginUser.getUsername())) {
            loginUser.setUsername(respUserObj.getString("remark"));
        }
        List<String> roles = respObj.getList("roles", String.class);
        loginUser.setRole(Joiner.on(",").join(roles));
        return loginUser;
    }
}
