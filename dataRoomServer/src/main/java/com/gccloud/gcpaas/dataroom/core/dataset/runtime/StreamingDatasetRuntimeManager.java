package com.gccloud.gcpaas.dataroom.core.dataset.runtime;

import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.DatasetMapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * 流式数据集运行态管理器。
 */
@Slf4j
@Service
public class StreamingDatasetRuntimeManager {

    @Resource
    private DatasetMapper datasetMapper;

    @Resource
    private List<StreamingDatasetRuntimeFactory> runtimeFactoryList;

    private final Map<String, StreamingDatasetRuntime> runtimeMap = new ConcurrentHashMap<>();

    private final Map<String, AtomicInteger> subscriberCountMap = new ConcurrentHashMap<>();

    public void subscribe(String datasetCode, Map<String, Object> params) {
        AtomicInteger subscriberCount = subscriberCountMap.computeIfAbsent(datasetCode, key -> new AtomicInteger(0));
        int count = subscriberCount.incrementAndGet();
        if (count > 1) {
            return;
        }
        try {
            StreamingDatasetRuntime runtime = createRuntime(datasetCode, params);
            runtimeMap.put(datasetCode, runtime);
            runtime.start();
        } catch (Exception e) {
            subscriberCountMap.remove(datasetCode);
            log.error(ExceptionUtils.getStackTrace(e));
        }
    }

    public void unsubscribe(String datasetCode) {
        AtomicInteger subscriberCount = subscriberCountMap.get(datasetCode);
        if (subscriberCount == null) {
            return;
        }
        int count = subscriberCount.decrementAndGet();
        if (count > 0) {
            return;
        }
        subscriberCountMap.remove(datasetCode);
        StreamingDatasetRuntime runtime = runtimeMap.remove(datasetCode);
        if (runtime != null) {
            runtime.stop();
        }
    }

    private StreamingDatasetRuntime createRuntime(String datasetCode, Map<String, Object> params) {
        DatasetEntity datasetEntity = datasetMapper.getByCode(datasetCode);
        if (datasetEntity == null || datasetEntity.getDatasetType() == null) {
            throw new DataRoomException("流式数据集不存在");
        }
        return runtimeFactoryList.stream()
                .filter(factory -> factory.supports(datasetEntity.getDatasetType()))
                .findFirst()
                .orElseThrow(() -> new DataRoomException("不支持的流式数据集类型"))
                .create(datasetEntity, params == null ? Map.of() : params);
    }
}
