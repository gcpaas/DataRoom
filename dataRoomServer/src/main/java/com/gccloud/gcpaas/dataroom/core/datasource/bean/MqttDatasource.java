package com.gccloud.gcpaas.dataroom.core.datasource.bean;

import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;
import org.apache.commons.lang3.StringUtils;

import java.util.Set;

@Data
@Schema(description = "MQTT数据源")
public class MqttDatasource extends BaseDataSource {

    private static final Set<String> VALID_AUTH_MODES = Set.of("none", "usernamePassword");
    private static final Set<String> VALID_PROTOCOLS = Set.of("tcp", "tls", "ws", "wss");

    @Schema(description = "连接协议: tcp, tls, ws, wss")
    private String protocol = "tcp";

    @Schema(description = "MQTT服务地址")
    private String host;

    @Schema(description = "MQTT服务端口")
    private Integer port;

    @Schema(description = "客户端标识")
    private String clientId;

    @Schema(description = "CA证书，TLS协议下可选")
    private String caCertificate;

    @Schema(description = "WebSocket访问路径，ws/wss协议下使用")
    private String path;

    @Schema(description = "认证方式: none, usernamePassword")
    private String authMode;

    @Schema(description = "用户名")
    private String username;

    @Schema(description = "密码")
    private String password;

    @Schema(description = "默认主题")
    private String defaultTopic;

    @Schema(description = "连接超时时间(秒)")
    private Integer connectionTimeoutSeconds;

    public void validate(boolean isCreate) {
        if (StringUtils.isNotBlank(protocol) && !VALID_PROTOCOLS.contains(protocol)) {
            throw new DataRoomException("连接协议无效，可选值: tcp, tls, ws, wss");
        }
        if (StringUtils.isBlank(host)) {
            throw new DataRoomException("MQTT服务地址不能为空");
        }
        if (port == null || port <= 0 || port > 65535) {
            throw new DataRoomException("MQTT服务端口无效");
        }
        if (StringUtils.isBlank(authMode) || !VALID_AUTH_MODES.contains(authMode)) {
            throw new DataRoomException("认证方式无效，可选值: none, usernamePassword");
        }
        if ("usernamePassword".equals(authMode)) {
            if (isCreate && StringUtils.isBlank(username)) {
                throw new DataRoomException("账号密码认证模式下用户名不能为空");
            }
            if (isCreate && StringUtils.isBlank(password)) {
                throw new DataRoomException("账号密码认证模式下密码不能为空");
            }
        }
    }

    @Override
    public void desensitize() {
        this.password = StringUtils.isNotBlank(this.password) ? "******" : null;
        this.caCertificate = StringUtils.isNotBlank(this.caCertificate) ? "******" : null;
    }

    @Override
    public void updatedSensitive(BaseDataSource baseDataSource) {
        if (!(baseDataSource instanceof MqttDatasource db)) {
            return;
        }
        if (StringUtils.isBlank(password) || "******".equals(password)) {
            password = db.getPassword();
        }
        if (StringUtils.isBlank(caCertificate) || "******".equals(caCertificate)) {
            caCertificate = db.getCaCertificate();
        }
    }
}
