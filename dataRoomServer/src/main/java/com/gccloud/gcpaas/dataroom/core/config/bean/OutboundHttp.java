package com.gccloud.gcpaas.dataroom.core.config.bean;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class OutboundHttp {

    /**
     * 允许访问的内部目标，默认空列表；修改后需重启。
     * 普通条目按 host:port 精确匹配 URL 主机；regex: 前缀条目使用 Java 正则完整匹配
     * 规范化后的 host:port 或每个解析 IP:port（IPv6 为 [ip]:port）。
     * 主机名转小写，IP 使用规范化表示；端口为 1–65535，未显式指定时按协议取默认端口。
     * 正则启动时预编译，空或非法表达式启动失败；仅允许可信管理员配置，避免宽泛或高回溯表达式。
     */
    private List<String> allowedInternalTargets = new ArrayList<>();
}
