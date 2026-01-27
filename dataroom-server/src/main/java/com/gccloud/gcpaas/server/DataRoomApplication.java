package com.gccloud.gcpaas.server;

import com.gccloud.gcpaas.core.bean.Rsa;
import com.gccloud.gcpaas.core.user.service.TokenService;
import com.gccloud.gcpaas.core.util.RsaUtils;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.crypto.SecretKey;
import java.util.Base64;

@Slf4j
@SpringBootApplication(scanBasePackages = "com.gccloud.gcpaas")
@MapperScan("com.gccloud.gcpaas.**")
public class DataRoomApplication {
    @Resource
    private TokenService tokenService;

    @PostConstruct
    public void init() {
        String token = tokenService.createToken("admin");
        log.info("模拟生成token: {}", token);
    }

    public static void main(String[] args) {
        // 生成一个安全的 256 位 HMAC 密钥
        SecretKey key = Keys.secretKeyFor(SignatureAlgorithm.HS256);
        String base64Key = Base64.getEncoder().encodeToString(key.getEncoded());
        Rsa rsa = RsaUtils.generateRsaKeyPair();
        log.info("------------以下信息可用于配置文件参考，每次启动随机生成-----------\n");
        log.info("Jwt密钥: {} \n", base64Key);
        log.info("公钥: {} \n", rsa.getPublicKey());
        log.info("私钥: {} \n", rsa.getPrivateKey());
        SpringApplication.run(DataRoomApplication.class, args);
    }
}
