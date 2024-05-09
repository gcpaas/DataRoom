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

package com.gccloud.dataroom.core.module.manage.dto;

import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import io.swagger.annotations.ApiModelProperty;
import lombok.Data;

import java.util.List;
import java.util.Map;

/**
 * 大屏页面
 * @author hongyang
 * @version 1.0
 * @date 2023/3/13 10:49
 */
@Data
public class DataRoomPageDTO extends BasePageDTO {

    @ApiModelProperty(notes = "大屏页图标")
    private String icon;

    @ApiModelProperty(notes = "大屏页颜色")
    private String iconColor;

    @ApiModelProperty(notes = "大屏整体样式")
    private String style;

    @ApiModelProperty(notes = "交互")
    private List<Map<String, Object>> interactions;

    @ApiModelProperty(notes = "全局变量")
    private List<Map<String, Object>> globalVariable;

    @ApiModelProperty(notes = "弹窗")
    private Map<String, Object> dialog;

    @ApiModelProperty(notes = "页面配置")
    private PageConfig pageConfig;

    @Data
    public static class CacheDataSet {
        @ApiModelProperty(notes = "数据集名称")
        private String name;

        @ApiModelProperty(notes = "数据集id")
        private String dataSetId;
    }

    @Data
    public static class PageConfig {

        @ApiModelProperty(notes = "宽度")
        private Integer w;

        @ApiModelProperty(notes = "高度")
        private Integer h;

        @ApiModelProperty(notes = "背景色")
        private String bgColor;

        @ApiModelProperty(notes = "明亮模式背景色")
        private String lightBgColor;

        @ApiModelProperty(notes = "背景图")
        private String bg;

        @ApiModelProperty(notes = "明亮模式背景图")
        private String lightBg;

        @ApiModelProperty(notes = "自定义主题")
        private String customTheme;

        @ApiModelProperty(notes = "透明度")
        private Float opacity;

        @ApiModelProperty(notes = "缓存数据集")
        private List<CacheDataSet> cacheDataSets;

        @ApiModelProperty(notes = "自适应类型")
        private String fitMode;

        @ApiModelProperty(notes = "定时刷新配置")
        private List<RefreshConfig> refreshConfig;

        @ApiModelProperty(notes = "自动填充")
        private Boolean autofill;

    }

}