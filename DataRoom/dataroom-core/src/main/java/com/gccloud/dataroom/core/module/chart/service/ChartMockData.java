package com.gccloud.dataroom.core.module.chart.service;

import com.gccloud.dataroom.core.constant.PageDesignConstant;
import com.gccloud.dataroom.core.module.chart.vo.ChartDataVO;
import com.gccloud.common.utils.JSON;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.io.InputStream;

/**
 * @author hongyang
 * @version 1.0
 * @date 2022/8/25 17:09
 */
@Slf4j
@Service("dataRoomChartMockDataService")
public class ChartMockData {

    public static ChartDataVO getMockData(String type) {
        ChartDataVO chartDataDTO;
        String fileName = "chart/mock/" + type + ".json";
        if (PageDesignConstant.BigScreen.Type.SCREEN_SCROLL_BOARD.equals(type)) {
            fileName = "chart/mock/tables.json";
        }
        if (PageDesignConstant.BigScreen.Type.SCREEN_SCROLL_RANKING.equals(type)) {
            fileName = "chart/mock/ranking.json";
        }
        String json = "";
        ResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();
        try {
            Resource[] resources = resolver.getResources(fileName);
            Resource resource = resources[0];
            if (!resource.exists()) {
                return new ChartDataVO();
            }
            //获得文件流，因为在jar文件中，不能直接通过文件资源路径拿到文件，但是可以在jar包中拿到文件流
            InputStream stream = resource.getInputStream();
            StringBuilder buffer = new StringBuilder();
            byte[] bytes = new byte[1024];
            for (int n; (n = stream.read(bytes)) != -1; ) {
                buffer.append(new String(bytes, 0, n));
            }
            json = buffer.toString();
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return new ChartDataVO();
        }
        chartDataDTO = JSON.parseObject(json, ChartDataVO.class);
        return chartDataDTO;
    }

}
