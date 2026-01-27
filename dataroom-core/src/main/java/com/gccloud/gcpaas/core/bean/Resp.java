package com.gccloud.gcpaas.core.bean;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

/**
 * 响应封装
 *
 * @param <T>
 */
@Data
@Schema(description = "响应")
public class Resp<T> {
    /**
     * 状态码
     */
    @Schema(description = "状态码，200:成功，401:未登录,500:服务异常")
    private Integer code = 500;
    /**
     * 异常提示信息
     */
    @Schema(description = "异常信息")
    private String message;
    /**
     * 数据
     */
    @Schema(description = "数据")
    private T data;

    /**
     * 成功
     *
     * @param data
     * @param <T>
     * @return
     */
    public static <T> Resp<T> success(T data) {
        Resp<T> resp = new Resp<>();
        resp.setCode(200);
        resp.setData(data);
        return resp;
    }

    /**
     * 异常
     *
     * @param code
     * @param message
     * @param <T>
     * @return
     */
    public static <T> Resp<T> error(Integer code, String message) {
        Resp<T> resp = new Resp<>();
        resp.setCode(code);
        resp.setMessage(message);
        return resp;
    }

    /**
     * 异常
     *
     * @param message
     * @param <T>
     * @return
     */
    public static <T> Resp<T> error(String message) {
        return error(500, message);
    }

    public static <T> Resp<T> authError() {
        return error(401, "未登录或token已过期或认证异常");
    }
}
