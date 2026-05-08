package com.gccloud.gcpaas.core.dataset.service;

import com.gccloud.gcpaas.core.constant.DataRoomConstant;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.context.ApplicationContext;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class DatasetServiceFactory {

    @Resource
    private ApplicationContext applicationContext;

    /**
     * 根据类型获取数据集实现类
     *
     * @param type
     * @return
     */
    public AbstractDatasetService getDatasetService(String type) {
        try {
            AbstractDatasetService datasetService = (AbstractDatasetService) applicationContext.getBean(type + DataRoomConstant.Dataset.SERVICE_NAME);
            return datasetService;
        } catch (Exception e) {
            log.error("获取 {} 类型的数据集实现类失败，{}", type, ExceptionUtils.getStackTrace(e));
            throw e;
        }
    }
}
