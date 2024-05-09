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

package com.gccloud.dataroom.core.module.chart.controller;

import com.gccloud.common.utils.AssertUtils;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.common.vo.R;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.dataroom.core.module.chart.components.datasource.DataSetDataSource;
import com.gccloud.dataroom.core.module.chart.dto.ChartDataSearchDTO;
import com.gccloud.dataroom.core.module.chart.service.BaseChartDataService;
import com.gccloud.dataroom.core.module.chart.vo.ChartDataVO;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPageService;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.annotation.Resource;
import java.util.List;
import java.util.Map;

/**
 * 图表组件数据获取
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Slf4j
@RestController("dataRoomChartController")
@RequestMapping("/dataroom/chart/data")
@Api(tags = "图表组件数据获取")
public class ChartDataController {

    @Resource
    private IDataRoomPageService pageService;
    @Resource
    private BaseChartDataService baseChartDataService;

    @PostMapping("/chart")
    @ApiOperation(value = "图表数据", position = 20, notes = "获取指定图表的数据(通过配置)", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<ChartDataVO> getDataByConfig(@RequestBody ChartDataSearchDTO chartDataSearchDTO) {
        // NOTE 这里暂时去除了页面存在性的校验，因为业务组件设计时，也会调用这个接口，而业务组件设计时，没有页面编码
//        AssertUtils.isTrue(pageService.checkPageExist(chartDataSearchDTO.getPageCode()), "页面不存在");
        return getChartData(chartDataSearchDTO);
    }

    /**
     * 获取图表数据
     * @param chartDataSearchDTO
     * @return
     */
    private R<ChartDataVO> getChartData(ChartDataSearchDTO chartDataSearchDTO) {
        ChartDataVO failChartDataVO = new ChartDataVO();
        try {
            ChartDataVO chartDataVO = baseChartDataService.dataQuery(chartDataSearchDTO);
            if (chartDataVO == null) {
                return R.success(failChartDataVO);
            }
            return R.success(chartDataVO);
        } catch (Exception e) {
            log.error("图表数据获取失败", e);
            return R.success(failChartDataVO);
        }
    }

}