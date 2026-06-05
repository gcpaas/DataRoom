package com.gccloud.gcpaas.core.datasource.bean;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;

/**
 * Elasticsearch API 数据源
 */
@Data
@Schema(description = "Elasticsearch API数据源")
public class EsDatasource extends BaseDataSource {

    @Schema(description = "ES基础地址")
    private String baseUrl;

    @Schema(description = "认证方式，none/basic/bearer/apiKey")
    private String authType;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "密码")
    private String password;

    @Schema(description = "Bearer Token")
    private String bearerToken;

    @Schema(description = "API Key")
    private String apiKey;

    @Override
    public void desensitize() {
        this.setPassword(null);
        this.setBearerToken(null);
        this.setApiKey(null);
    }

    @Override
    public void updatedSensitive(BaseDataSource baseDataSource) {
        if (!(baseDataSource instanceof EsDatasource db)) {
            return;
        }
        if (StringUtils.isBlank(password)) {
            password = db.getPassword();
        }
        if (StringUtils.isBlank(bearerToken)) {
            bearerToken = db.getBearerToken();
        }
        if (StringUtils.isBlank(apiKey)) {
            apiKey = db.getApiKey();
        }
    }
}
