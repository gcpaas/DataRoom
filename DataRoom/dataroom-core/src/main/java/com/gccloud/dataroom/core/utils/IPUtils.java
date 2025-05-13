package com.gccloud.dataroom.core.utils;

import com.alibaba.fastjson.JSONObject;
import com.google.common.collect.Sets;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;

import javax.servlet.http.HttpServletRequest;
import java.util.Set;

/**
 * @author 猛击小菜鸟
 * @date 2021年06月21日10:23:08
 * @since 1.2.2
 */
@Slf4j
public class IPUtils {

    public static final Set<String> IP_HEADER_SET = Sets.newHashSet(
            "browser-ip", "X-Real-IP", "browser", "X-Forwarded-For", "Proxy-Client-IP", "WL-Proxy-Client-IP", "HTTP_CLIENT_IP", "HTTP_X_FORWARDED_FOR");

    /**
     * 获取IP地址
     * <p>
     * 使用Nginx等反向代理软件， 则不能通过request.getRemoteAddr()获取IP地址
     * 如果使用了多级反向代理的话，X-Forwarded-For的值并不止一个，而是一串IP地址，X-Forwarded-For中第一个非unknown的有效IP字符串，则为真实IP地址
     */
    public static String getIp(HttpServletRequest request) {
        String ip = null;
        // 为了防止IP记录有误，把他们都记录下来
        JSONObject ipObj = new JSONObject();
        try {
            for (String name : IP_HEADER_SET) {
                ip = request.getHeader(name);
                if (StringUtils.isNotBlank(ip) && !"unknown".equalsIgnoreCase(ip)) {
                    ipObj.put(name, ip);
                }
            }
            ip = request.getRemoteAddr();
            if (StringUtils.isNotBlank(ip) && !"unknown".equalsIgnoreCase(ip)) {
                ipObj.put("RemoteAddr", ip);
            }
            ip = request.getRemoteHost();
            if (StringUtils.isNotBlank(ip) && !"unknown".equalsIgnoreCase(ip)) {
                ipObj.put("RemoteHost", ip);
            }
        } catch (Exception e) {
            log.error("获取IP失败：{}", e.getMessage());
        }
        return ipObj.toJSONString();
    }
}
