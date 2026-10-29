package com.gccloud.gcpaas.dataroom.core.agent;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.gccloud.gcpaas.dataroom.core.entity.McpTokenEntity;
import com.gccloud.gcpaas.dataroom.core.entity.UserEntity;
import com.gccloud.gcpaas.dataroom.core.mapper.McpTokenMapper;
import com.gccloud.gcpaas.dataroom.core.mapper.UserMapper;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;

/**
 * 内置 MCP 令牌服务。Agent 通过本系统暴露的 MCP 端点（/dataRoom/mcp）调用页面工具，
 * 该端点要求 Bearer 令牌认证。启动时为固定账号生成/轮换一个内部令牌，
 * 明文只在内存中持有，用于注入 Agent 的 MCP 客户端请求头，不落盘、不对外暴露。
 */
@Slf4j
@Service
public class InternalMcpTokenService {

    private static final String TOKEN_PREFIX = "drmcp_";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Resource
    private McpTokenMapper mcpTokenMapper;
    @Resource
    private UserMapper userMapper;

    /**
     * 本次启动生效的令牌明文，仅内存持有
     */
    private volatile String rawToken;

    /**
     * 创建或轮换内置令牌。失败时记录日志并返回 false，不影响应用启动。
     *
     * @param account 令牌归属账号
     * @param tokenName 固定令牌名称
     * @return 是否可用
     */
    public synchronized boolean ensureInternalToken(String account, String tokenName) {
        try {
            UserEntity user = userMapper.selectOne(new LambdaQueryWrapper<UserEntity>()
                    .eq(UserEntity::getAccount, account)
                    .eq(UserEntity::getDelFlag, "0")
                    .last("limit 1"));
            if (user == null) {
                log.warn("内置MCP令牌初始化失败：账号 {} 不存在", account);
                return false;
            }
            byte[] bytes = new byte[32];
            SECURE_RANDOM.nextBytes(bytes);
            String newRawToken = TOKEN_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
            String newHash = hash(newRawToken);
            Date expireTime = Date.from(Instant.now().plus(100 * 365L, ChronoUnit.DAYS));

            int updated = mcpTokenMapper.update(null, new LambdaUpdateWrapper<McpTokenEntity>()
                    .eq(McpTokenEntity::getName, tokenName)
                    .eq(McpTokenEntity::getUserId, user.getId())
                    .set(McpTokenEntity::getTokenHash, newHash)
                    .set(McpTokenEntity::getTokenPrefix, newRawToken.substring(0, 14))
                    .set(McpTokenEntity::getExpireTime, expireTime)
                    .set(McpTokenEntity::getTenantCode, user.getTenantCode()));
            if (updated == 0) {
                McpTokenEntity entity = new McpTokenEntity();
                entity.setName(tokenName);
                entity.setUserId(user.getId());
                entity.setTenantCode(user.getTenantCode());
                entity.setTokenHash(newHash);
                entity.setTokenPrefix(newRawToken.substring(0, 14));
                entity.setExpireTime(expireTime);
                entity.setCreateDate(new Date());
                mcpTokenMapper.insert(entity);
            }
            this.rawToken = newRawToken;
            log.info("内置MCP令牌已就绪（归属账号：{}）", account);
            return true;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return false;
        }
    }

    /**
     * 获取本次启动的令牌明文；未初始化时返回 null
     */
    public String getRawToken() {
        return rawToken;
    }

    private String hash(String raw) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(raw.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new IllegalStateException("当前运行环境不支持SHA-256", e);
        }
    }
}
