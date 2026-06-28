package com.gccloud.gcpaas.dataroom.core.dataset.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONPath;
import com.gccloud.gcpaas.dataroom.core.bean.KeyVal;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.dataroom.core.constant.DatasetType;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.DatasetInputParam;
import com.gccloud.gcpaas.dataroom.core.dataset.bean.HttpDataset;
import com.gccloud.gcpaas.dataroom.core.datasource.bean.HttpDatasource;
import com.gccloud.gcpaas.dataroom.core.datasource.service.DatasourceService;
import com.gccloud.gcpaas.dataroom.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.dataroom.core.entity.DatasetEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.util.ParamUtils;
import com.gccloud.gcpaas.dataroom.core.util.RsaUtils;
import com.gccloud.gcpaas.dataroom.core.util.TypeUtils;
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
import java.util.Locale;

@Slf4j
@Service(value = DatasetType.HTTP_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
public class HttpDatasetService extends AbstractDatasetService {

    @Resource
    private RestTemplate restTemplate;
    @Resource
    private DatasourceService datasourceService;
    @Resource
    private DataRoomConfig dataRoomConfig;

    @Override
    public DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        DatasetRunResponse datasetRunResponse = new DatasetRunResponse();
        HttpDataset httpDataset = (HttpDataset) datasetEntity.getDataset();
        try {
            Map<String, Object> params = buildParams(datasetRunRequest, datasetEntity);
            HttpDatasource httpDatasource = resolveDatasource(datasetEntity.getDataSourceCode());
            HttpHeaders headers = buildHeaders(
                    httpDatasource == null ? null : httpDatasource.getHeaderList(),
                    httpDataset.getHeaderList(),
                    params
            );
            if (headers.getContentType() == null) {
                headers.add(HttpHeaders.CONTENT_TYPE, "application/json");
            }
            String url = resolveUrl(httpDataset.getUrl(), httpDatasource, params);
            String body = httpDataset.getBody();
            for (Map.Entry<String, Object> entry : params.entrySet()) {
                if (entry.getValue() == null) {
                    continue;
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

    private Map<String, Object> buildParams(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        Map<String, Object> params = new HashMap<>();
        List<DatasetInputParam> inputParamList = Optional.ofNullable(datasetEntity.getInputList()).orElseGet(ArrayList::new);
        Map<String, DatasetInputParam> inputParamMap = new HashMap<>();
        for (DatasetInputParam inputParam : inputParamList) {
            inputParamMap.put(inputParam.getName(), inputParam);
            params.put(inputParam.getName(), TypeUtils.transType(inputParam.getDefaultVal(), inputParam.getType()));
        }
        Map<String, Object> realInputParam = Optional.ofNullable(datasetRunRequest.getInputParam()).orElseGet(HashMap::new);
        realInputParam.forEach((key, value) -> {
            DatasetInputParam defInputParam = inputParamMap.get(key);
            if (defInputParam != null) {
                params.put(key, TypeUtils.transType(value, defInputParam.getType()));
            } else {
                params.put(key, value);
            }
        });
        params.putAll(getDefaultInputParam());
        return params;
    }

    private HttpDatasource resolveDatasource(String dataSourceCode) {
        if (StringUtils.isBlank(dataSourceCode)) {
            return null;
        }
        DataSourceEntity dataSourceEntity = datasourceService.getByCode(dataSourceCode);
        if (dataSourceEntity == null || dataSourceEntity.getDataSource() == null) {
            throw new DataRoomException("HTTP数据源不存在");
        }
        if (!(dataSourceEntity.getDataSource() instanceof HttpDatasource httpDatasource)) {
            throw new DataRoomException("请选择HTTP数据源");
        }
        return httpDatasource;
    }

    private static String resolveUrl(String configuredUrl, HttpDatasource httpDatasource, Map<String, Object> params) {
        if (StringUtils.isBlank(configuredUrl)) {
            throw new DataRoomException("访问路径不能为空");
        }
        String requestUrl = configuredUrl.trim();
        if (httpDatasource == null) {
            if (!isAbsoluteHttpUrl(requestUrl)) {
                throw new DataRoomException("未选择HTTP数据源时访问路径必须是完整URL");
            }
        } else {
            if (isAbsoluteHttpUrl(requestUrl)) {
                throw new DataRoomException("选择HTTP数据源后访问路径必须是相对路径");
            }
            requestUrl = joinUrl(httpDatasource.getBaseUrl(), requestUrl);
        }
        return replaceParams(requestUrl, params);
    }

    private HttpHeaders buildHeaders(List<KeyVal> datasourceHeaders, List<KeyVal> datasetHeaders, Map<String, Object> params) {
        LinkedHashMap<String, KeyVal> mergedHeaders = new LinkedHashMap<>();
        mergeHeaders(mergedHeaders, datasourceHeaders);
        mergeHeaders(mergedHeaders, datasetHeaders);

        HttpHeaders headers = new HttpHeaders();
        for (KeyVal keyVal : mergedHeaders.values()) {
            if (keyVal == null || StringUtils.isBlank(keyVal.getKey())) {
                continue;
            }
            headers.add(keyVal.getKey(), resolveHeaderValue(keyVal, params));
        }
        return headers;
    }

    private static void mergeHeaders(LinkedHashMap<String, KeyVal> mergedHeaders, List<KeyVal> sourceHeaders) {
        if (sourceHeaders == null) {
            return;
        }
        for (KeyVal keyVal : sourceHeaders) {
            if (keyVal == null || StringUtils.isBlank(keyVal.getKey())) {
                continue;
            }
            String normalizedKey = normalizeHeaderKey(keyVal.getKey());
            if (mergedHeaders.containsKey(normalizedKey)) {
                mergedHeaders.remove(normalizedKey);
            }
            mergedHeaders.put(normalizedKey, keyVal);
        }
    }

    private String resolveHeaderValue(KeyVal keyVal, Map<String, Object> params) {
        String value = StringUtils.defaultString(keyVal.getVal());
        if (Boolean.TRUE.equals(keyVal.getEncrypted())) {
            value = RsaUtils.decryptByPrivateKey(value, dataRoomConfig.getPrivateKey());
            if (value == null) {
                throw new DataRoomException("请求头解密失败");
            }
        }
        return replaceParams(value, params);
    }

    private static boolean isAbsoluteHttpUrl(String url) {
        String normalized = StringUtils.defaultString(url).trim().toLowerCase(Locale.ROOT);
        return normalized.startsWith("http://") || normalized.startsWith("https://");
    }

    private static String joinUrl(String baseUrl, String path) {
        if (StringUtils.isBlank(baseUrl)) {
            throw new DataRoomException("HTTP数据源基础地址不能为空");
        }
        String normalizedBaseUrl = baseUrl.trim();
        String normalizedPath = StringUtils.defaultString(path).trim();
        if (normalizedBaseUrl.endsWith("/") && normalizedPath.startsWith("/")) {
            return normalizedBaseUrl + normalizedPath.substring(1);
        }
        if (!normalizedBaseUrl.endsWith("/") && !normalizedPath.startsWith("/")) {
            return normalizedBaseUrl + "/" + normalizedPath;
        }
        return normalizedBaseUrl + normalizedPath;
    }

    private static String replaceParams(String text, Map<String, Object> params) {
        String result = text;
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            if (entry.getValue() == null) {
                continue;
            }
            result = ParamUtils.replace(result, entry.getKey(), entry.getValue().toString());
        }
        return result;
    }

    private static String normalizeHeaderKey(String key) {
        return key.trim().toLowerCase(Locale.ROOT);
    }
}
