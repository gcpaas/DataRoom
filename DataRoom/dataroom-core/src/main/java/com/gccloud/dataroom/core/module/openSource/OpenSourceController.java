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
package com.gccloud.dataroom.core.module.openSource;

import com.gccloud.common.vo.R;
import com.gccloud.dataroom.core.module.biz.component.controller.BizComponentController;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiSort;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.nio.charset.Charset;

/**
 * @author liuchengbiao
 */
@Slf4j
@RestController
@RequestMapping("/dataroom/opensource")
@Api(tags = "开源")
@ApiSort(value = 100)
public class OpenSourceController {

    @GetMapping("/disclaimer")
    @ApiOperation(value = "免责申明", notes = "免责申明", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<String> disclaimer() {
        try (InputStream is = OpenSourceController.class.getClassLoader().getResourceAsStream("disclaimer.html")) {
            String content = IOUtils.toString(is, Charset.forName("utf-8"));
            return R.success(content);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return R.error("免责申明获取失败");
    }
}
