package com.gccloud.gcpaas.core.shiro.sso;

import com.alibaba.fastjson2.JSONObject;
import com.gccloud.gcpaas.core.shiro.LoginUser;

public interface ISsoAdapterService {
    /**
     * sso适配器
     *
     * @param respObj
     * @return
     */
    LoginUser adapter(JSONObject respObj);
}
