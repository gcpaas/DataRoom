package com.gccloud.gcpaas.dataroom.core.shiro.sso;

import com.alibaba.fastjson2.JSONObject;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;

public interface ISsoAdapterService {
    /**
     * sso适配器
     *
     * @param respObj
     * @return
     */
    LoginUser adapter(JSONObject respObj);
}
