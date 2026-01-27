package com.gccloud.gcpaas.core.util;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONObject;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;

import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Slf4j
public class TokenUtils {

    public TokenUtils() {
        throw new IllegalStateException("不允许创建");
    }

    /**
     * 获取登录的token信息
     *
     * @param request
     * @return
     */
    public static String getToken(HttpServletRequest request) {
        String tokenKey = "dataRoomToken";
        String token = request.getParameter(tokenKey);
        if (StringUtils.isNotBlank(token)) {
            return token;
        }
        token = request.getHeader(tokenKey);
        if (StringUtils.isNotBlank(token)) {
            return token;
        }
        Cookie[] cookieList = request.getCookies();
        if (cookieList == null || cookieList.length == 0) {
            return null;
        }
        for (Cookie cookie : cookieList) {
            if (tokenKey.equals(cookie.getName())) {
                return cookie.getValue();
            }
        }
        return null;
    }


    /**
     * 解析jwt,不进行安全校验
     *
     * @param token
     * @return
     */
    public static JSONObject parseWithOutValidate(String token) {
        try {
            String payloadBase64 = StringUtils.substringBetween(token, ".");
            String payload;
            // 包含-说明是Base64UrlCodec编码的，该编码方式会将"+"、"/"替换为"-"、"_"
            if (payloadBase64.contains("-") || payloadBase64.contains("_")) {
                payload = new String(Base64.getUrlDecoder().decode(payloadBase64.getBytes(StandardCharsets.UTF_8)));
            } else {
                payload = new String(Base64.getDecoder().decode(payloadBase64.getBytes(StandardCharsets.UTF_8)));
            }
            JSONObject tokenObj = JSON.parseObject(payload);
            return tokenObj;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return null;
    }
}
