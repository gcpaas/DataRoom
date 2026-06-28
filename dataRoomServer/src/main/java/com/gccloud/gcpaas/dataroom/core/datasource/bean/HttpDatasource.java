package com.gccloud.gcpaas.dataroom.core.datasource.bean;

import com.gccloud.gcpaas.dataroom.core.bean.KeyVal;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Data
@Schema(description = "HTTP数据源")
public class HttpDatasource extends BaseDataSource {

    @Schema(description = "HTTP基础访问地址")
    private String baseUrl;

    @Schema(description = "公共请求头")
    private List<KeyVal> headerList;

    public void validate() {
        if (StringUtils.isBlank(baseUrl)) {
            throw new DataRoomException("HTTP基础访问地址不能为空");
        }
        String normalized = baseUrl.trim().toLowerCase(Locale.ROOT);
        if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
            throw new DataRoomException("HTTP基础访问地址必须以http://或https://开头");
        }
    }

    @Override
    public void desensitize() {
        if (headerList == null) {
            return;
        }
        for (KeyVal header : headerList) {
            if (header == null || !Boolean.TRUE.equals(header.getEncrypted()) || StringUtils.isBlank(header.getVal())) {
                continue;
            }
            header.setVal("******");
        }
    }

    @Override
    public void updatedSensitive(BaseDataSource baseDataSource) {
        if (!(baseDataSource instanceof HttpDatasource db) || headerList == null) {
            return;
        }
        Map<String, KeyVal> oldHeaders = safeHeaders(db.getHeaderList()).stream()
                .filter(header -> StringUtils.isNotBlank(header.getKey()))
                .collect(Collectors.toMap(
                        header -> normalizeHeaderKey(header.getKey()),
                        Function.identity(),
                        (first, second) -> second
                ));
        for (KeyVal header : headerList) {
            if (header == null || !Boolean.TRUE.equals(header.getEncrypted()) || StringUtils.isBlank(header.getKey())) {
                continue;
            }
            if (StringUtils.isNotBlank(header.getVal()) && !"******".equals(header.getVal())) {
                continue;
            }
            KeyVal oldHeader = oldHeaders.get(normalizeHeaderKey(header.getKey()));
            if (oldHeader != null) {
                header.setVal(oldHeader.getVal());
            }
        }
    }

    private static List<KeyVal> safeHeaders(List<KeyVal> headers) {
        return headers == null ? new ArrayList<>() : headers;
    }

    private static String normalizeHeaderKey(String key) {
        return key.trim().toLowerCase(Locale.ROOT);
    }
}
