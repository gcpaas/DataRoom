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

/**
 * 用户服务
 */
@Slf4j
@Service
public class UserService extends ServiceImpl<UserMapper, UserEntity> {

    /**
     * 分页查询用户
     */
    public PageVo<UserEntity> page(UserQueryDTO queryDTO) {
        Page<UserEntity> page = new Page<>(queryDTO.getCurrent(), queryDTO.getSize());
        LambdaQueryWrapper<UserEntity> queryWrapper = new LambdaQueryWrapper<>();
        if (StringUtils.isNotBlank(queryDTO.getAccount())) {
            queryWrapper.like(UserEntity::getAccount, queryDTO.getAccount());
        }
        if (StringUtils.isNotBlank(queryDTO.getUsername())) {
            queryWrapper.like(UserEntity::getUsername, queryDTO.getUsername());
        }
        if (queryDTO.getStatus() != null) {
            queryWrapper.eq(UserEntity::getStatus, queryDTO.getStatus());
        }
        queryWrapper.orderByDesc(UserEntity::getCreateDate);
        Page<UserEntity> result = this.page(page, queryWrapper);
        return PageVo.build(result);
    }

    /**
     * 根据ID获取用户详情
     */
    public UserEntity getUserById(String id) {
        UserEntity user = this.getById(id);
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
            user.setStatus(dto.getStatus());
        }
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
}