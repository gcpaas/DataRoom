package com.gccloud.gcpaas.core.user.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.gcpaas.core.bean.PageVo;
import com.gccloud.gcpaas.core.constant.UserStatus;
import com.gccloud.gcpaas.core.entity.UserEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.mapper.UserMapper;
import com.gccloud.gcpaas.core.user.dto.UserDTO;
import com.gccloud.gcpaas.core.user.dto.UserQueryDTO;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.Date;
import java.util.concurrent.TimeUnit;

/**
 * 用户服务
 */
@Slf4j
@Service
public class UserService extends ServiceImpl<UserMapper, UserEntity> {

    private static final int LOGIN_LOCK_THRESHOLD = 3;
    private static final long LOGIN_LOCK_DURATION_MILLIS = TimeUnit.MINUTES.toMillis(10);

    public static boolean isExpired(UserEntity user) {
        if (user == null || user.getExpireDate() == null) {
            return false;
        }
        return !user.getExpireDate().after(new Date());
    }

    /**
     * 分页查询用户
     */
    public PageVo<UserEntity> page(UserQueryDTO queryDTO) {
        Page<UserEntity> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        LambdaQueryWrapper<UserEntity> queryWrapper = new LambdaQueryWrapper<>();
        // 关键字同时匹配账号和用户名
        if (StringUtils.isNotBlank(queryDTO.getKeyword())) {
            queryWrapper.and(w -> w.like(UserEntity::getAccount, queryDTO.getKeyword())
                    .or().like(UserEntity::getUsername, queryDTO.getKeyword()));
        }
        if (queryDTO.getStatus() != null) {
            queryWrapper.eq(UserEntity::getStatus, queryDTO.getStatus());
        }
        queryWrapper.orderByDesc(UserEntity::getCreateDate);
        // 不查询 password 字段
        queryWrapper.select(UserEntity.class, info -> !"password".equals(info.getColumn()));
        Page<UserEntity> result = this.page(page, queryWrapper);
        return PageVo.build(result);
    }

    /**
     * 根据ID获取用户详情
     */
    public UserEntity getUserById(String id) {
        LambdaQueryWrapper<UserEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(UserEntity::getId, id);
        // 不查询 password 字段
        queryWrapper.select(UserEntity.class, info -> !"password".equals(info.getColumn()));
        UserEntity user = this.getOne(queryWrapper, false);
        if (user == null) {
            throw new DataRoomException("用户不存在");
        }
        return user;
    }

