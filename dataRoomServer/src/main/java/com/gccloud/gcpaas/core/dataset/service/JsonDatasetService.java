package com.gccloud.gcpaas.core.dataset.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.core.constant.DatasetType;
import com.gccloud.gcpaas.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.core.dataset.bean.JsonDataset;
import com.gccloud.gcpaas.core.entity.DatasetEntity;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Slf4j
@Service(value = DatasetType.JSON_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
public class JsonDatasetService extends AbstractDatasetService {

    private static final ObjectMapper OBJECT_MAPPER = new ObjectMapper();

    @Override
    public DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        DatasetRunResponse datasetRunResponse = new DatasetRunResponse();
        JsonDataset dataSet = (JsonDataset) datasetEntity.getDataset();
        try {
            Object data = OBJECT_MAPPER.readValue(dataSet.getJson(), Object.class);
            datasetRunResponse.setData(data);
        } catch (JsonProcessingException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            datasetRunResponse.setData(new ArrayList<>());
        }
        return datasetRunResponse;
    }
}
