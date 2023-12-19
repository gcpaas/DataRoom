package com.gccloud.dataroom.core.module.basic.task;

import com.gccloud.dataroom.core.module.manage.service.IDataRoomPagePreviewService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import javax.annotation.Resource;

/**
 * 每日定时清理预览临时表数据
 * @author hongyang
 * @version 1.0
 * @date 2023/9/13 10:37
 */
@EnableScheduling
@Component
@Slf4j
public class PreviewClearTask {

    @Resource
    private IDataRoomPagePreviewService previewService;


    @Scheduled(cron = "0 0 1 * * ?")
    public void clear() {
        log.info("开始清理预览数据");
        previewService.clear();
    }


}
