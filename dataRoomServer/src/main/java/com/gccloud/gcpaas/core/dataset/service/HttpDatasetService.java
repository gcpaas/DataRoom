package com.gccloud.gcpaas.core.dataset.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONPath;
import com.gccloud.gcpaas.core.bean.KeyVal;
import com.gccloud.gcpaas.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.core.constant.DatasetType;
import com.gccloud.gcpaas.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.core.dataset.bean.DatasetInputParam;
import com.gccloud.gcpaas.core.dataset.bean.HttpDataset;
import com.gccloud.gcpaas.core.entity.DatasetEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.util.ParamUtils;
import com.gccloud.gcpaas.core.util.TypeUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Slf4j
@Service(value = DatasetType.HTTP_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
public class HttpDatasetService extends AbstractDatasetService {

    @Resource
    private RestTemplate restTemplate;

    @Override
    public DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        DatasetRunResponse datasetRunResponse = new DatasetRunResponse();
        HttpDataset httpDataset = (HttpDataset) datasetEntity.getDataset();
        try {
            Map<String, Object> params = new HashMap<>();
            List<DatasetInputParam> inputParamList = datasetEntity.getInputList();
            Map<String, DatasetInputParam> inputParamMap = new HashMap<>();
            for (DatasetInputParam inputParam : inputParamList) {
                inputParamMap.put(inputParam.getName(), inputParam);
                params.put(inputParam.getName(), TypeUtils.transType(inputParam.getDefaultVal(), inputParam.getType()));
            }
            Map<String, Object> realInputParam = datasetRunRequest.getInputParam();
            // 组合实际传入参数
            realInputParam.entrySet().forEach((entry) -> {
                DatasetInputParam defInputParam = inputParamMap.get(entry.getKey());
                if (defInputParam != null) {
                    params.put(entry.getKey(), TypeUtils.transType(entry.getValue(), defInputParam.getType()));
                } else {
                    params.put(entry.getKey(), entry.getValue());
                }
            });
            // 注入默认参数
            Map<String, Object> defaultInputParam = getDefaultInputParam();
            params.putAll(defaultInputParam);

            HttpHeaders headers = new HttpHeaders();
            List<KeyVal> headerList = httpDataset.getHeaderList();
            for (KeyVal keyVal : headerList) {
                headers.add(keyVal.getKey(), keyVal.getVal());
            }
            if (headers.getContentType() == null) {
                headers.add(HttpHeaders.CONTENT_TYPE, "application/json");
            }
            String url = httpDataset.getUrl();
            String body = httpDataset.getBody();
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                if (entry.getValue() == null) {
                    continue;
                }
                // 替换URL
                url = ParamUtils.replace(url, entry.getKey(), entry.getValue().toString());
                // 替换header
                Set<String> headerKeySet = headers.keySet();
                for (String headerKey : headerKeySet) {
                    String headerVal = headers.getFirst(headerKey);
                    headerVal = ParamUtils.replace(headerVal, entry.getKey(), entry.getValue().toString());
                    headers.set(headerKey, headerVal);
                }
                // 替换请求体
                body = ParamUtils.replace(body, entry.getKey(), entry.getValue().toString());
            }
            Object data = null;
            if (DataRoomConstant.Dataset.HTTP_DATASET.METHOD.GET.equalsIgnoreCase(httpDataset.getMethod())) {
                HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
                ResponseEntity<String> response = restTemplate.exchange(
                        url,
                        HttpMethod.GET,
                        requestEntity,
                        String.class
                );
                String respBody = response.getBody();
                if (!response.getStatusCode().is2xxSuccessful()) {
                    log.error("数据集 {} 请求失败，状态码：{}, 响应: {}", datasetEntity.getName(), response.getStatusCode(), respBody);
                    throw new DataRoomException("数据集" + datasetEntity.getName() + "执行失败");
                }
                data = JSON.parse(respBody);
            } else if (DataRoomConstant.Dataset.HTTP_DATASET.METHOD.POST.equalsIgnoreCase(httpDataset.getMethod())) {
                HttpEntity<String> requestEntity = new HttpEntity<>(body, headers);
                ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
                String respBody = response.getBody();
                if (!response.getStatusCode().is2xxSuccessful()) {
                    log.error("数据集 {} 请求失败，状态码：{}, 响应: {}", datasetEntity.getName(), response.getStatusCode(), respBody);
                    throw new DataRoomException("数据集" + datasetEntity.getName() + "执行失败");
                }
                data = JSON.parse(respBody);
            } else {
                throw new DataRoomException("不支持的请求方法");
            }
            if (StringUtils.isNotBlank(httpDataset.getRespJsonPath())) {
                data = JSONPath.eval(data, httpDataset.getRespJsonPath());
            }
            datasetRunResponse.setData(data);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            datasetRunResponse.setData(new ArrayList<>());
        }
        return datasetRunResponse;
    }

    public static void main(String[] args) {
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Type", "application/json");
        System.out.println(headers.getContentType());
    }
}
