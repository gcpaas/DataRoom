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

package com.gccloud.dataroom.core.module.chart.service;

import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.JSON;
import com.gccloud.dataroom.core.module.chart.dto.ChartDataSearchDTO;
import com.gccloud.dataroom.core.module.chart.vo.ChartDataVO;
import com.gccloud.dataset.constant.DatasetConstant;
import com.gccloud.dataset.dto.DatasetParamDTO;
import com.gccloud.dataset.entity.DatasetEntity;
import com.gccloud.dataset.entity.config.JsonDataSetConfig;
import com.gccloud.dataset.service.IBaseDataSetService;
import com.gccloud.dataset.service.factory.DataSetServiceFactory;
import com.gccloud.dataset.vo.DatasetInfoVO;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.springframework.stereotype.Service;

import javax.annotation.Resource;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author liuchengbiao
 * @version 1.0
 * @date 2022/8/8 15:11
 */
@Data
@Slf4j
@Service("dataRoomBaseChartDataService")
public class BaseChartDataService {

    @Resource
    private DataSetServiceFactory dataSetServiceFactory;


    public ChartDataVO dataQuery(ChartDataSearchDTO searchDTO) {
        String businessKey = searchDTO.getBusinessKey();
        if (StringUtils.isBlank(businessKey)) {
            return null;
        }
        IBaseDataSetService dataSetService = dataSetServiceFactory.buildById(businessKey);
        DatasetEntity datasetEntity = dataSetService.getByIdFromCache(businessKey);
        if (datasetEntity == null) {
            return null;
        }
        if (DatasetConstant.DataSetType.JSON.equals(datasetEntity.getDatasetType())) {
            return jsonDataQuery(datasetEntity, dataSetService);
        }
        return dataSetDataQuery(searchDTO, dataSetService);
    }



    /**
     * json类型的数据集数据处理
     * @param dataSet
     * @return
     */
    private ChartDataVO jsonDataQuery(DatasetEntity dataSet, IBaseDataSetService dataSetService) {
        ChartDataVO dataDTO = new ChartDataVO();
        JsonDataSetConfig config = (JsonDataSetConfig) dataSet.getConfig();
        Object jsonContent = dataSetService.execute(dataSet.getId(), null);
        List<Map<String, Object>> data = Lists.newArrayList();
        if (jsonContent instanceof JSONArray) {
            jsonContent = ((JSONArray) jsonContent).toList();
        }
        if (jsonContent instanceof ArrayList) {
            ArrayList list = (ArrayList) jsonContent;
            for (Object o : list) {
                if (o instanceof HashMap) {
                    data.add((HashMap<String, Object>) o);
                }
            }
        }
        if (jsonContent instanceof HashMap) {
            HashMap map = (HashMap) jsonContent;
            data.add(map);
        }
        if (jsonContent instanceof JSONObject) {
            JSONObject jsonObject = (JSONObject) jsonContent;
            data.add(jsonObject.toMap());
        }
        HashMap<String, ChartDataVO.ColumnData> columnData = Maps.newHashMap();
        Map<String, Object> fieldDesc = config.getFieldDesc();
        fieldDesc.forEach((k, v) -> {
            ChartDataVO.ColumnData column = new ChartDataVO.ColumnData();
            column.setOriginalColumn(k);
            column.setAlias(k);
            column.setRemark(v.toString());
            columnData.put(k, column);
        });
        dataDTO.setData(data);
        dataDTO.setSuccess(true);
        dataDTO.setColumnData(columnData);
        return dataDTO;
    }


    /**
     * 根据数据集数据源查询数据
     * @param searchDTO 查询条件
     * @param dataSetService 数据集服务
     * @return
     */
    private ChartDataVO dataSetDataQuery(ChartDataSearchDTO searchDTO, IBaseDataSetService dataSetService) {
        ChartDataVO dataDTO = new ChartDataVO();
        List<DatasetParamDTO> params = Lists.newArrayList();
        String businessKey = searchDTO.getBusinessKey();
        if (StringUtils.isBlank(businessKey)) {
            throw new GlobalException("图表未配置数据集");
        }
        DatasetInfoVO dataSetInfoVo = dataSetService.getInfoById(businessKey);
        HashMap<String, ChartDataVO.ColumnData> columnData = Maps.newHashMap();
        List<Map<String, Object>> fieldJson = dataSetInfoVo.getFields();
        for (Map<String, Object> field : fieldJson) {
            ChartDataVO.ColumnData column = new ChartDataVO.ColumnData();
            column.setOriginalColumn(field.get(DatasetInfoVO.FIELD_NAME).toString());
            column.setAlias(field.get(DatasetInfoVO.FIELD_NAME).toString());
            column.setRemark(field.get(DatasetInfoVO.FIELD_DESC).toString());
            String sourceTable = field.get(DatasetInfoVO.FIELD_SOURCE) == null ? "" : field.get(DatasetInfoVO.FIELD_SOURCE).toString();
            column.setTableName(sourceTable);
            String type = field.get(DatasetInfoVO.FIELD_TYPE) == null ? "" : field.get(DatasetInfoVO.FIELD_TYPE).toString();
            column.setType(type);
            columnData.put(field.get(DatasetInfoVO.FIELD_NAME).toString(), column);
        }
        // 将过滤条件与数据集原始参数合并，注意使用JSON序列化和反序列化，避免修改缓存中的数据集数据
        List<DatasetParamDTO> setParams = JSON.parseArray(JSON.toJSONString(dataSetInfoVo.getParams()), DatasetParamDTO.class);
        Map<String, String> inParams = searchDTO.getParams();
        if (inParams != null && !inParams.isEmpty()) {
            for (DatasetParamDTO defaultParam : setParams) {
                if (inParams.containsKey(defaultParam.getName())) {
                    defaultParam.setValue(inParams.get(defaultParam.getName()));
                    params.add(defaultParam);
                }
            }
        }
        dataDTO.setColumnData(columnData);
        Object data;
        log.info("查询数据集数据，参数：{}", JSON.toJSONString(params));
        data = dataSetService.execute(businessKey, params);
        boolean backendExecutionNeeded = dataSetService.checkBackendExecutionNeeded(businessKey);
        dataDTO.setExecutionByFrontend(!backendExecutionNeeded);
        dataDTO.setData(data);
        dataDTO.setSuccess(true);
        return dataDTO;
    }

}