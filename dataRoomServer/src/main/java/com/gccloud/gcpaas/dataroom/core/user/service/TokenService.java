package com.gccloud.gcpaas.dataroom.core.user.service;

import com.baomidou.mybatisplus.core.toolkit.IdWorker;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.config.bean.Jwt;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Service
public class TokenService {

    @Resource
    private DataRoomConfig dataRoomConfig;

    /**
     * 生成指定用户的token
     *
     * @param username
     * @return
     */
    public String createToken(String username) {
        Jwt jwtConfig = dataRoomConfig.getJwt();
        Map<String, Object> claims = new HashMap<>(16);
        claims.put("account", username);
        JwtBuilder builder = Jwts.builder().signWith(SignatureAlgorithm.forName(jwtConfig.getAlg()), jwtConfig.getSecret()).setClaims(claims).setIssuer(jwtConfig.getIssuer()).setIssuedAt(new Date()).setExpiration(new Date(System.currentTimeMillis() + jwtConfig.getExpiration() * 1000L));
        String id = IdWorker.getIdStr();
        builder.setId(id);
        return builder.compact();
    }
}
