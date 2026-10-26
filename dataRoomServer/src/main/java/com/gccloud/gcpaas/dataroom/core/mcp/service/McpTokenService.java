package com.gccloud.gcpaas.dataroom.core.mcp.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gccloud.gcpaas.dataroom.core.constant.UserStatus;
import com.gccloud.gcpaas.dataroom.core.entity.McpTokenEntity;
import com.gccloud.gcpaas.dataroom.core.entity.UserEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.McpTokenMapper;
import com.gccloud.gcpaas.dataroom.core.mapper.UserMapper;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.McpTokenAddDto;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.McpTokenCreatedVo;
import com.gccloud.gcpaas.dataroom.core.page.service.PageShareService;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import com.gccloud.gcpaas.dataroom.core.util.LoginUserUtils;
import jakarta.annotation.Resource;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.Objects;
import java.util.regex.Pattern;

@Slf4j
@Service
public class McpTokenService {

    public static final String TOKEN_PREFIX = "drmcp_";
    // 32字节的无填充base64url编码末位仅包含4个有效位。
    private static final Pattern TOKEN_PATTERN = Pattern.compile("drmcp_[A-Za-z0-9_-]{42}[AEIMQUYcgkosw048]");
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    @Resource
    private McpTokenMapper mcpTokenMapper;
    @Resource
    private UserMapper userMapper;

    public List<McpTokenEntity> list() {
        UserEntity user = requireLocalUser();
        return mcpTokenMapper.selectList(ownerQuery(user)
                .select(McpTokenEntity::getId, McpTokenEntity::getName, McpTokenEntity::getTokenPrefix,
                        McpTokenEntity::getExpireTime, McpTokenEntity::getCreateDate)
                .orderByDesc(McpTokenEntity::getCreateDate)
                .orderByDesc(McpTokenEntity::getId));
    }

    @Transactional(rollbackFor = Exception.class)
    public McpTokenCreatedVo add(McpTokenAddDto dto) {
        UserEntity user = requireLocalUser();
        if (dto == null || StringUtils.isBlank(dto.getName()) || dto.getName().trim().length() > 100) {
            throw new DataRoomException("令牌名称不能为空且不能超过100个字符");
        }
        Instant now = Instant.now();
        if (dto.getExpireTime() == null || !dto.getExpireTime().toInstant().isAfter(now)
                || dto.getExpireTime().getYear() > 9999) {
            throw new DataRoomException("有效期必须为未来的ISO日期时间");
        }
        byte[] bytes = new byte[32];
        SECURE_RANDOM.nextBytes(bytes);
        String rawToken = TOKEN_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
        McpTokenEntity entity = new McpTokenEntity();
        entity.setName(dto.getName().trim());
        entity.setUserId(user.getId());
        entity.setTenantCode(user.getTenantCode());
        entity.setTokenHash(hash(rawToken));
        entity.setTokenPrefix(rawToken.substring(0, 14));
        entity.setExpireTime(Date.from(dto.getExpireTime().toInstant()));
        entity.setCreateDate(Date.from(now));
        if (mcpTokenMapper.insert(entity) != 1) {
            throw new DataRoomException("令牌创建失败");
        }
        McpTokenCreatedVo result = new McpTokenCreatedVo();
        BeanUtils.copyProperties(entity, result, "tokenHash", "userId", "tenantCode", "delFlag");
        result.setToken(rawToken);
        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void delete(String id) {
        UserEntity user = requireLocalUser();
        if (StringUtils.isBlank(id) || mcpTokenMapper.delete(ownerQuery(user).eq(McpTokenEntity::getId, id)) != 1) {
            throw new DataRoomException("令牌不存在或不属于当前用户", 404);
        }
    }

    public LoginUser authenticate(String rawToken) {
        if (rawToken == null || !TOKEN_PATTERN.matcher(rawToken).matches()) {
            throw invalidToken();
        }
        Date now = new Date();
        McpTokenEntity token = mcpTokenMapper.selectOne(new LambdaQueryWrapper<McpTokenEntity>()
                .eq(McpTokenEntity::getTokenHash, hash(rawToken))
                .eq(McpTokenEntity::getDelFlag, "0")
                .gt(McpTokenEntity::getExpireTime, now));
        if (token == null || !"0".equals(token.getDelFlag()) || token.getExpireTime() == null
                || !token.getExpireTime().after(now) || StringUtils.isBlank(token.getUserId())) {
            throw invalidToken();
        }
        UserEntity user = userMapper.selectById(token.getUserId());
        if (!isActive(user, now) || !Objects.equals(token.getUserId(), user.getId())
                || !Objects.equals(token.getTenantCode(), user.getTenantCode())) {
            throw invalidToken();
        }
        LoginUser loginUser = new LoginUser();
        BeanUtils.copyProperties(user, loginUser);
        loginUser.setPassword(null);
        return loginUser;
    }

    private UserEntity requireLocalUser() {
        LoginUser principal = LoginUserUtils.getCurrentUser();
        if (principal == null || StringUtils.isBlank(principal.getId()) || StringUtils.isBlank(principal.getAccount())
                || (principal.getExtProps() != null
                && Boolean.TRUE.equals(principal.getExtProps().get(PageShareService.SHARE_EXT_FLAG)))) {
            throw new DataRoomException("仅允许本地登录用户管理个人令牌", 403);
        }
        UserEntity user = userMapper.selectById(principal.getId());
        if (!isActive(user, new Date()) || !Objects.equals(principal.getId(), user.getId())
                || !Objects.equals(principal.getAccount(), user.getAccount())
                || !Objects.equals(principal.getTenantCode(), user.getTenantCode())) {
            throw new DataRoomException("当前身份与本地用户不一致或用户已失效", 403);
        }
        return user;
    }

    private boolean isActive(UserEntity user, Date now) {
        return user != null && StringUtils.isNotBlank(user.getId()) && "0".equals(user.getDelFlag())
                && user.getStatus() == UserStatus.NORMAL
                && (user.getExpireDate() == null || user.getExpireDate().after(now));
    }

    private LambdaQueryWrapper<McpTokenEntity> ownerQuery(UserEntity user) {
        LambdaQueryWrapper<McpTokenEntity> query = new LambdaQueryWrapper<McpTokenEntity>()
                .eq(McpTokenEntity::getUserId, user.getId())
                .eq(McpTokenEntity::getDelFlag, "0");
        return user.getTenantCode() == null
                ? query.isNull(McpTokenEntity::getTenantCode)
                : query.eq(McpTokenEntity::getTenantCode, user.getTenantCode());
    }

    private String hash(String rawToken) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                    .digest(rawToken.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            throw new IllegalStateException("当前运行环境不支持SHA-256", e);
        }
    }

    private DataRoomException invalidToken() {
        return new DataRoomException("MCP令牌无效或已过期", 401);
    }
}