    /**
     * 新增用户
     */
    public void add(UserDTO dto) {
        // 校验账号唯一性
        LambdaQueryWrapper<UserEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserEntity::getAccount, dto.getAccount());
        if (this.count(wrapper) > 0) {
            throw new DataRoomException("账号已存在");
        }
        UserEntity user = new UserEntity();
        user.setAccount(dto.getAccount());
        user.setUsername(dto.getUsername());
        user.setPassword(dto.getPassword());
        user.setPhone(dto.getPhone());
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : UserStatus.NORMAL);
        user.setLoginFailCount(0);
        user.setExpireDate(dto.getExpireDate());
        this.save(user);
    }

    /**
     * 更新用户
     */
    public void update(UserDTO dto) {
        Assert.isTrue(StringUtils.isNotBlank(dto.getId()), "用户ID不能为空");
        UserEntity user = this.getById(dto.getId());
        if (user == null) {
            throw new DataRoomException("用户不存在");
        }
        // 校验账号唯一性（排除自身）
        if (StringUtils.isNotBlank(dto.getAccount()) && !dto.getAccount().equals(user.getAccount())) {
            LambdaQueryWrapper<UserEntity> wrapper = new LambdaQueryWrapper<>();
            wrapper.eq(UserEntity::getAccount, dto.getAccount());
            if (this.count(wrapper) > 0) {
                throw new DataRoomException("账号已存在");
            }
            user.setAccount(dto.getAccount());
        }
        if (StringUtils.isNotBlank(dto.getUsername())) {
            user.setUsername(dto.getUsername());
        }
        if (StringUtils.isNotBlank(dto.getPassword())) {
            user.setPassword(dto.getPassword());
        }
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone());
        }
        if (StringUtils.isNotBlank(dto.getRole())) {
            user.setRole(dto.getRole());
        }
        if (dto.getStatus() != null) {
            applyStatusUpdate(user, dto.getStatus());
        }
        user.setExpireDate(dto.getExpireDate());
        this.updateById(user);
    }

    /**
     * 删除用户
     */
    public void delete(String id) {
        UserEntity user = this.getById(id);
        if (user == null) {
            throw new DataRoomException("用户不存在");
        }
        this.removeById(id);
    }

    /**
     * 根据账号查询用户信息（用于登录）
     */
    public UserEntity getByAccount(String account) {
        LambdaQueryWrapper<UserEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(UserEntity::getAccount, account);
        return this.getOne(wrapper, false);
    }

    /**
     * 判断登录锁定是否仍在生效。
     */
    public boolean isLoginLockActive(UserEntity user) {
        return user != null
                && user.getStatus() == UserStatus.LOCKED
                && user.getLoginLockedUntil() != null
                && user.getLoginLockedUntil().after(now());
    }

    /**
     * 记录一次登录密码错误。
     */
    public void recordLoginFailure(UserEntity user) {
        if (user == null) {
            return;
        }
        if (user.getStatus() == UserStatus.LOCKED) {
            lockUser(user, now());
            this.updateById(user);
            return;
        }
        int nextFailCount = defaultFailCount(user) + 1;
        user.setLoginFailCount(nextFailCount);
        if (nextFailCount >= LOGIN_LOCK_THRESHOLD) {
            lockUser(user, now());
        }
        this.updateById(user);
    }

    /**
     * 记录一次登录密码正确。
     */
    public void recordLoginSuccess(UserEntity user) {
        if (user == null || !hasLoginFailureState(user)) {
            return;
        }
        clearLoginLock(user);
        this.updateById(user);
    }

    /**
     * 管理端解锁用户。
     */
    public void unlock(String id) {
        Assert.isTrue(StringUtils.isNotBlank(id), "用户ID不能为空");
        UserEntity user = this.getById(id);
        if (user == null) {
            throw new DataRoomException("用户不存在");
        }
        if (user.getStatus() != UserStatus.LOCKED) {
            throw new DataRoomException("只有锁定用户才能解锁");
        }
        clearLoginLock(user);
        this.updateById(user);
    }

    /**
     * 更新当前用户个人信息（仅允许修改用户名和密码）
     */
    public void updateProfile(String account, String username, String password) {
        UserEntity user = getByAccount(account);
        if (user == null) {
            throw new DataRoomException("用户不存在");
        }
        if (StringUtils.isNotBlank(username)) {
            user.setUsername(username);
        }
        if (StringUtils.isNotBlank(password)) {
            user.setPassword(password);
        }
        this.updateById(user);
    }

    protected Date now() {
        return new Date();
    }

    private void applyStatusUpdate(UserEntity user, UserStatus nextStatus) {
        UserStatus currentStatus = user.getStatus();
        if (nextStatus == UserStatus.LOCKED && currentStatus != UserStatus.LOCKED) {
            throw new DataRoomException("锁定状态只能由登录安全策略触发");
        }
        if (nextStatus == UserStatus.NORMAL && currentStatus != UserStatus.NORMAL && currentStatus != UserStatus.LOCKED) {
            throw new DataRoomException("只有锁定用户才能恢复为正常状态");
        }
        if (nextStatus == UserStatus.NORMAL && currentStatus == UserStatus.LOCKED) {
            clearLoginLock(user);
            return;
        }
        user.setStatus(nextStatus);
        if (currentStatus == UserStatus.LOCKED && nextStatus != UserStatus.LOCKED) {
            clearLoginFailureState(user);
        }
    }

    private void lockUser(UserEntity user, Date currentTime) {
        user.setStatus(UserStatus.LOCKED);
        user.setLoginFailCount(LOGIN_LOCK_THRESHOLD);
        user.setLoginLockedUntil(new Date(currentTime.getTime() + LOGIN_LOCK_DURATION_MILLIS));
    }

    private void clearLoginLock(UserEntity user) {
        user.setStatus(UserStatus.NORMAL);
        clearLoginFailureState(user);
    }

    private void clearLoginFailureState(UserEntity user) {
        user.setLoginFailCount(0);
        user.setLoginLockedUntil(null);
    }

    private int defaultFailCount(UserEntity user) {
        return user.getLoginFailCount() == null ? 0 : user.getLoginFailCount();
    }

    private boolean hasLoginFailureState(UserEntity user) {
        return user.getStatus() == UserStatus.LOCKED
                || defaultFailCount(user) > 0
                || user.getLoginLockedUntil() != null;
    }
}
