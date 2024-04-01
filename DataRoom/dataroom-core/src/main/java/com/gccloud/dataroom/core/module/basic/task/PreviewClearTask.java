/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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