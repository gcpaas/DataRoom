package com.gccloud.gcpaas.core.config.bean;

import io.jsonwebtoken.SignatureAlgorithm;
import lombok.Data;

@Data
public class Jwt {
    /**
     * 颁发jwt者
     */
    private String issuer = "dataRoom";
    /**
     * 密钥
     */
    private String secret = "8cgZ3e8BGbj+GDyZW2vs4A5/qmDfshHLEm6FrciK3eI=";
    /**
     * 签名算法
     */
    private String alg = SignatureAlgorithm.HS256.getValue();
    /**
     * jwt时效（单位为秒）
     */
    private Long expiration = 36000L;
    /**
     * tokenKey
     */
    private String tokenKey = "dataRoomToken";
}
