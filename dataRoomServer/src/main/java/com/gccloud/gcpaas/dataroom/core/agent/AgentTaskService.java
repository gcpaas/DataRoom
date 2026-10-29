package com.gccloud.gcpaas.dataroom.core.agent;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.gcpaas.dataroom.core.entity.AgentTaskEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.AgentTaskMapper;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import com.gccloud.gcpaas.dataroom.core.util.LoginUserUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Agent 对话任务服务。任务归属当前登录用户（按 createUser 隔离）。
 */
@Service
public class AgentTaskService extends ServiceImpl<AgentTaskMapper, AgentTaskEntity> {

    /**
     * 当前用户的任务列表，按更新时间倒序。不返回对话记录正文。
     */
    public List<AgentTaskEntity> listByCurrentUser() {
        return list(new LambdaQueryWrapper<AgentTaskEntity>()
                .select(AgentTaskEntity.class, field -> !"transcript".equals(field.getColumn()))
                .eq(AgentTaskEntity::getCreateUser, currentAccount())
                .orderByDesc(AgentTaskEntity::getUpdateDate));
    }

    /**
     * 新建任务
     */
    public AgentTaskEntity createTask(String threadId, String title) {
        if (StringUtils.isBlank(threadId)) {
            throw new DataRoomException("threadId不能为空");
        }
        AgentTaskEntity entity = new AgentTaskEntity();
        entity.setThreadId(threadId.trim());
        entity.setTitle(StringUtils.defaultIfBlank(title, "新任务").trim());
        save(entity);
        return entity;
    }

    /**
     * 查询当前用户的任务详情（含对话记录）
     */
    public AgentTaskEntity getOwnedByThreadId(String threadId) {
        if (StringUtils.isBlank(threadId)) {
            throw new DataRoomException("threadId不能为空");
        }
        AgentTaskEntity entity = getOne(new LambdaQueryWrapper<AgentTaskEntity>()
                .eq(AgentTaskEntity::getThreadId, threadId.trim())
                .eq(AgentTaskEntity::getCreateUser, currentAccount())
                .last("limit 1"));
        if (entity == null) {
            throw new DataRoomException("任务不存在或不属于当前用户", 404);
        }
        return entity;
    }

    /**
     * 保存任务元信息与对话记录（整段覆盖）
     */
    public void saveTranscript(AgentTaskEntity dto) {
        AgentTaskEntity owned = getOwnedByThreadId(dto.getThreadId());
        LambdaUpdateWrapper<AgentTaskEntity> updateWrapper = new LambdaUpdateWrapper<>();
        updateWrapper.eq(AgentTaskEntity::getId, owned.getId());
        if (StringUtils.isNotBlank(dto.getTitle())) {
            updateWrapper.set(AgentTaskEntity::getTitle, dto.getTitle().trim());
        }
        updateWrapper.set(StringUtils.isNotBlank(dto.getTranscript()),
                AgentTaskEntity::getTranscript, dto.getTranscript());
        update(updateWrapper);
    }

    /**
     * 重命名
     */
    public void rename(String threadId, String title) {
        if (StringUtils.isBlank(title) || title.trim().length() > 100) {
            throw new DataRoomException("任务标题不能为空且不能超过100个字符");
        }
        AgentTaskEntity owned = getOwnedByThreadId(threadId);
        update(new LambdaUpdateWrapper<AgentTaskEntity>()
                .eq(AgentTaskEntity::getId, owned.getId())
                .set(AgentTaskEntity::getTitle, title.trim()));
    }

    /**
     * 删除（逻辑删除）
     */
    public void deleteByThreadId(String threadId) {
        AgentTaskEntity owned = getOwnedByThreadId(threadId);
        removeById(owned.getId());
    }

    private String currentAccount() {
        LoginUser user = LoginUserUtils.getCurrentUser();
        if (user == null || StringUtils.isBlank(user.getAccount())) {
            throw new DataRoomException("未登录或登录已过期", 401);
        }
        return user.getAccount();
    }
}
