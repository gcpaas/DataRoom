package com.gccloud.dataroom.core.config.bean;

import com.gccloud.dataroom.core.constant.DataRoomConst;
import lombok.Data;

/**
 * @author chen.hu
 * @date 2025/5/7 9:38
 */
@Data
public class Jwt {
    /**
     * 颁发jwt者
     */
    public String issuer;
    /**
     * 密钥
     */
    public String secret;
    /**
     * 签名算法
     */
    public String alg;
    /**
     * jwt时效（单位为秒）
     */
    public Integer expiration = 7200;
    /**
     * 默认为无状态存储
     */
    public DataRoomConst.Jwt.StoreStrategy storeStrategy = DataRoomConst.Jwt.StoreStrategy.NONE;

    /**
     * tokenKey
     */
    public String tokenKey = "token";
}
