package com.gccloud.dataroom.core.module.chart.controller;

import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.basic.entity.PageEntity;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import com.gccloud.dataroom.core.module.chart.components.ChartTabChart;
import com.gccloud.dataroom.core.module.chart.components.ScreenFlyMapChart;
import com.gccloud.dataroom.core.module.chart.dto.ChartDataSearchDTO;
import com.gccloud.dataroom.core.module.chart.service.BaseChartDataService;
import com.gccloud.dataroom.core.module.chart.service.ChartMockData;
import com.gccloud.dataroom.core.module.chart.vo.ChartDataVO;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPageService;
import com.gccloud.common.utils.AssertUtils;
import com.gccloud.common.vo.R;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.List;

/**
 * 图表组件数据获取
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Slf4j
@RestController("dataRoomChartController")
@RequestMapping("/bigScreen/chart/data")
@Api(tags = "图表组件数据获取")
public class ChartDataController {

    @Resource
    private IDataRoomPageService pageService;
    @Resource
    private BaseChartDataService baseChartDataService;

    @PostMapping("/list")
    @ApiOperation(value = "图表数据", position = 10, notes = "获取指定图表的数据(通过唯一编码)", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<ChartDataVO> basicTableList(@RequestBody ChartDataSearchDTO chartDataSearchDTO) {
        PageEntity pageEntity = pageService.getByCode(chartDataSearchDTO.getPageCode());
        AssertUtils.isTrue(pageEntity != null, "页面不存在");
        BasePageDTO config = pageEntity.getConfig();
        List<Chart> chartList = null;
        if (config.getClass().equals(DataRoomPageDTO.class)) {
            chartList = ((DataRoomPageDTO) config).getChartList();
        }
        if (chartList == null) {
            ChartDataVO mockData = ChartMockData.getMockData(chartDataSearchDTO.getType());
            return R.success(mockData);
        }
        Chart chart = getByCode(chartList, chartDataSearchDTO.getChartCode());
        return getChartData(chartDataSearchDTO, config, chart);
    }

    @PostMapping("/chart")
    @ApiOperation(value = "图表数据", position = 20, notes = "获取指定图表的数据(通过配置)", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<ChartDataVO> getChartData(@RequestBody ChartDataSearchDTO chartDataSearchDTO) {
        PageEntity pageEntity = pageService.getByCode(chartDataSearchDTO.getPageCode());
        AssertUtils.isTrue(pageEntity != null, "页面不存在");
        BasePageDTO config = pageEntity.getConfig();
        Chart chart = chartDataSearchDTO.getChart();
        return getChartData(chartDataSearchDTO, config, chart);
    }

    @GetMapping("/mock/{type}")
    @ApiOperation(value = "图表模拟数据", position = 30, notes = "获取指定类型的图表模拟数据", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<ChartDataVO> getMockData(@PathVariable String type) {
        ChartDataVO mockData = ChartMockData.getMockData(type);
        return R.success(mockData);
    }


    /**
     * 获取图表数据
     * @param chartDataSearchDTO
     * @param config
     * @param chart
     * @return
     */
    private R<ChartDataVO> getChartData(ChartDataSearchDTO chartDataSearchDTO, BasePageDTO config, Chart chart) {
        if (chart == null) {
            ChartDataVO mockData = ChartMockData.getMockData(chartDataSearchDTO.getType());
            return R.success(mockData);
        }
        try {
            ChartDataVO chartDataVO = baseChartDataService.dataQuery(chart, chartDataSearchDTO);
            if (chartDataVO == null) {
                String type = chartDataSearchDTO.getType();
                if (chart instanceof ScreenFlyMapChart) {
                    ScreenFlyMapChart screenFlyMapChart = (ScreenFlyMapChart) chart;
                    ScreenFlyMapChart.Customize customize = screenFlyMapChart.getCustomize();
                    // 兼容旧版地图等级
                    switch (customize.getLevel()) {
                        case "0":
                            type += "-world";
                            break;
                        case "1":
                            type += "-country";
                            break;
                        case "2":
                            type += "-province";
                            break;
                        default:
                            type += "-" + customize.getLevel();
                    }
                }
                chartDataVO = ChartMockData.getMockData(type);
            }
            return R.success(chartDataVO);
        } catch (Exception e) {
            log.error("图表数据获取失败", e);
            ChartDataVO mockData = ChartMockData.getMockData(chartDataSearchDTO.getType());
            return R.success(mockData);
        }
    }

    /**
     * 从组件列表中获取指定code的图表组件
     * @param chartList
     * @param code
     * @return
     */
    public Chart getByCode(List<Chart> chartList, String code) {
        for (Chart chart : chartList) {
            if (chart.getCode().equals(code)) {
                return chart;
            }
            // 如果是Tab图表，尝试从内部图表中获取
            if (chart instanceof ChartTabChart) {
                ChartTabChart chartTabChart = (ChartTabChart) chart;
                Chart innerChart = chartTabChart.getInnerChart(code);
                if (innerChart != null) {
                    return innerChart;
                }
            }
        }
        return null;
    }
}
