package com.gccloud.gcpaas.core.dataset.service;

import com.alibaba.fastjson2.JSON;
import com.alibaba.fastjson2.JSONPath;
import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.constant.DataRoomConstant;
import com.gccloud.gcpaas.core.constant.DatasetType;
import com.gccloud.gcpaas.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.core.dataset.bean.DatasetInputParam;
import com.gccloud.gcpaas.core.dataset.bean.EsDataset;
import com.gccloud.gcpaas.core.datasource.bean.EsDatasource;
import com.gccloud.gcpaas.core.datasource.service.DatasourceService;
import com.gccloud.gcpaas.core.entity.DataSourceEntity;
import com.gccloud.gcpaas.core.entity.DatasetEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.util.ParamUtils;
import com.gccloud.gcpaas.core.util.RsaUtils;
import com.gccloud.gcpaas.core.util.TypeUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service(value = DatasetType.ES_TYPE + DataRoomConstant.Dataset.SERVICE_NAME)
public class EsDatasetService extends AbstractDatasetService {

    @Resource
    private RestTemplate restTemplate;
    @Resource
    private DatasourceService datasourceService;
    @Resource
    private DataRoomConfig dataRoomConfig;

    @Override
    public DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        DatasetRunResponse datasetRunResponse = new DatasetRunResponse();
        EsDataset esDataset = (EsDataset) datasetEntity.getDataset();
        try {
            EsDatasource esDatasource = getEsDatasource(datasetEntity);
            Map<String, Object> params = buildParams(datasetRunRequest, datasetEntity);
            String requestPath = replaceParams(esDataset.getPath(), params);
            String body = replaceParams(esDataset.getBody(), params);
            String url = buildRequestUrl(esDatasource.getBaseUrl(), requestPath);
            HttpHeaders headers = buildHeaders(esDatasource);

            ResponseEntity<String> response = sendRequest(url, esDataset.getMethod(), body, headers);
            String respBody = response.getBody();
            if (!response.getStatusCode().is2xxSuccessful()) {
                log.error("ES数据集 {} 请求失败，状态码：{}, 响应: {}", datasetEntity.getName(), response.getStatusCode(), respBody);
                throw new DataRoomException("ES数据集" + datasetEntity.getName() + "执行失败");
            }

            Object data = parseResponseBody(respBody);
            if (StringUtils.isNotBlank(esDataset.getRespJsonPath())) {
                data = JSONPath.eval(data, esDataset.getRespJsonPath());
            }
            datasetRunResponse.setData(data);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            datasetRunResponse.setData(new ArrayList<>());
        }
        return datasetRunResponse;
    }

    private EsDatasource getEsDatasource(DatasetEntity datasetEntity) {
        String datasourceCode = datasetEntity.getDataSourceCode();
        if (StringUtils.isBlank(datasourceCode)) {
            throw new DataRoomException("请选择ES数据源");
        }
        DataSourceEntity dataSourceEntity = datasourceService.getByCode(datasourceCode);
        if (dataSourceEntity == null || !(dataSourceEntity.getDataSource() instanceof EsDatasource esDatasource)) {
            throw new DataRoomException("请选择ES数据源");
        }
        return esDatasource;
    }

    private Map<String, Object> buildParams(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity) {
        Map<String, Object> params = new HashMap<>();
        List<DatasetInputParam> inputParamList = datasetEntity.getInputList();
        Map<String, DatasetInputParam> inputParamMap = new HashMap<>();
        if (inputParamList != null) {
            for (DatasetInputParam inputParam : inputParamList) {
                inputParamMap.put(inputParam.getName(), inputParam);
                params.put(inputParam.getName(), TypeUtils.transType(inputParam.getDefaultVal(), inputParam.getType()));
            }
        }
        Map<String, Object> realInputParam = datasetRunRequest.getInputParam();
        if (realInputParam != null) {
            realInputParam.forEach((key, value) -> {
                DatasetInputParam defInputParam = inputParamMap.get(key);
                if (defInputParam != null) {
                    params.put(key, TypeUtils.transType(value, defInputParam.getType()));
                } else {
                    params.put(key, value);
                }
            });
        }
        params.putAll(getDefaultInputParam());
        return params;
    }

    private String replaceParams(String content, Map<String, Object> params) {
        String replaced = StringUtils.defaultString(content);
        for (Map.Entry<String, Object> entry : params.entrySet()) {
            if (entry.getValue() == null) {
                continue;
            }
            replaced = ParamUtils.replace(replaced, entry.getKey(), entry.getValue().toString());
        }
        return replaced;
    }

    private HttpHeaders buildHeaders(EsDatasource esDatasource) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        String authorizationHeader = buildAuthorizationHeader(
                esDatasource.getAuthType(),
                esDatasource.getUsername(),
                decryptSensitive(esDatasource.getPassword()),
                decryptSensitive(esDatasource.getBearerToken()),
                decryptSensitive(esDatasource.getApiKey())
        );
        if (StringUtils.isNotBlank(authorizationHeader)) {
            headers.set(HttpHeaders.AUTHORIZATION, authorizationHeader);
        }
        return headers;
    }

    private String decryptSensitive(String value) {
        if (StringUtils.isBlank(value)) {
            return value;
        }
        if (dataRoomConfig == null || StringUtils.isBlank(dataRoomConfig.getPrivateKey())) {
            return value;
        }
        String decrypted = RsaUtils.decryptByPrivateKey(value, dataRoomConfig.getPrivateKey());
        return decrypted == null ? value : decrypted;
    }

    private ResponseEntity<String> sendRequest(String url, String method, String body, HttpHeaders headers) {
        String requestMethod = StringUtils.defaultIfBlank(method, DataRoomConstant.Dataset.HTTP_DATASET.METHOD.POST)
                .trim()
                .toUpperCase(Locale.ROOT);
        if (DataRoomConstant.Dataset.HTTP_DATASET.METHOD.GET.equalsIgnoreCase(requestMethod)) {
            HttpEntity<Void> requestEntity = new HttpEntity<>(headers);
            return restTemplate.exchange(url, HttpMethod.GET, requestEntity, String.class);
        }
        if (DataRoomConstant.Dataset.HTTP_DATASET.METHOD.POST.equalsIgnoreCase(requestMethod)) {
            HttpEntity<String> requestEntity = new HttpEntity<>(body, headers);
            return restTemplate.exchange(url, HttpMethod.POST, requestEntity, String.class);
        }
        throw new DataRoomException("不支持的请求方法");
    }

    static String buildRequestUrl(String baseUrl, String path) {
        if (StringUtils.isBlank(baseUrl)) {
            throw new DataRoomException("ES基础地址不能为空");
        }
        if (StringUtils.isBlank(path)) {
            throw new DataRoomException("ES查询地址不能为空");
        }
        String normalizedBaseUrl = StringUtils.removeEnd(baseUrl.trim(), "/");
        String normalizedPath = path.trim();
        if (!normalizedPath.startsWith("/")) {
            normalizedPath = "/" + normalizedPath;
        }
        return normalizedBaseUrl + normalizedPath;
    }

    static String buildAuthorizationHeader(String authType, String username, String password, String bearerToken, String apiKey) {
        String normalizedAuthType = StringUtils.defaultIfBlank(authType, "none")
                .trim()
                .replace("-", "")
                .replace("_", "")
                .toLowerCase(Locale.ROOT);
        return switch (normalizedAuthType) {
            case "basic" -> buildBasicAuthorization(username, password);
            case "bearer" -> StringUtils.isBlank(bearerToken) ? null : "Bearer " + bearerToken;
            case "apikey" -> StringUtils.isBlank(apiKey) ? null : "ApiKey " + apiKey;
            default -> null;
        };
    }

    private static String buildBasicAuthorization(String username, String password) {
        if (StringUtils.isBlank(username) || StringUtils.isBlank(password)) {
            return null;
        }
        String credential = username + ":" + password;
        String encoded = Base64.getEncoder().encodeToString(credential.getBytes(StandardCharsets.UTF_8));
        return "Basic " + encoded;
    }

    static Object parseResponseBody(String body) {
        if (StringUtils.isBlank(body)) {
            return new ArrayList<>();
        }
        try {
            return JSON.parse(body);
        } catch (Exception ignored) {
            return parseCatTextBody(body);
        }
    }

    private static Object parseCatTextBody(String body) {
        String[] lines = body.strip().split("\\R");
        if (lines.length < 2) {
            return body;
        }
        String[] headers = lines[0].trim().split("\\s+");
        if (headers.length == 0) {
            return body;
        }
        List<Map<String, Object>> rows = new ArrayList<>();
        for (int i = 1; i < lines.length; i++) {
            String line = lines[i].trim();
            if (line.isEmpty()) {
                continue;
            }
            String[] values = line.split("\\s+");
            if (values.length < headers.length) {
                return body;
            }
            Map<String, Object> row = new LinkedHashMap<>();
            for (int j = 0; j < headers.length; j++) {
                if (j == headers.length - 1 && values.length > headers.length) {
                    row.put(headers[j], joinRemainingValues(values, j));
                } else {
                    row.put(headers[j], values[j]);
                }
            }
            rows.add(row);
        }
        return rows;
    }

    private static String joinRemainingValues(String[] values, int start) {
        StringBuilder builder = new StringBuilder();
        for (int i = start; i < values.length; i++) {
            if (i > start) {
                builder.append(' ');
            }
            builder.append(values[i]);
        }
        return builder.toString();
    }
}
