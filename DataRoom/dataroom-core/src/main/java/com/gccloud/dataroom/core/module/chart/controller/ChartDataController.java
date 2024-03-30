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

    @PostMapping("/list")
    @ApiOperation(value = "图表数据", position = 10, notes = "获取指定图表的数据(通过唯一编码)", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<ChartDataVO> getDataByCode(@RequestBody ChartDataSearchDTO chartDataSearchDTO) {
        PageEntity pageEntity = pageService.getByCode(chartDataSearchDTO.getPageCode());
        AssertUtils.isTrue(pageEntity != null, "页面不存在");
        BasePageDTO config = pageEntity.getConfig();
        List<Map<String, Object>> chartList = null;
        if (config.getClass().equals(DataRoomPageDTO.class)) {
            chartList = config.getChartList();
        }
        if (chartList == null) {
            return R.success(new ChartDataVO());
        }
        Map<String, Object> chart = getByCode(chartList, chartDataSearchDTO.getChartCode());
        if (chart == null) {
            return R.success(new ChartDataVO());
        }
        Object dataSourceObj = chart.get("dataSource");
        if (dataSourceObj == null) {
            return R.success(new ChartDataVO());
        }
        // 转换数据源，dataSourceObj是一个Map
        DataSetDataSource dataSource = new DataSetDataSource((Map<String, Object>) dataSourceObj);
        return getChartData(chartDataSearchDTO, dataSource);
    }

    @PostMapping("/chart")
    @ApiOperation(value = "图表数据", position = 20, notes = "获取指定图表的数据(通过配置)", produces = MediaType.APPLICATION_JSON_VALUE)
    public R<ChartDataVO> getDataByConfig(@RequestBody ChartDataSearchDTO chartDataSearchDTO) {
        PageEntity pageEntity = pageService.getByCode(chartDataSearchDTO.getPageCode());
        AssertUtils.isTrue(pageEntity != null, "页面不存在");
        DataSetDataSource dataSource = chartDataSearchDTO.getDataSource();
        return getChartData(chartDataSearchDTO, dataSource);
    }



    /**
     * 获取图表数据
     * @param chartDataSearchDTO
     * @param dataSource
     * @return
     */
    private R<ChartDataVO> getChartData(ChartDataSearchDTO chartDataSearchDTO, DataSetDataSource dataSource) {
        ChartDataVO failChartDataVO = new ChartDataVO();
        try {
            ChartDataVO chartDataVO = baseChartDataService.dataQuery(dataSource, chartDataSearchDTO);
            if (chartDataVO == null) {
                return R.success(failChartDataVO);
            }
            return R.success(chartDataVO);
        } catch (Exception e) {
            log.error("图表数据获取失败", e);
            return R.success(failChartDataVO);
        }
    }

    /**
     * 从组件列表中获取指定code的图表组件
     * @param chartList
     * @param code
     * @return
     */
    public Map<String, Object> getByCode(List<Map<String, Object>> chartList, String code) {
        for (Map<String, Object> chart : chartList) {
            if (chart.get("code").equals(code)) {
                return chart;
            }
            if (chart.containsKey("children")) {
                Map<String, Object> childChart = getByCode((List<Map<String, Object>>) chart.get("children"), code);
                if (childChart != null) {
                    return childChart;
                }
            }
        }
        return null;
    }
}
