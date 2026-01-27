package com.gccloud.gcpaas.server;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.lang.management.ManagementFactory;
import java.lang.management.RuntimeMXBean;
import java.net.InetAddress;

@Slf4j
@Order(1)
@Component
public class SuccessCommandLineRunner implements CommandLineRunner {

    @jakarta.annotation.Resource
    private Environment env;

    @Override
    public void run(String... args) throws Exception {
        String LINE = "------------------------------------";
        String ip = InetAddress.getLocalHost().getHostAddress();
        String port = env.getProperty("server.port", "8080");
        String path = env.getProperty("server.servlet.context-path", "");
        log.info(LINE);
        // 获取 JVM 启动时间（毫秒）
        RuntimeMXBean runtimeMxBean = ManagementFactory.getRuntimeMXBean();
        long startTimeMillis = runtimeMxBean.getStartTime();
        log.info("启动耗时: {} 毫秒", System.currentTimeMillis() - startTimeMillis);
        log.info("后端服务地址: http://{}:{}{}", ip, port, path);
        log.info("接口文档地址: http://{}:{}{}/doc.html", ip, port, path);
        log.info("页面访问地址: http://{}:{}{}/static/dataRoomFront/index.html", ip, port, path);
        log.info("DataRoom启动成功 ^_^，使用问题请反馈到 https://gitee.com/gcpaas/DataRoom-Plus/issues");
        log.info(LINE);
    }
}
