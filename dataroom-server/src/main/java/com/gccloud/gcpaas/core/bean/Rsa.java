package com.gccloud.gcpaas.core.bean;

import lombok.Data;

@Data
public class Rsa {
    /**
     * 公钥
     */
    private String publicKey;
    /**
     * 私钥
     */
    private String privateKey;
}
