package com.gccloud.gcpaas.core.datasource.bean;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;

/**
 * 关系型数据库数据源，如：MySQL、Oracle、PG等
 */
@Data
@Schema(description = "关系型数据源")
public class RelationalDatasource extends BaseDataSource {

    @Schema(description = "驱动名称")
    private String driverName;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "数据源密码")
    private String password;

    @Schema(description = "数据库地址")
    private String url;

    @Override
    public void desensitize() {
        // 清空密码
        this.setPassword(null);
    }

    @Override
    public void updatedSensitive(BaseDataSource baseDataSource) {
        if (StringUtils.isBlank(password)) {
            RelationalDatasource db = (RelationalDatasource) baseDataSource;
            password = db.getPassword();
        }
    }
}
