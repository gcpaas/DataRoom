package com.gccloud.gcpaas.dataroom.core.mapper;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.gccloud.gcpaas.dataroom.core.entity.PageShareEntity;

public interface PageShareMapper extends DataRoomMapper<PageShareEntity> {

    default PageShareEntity getByPageCode(String pageCode) {
        LambdaQueryWrapper<PageShareEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageShareEntity::getPageCode, pageCode);
        return selectOne(queryWrapper, false);
    }

    default PageShareEntity getByToken(String token) {
        LambdaQueryWrapper<PageShareEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageShareEntity::getToken, token);
        return selectOne(queryWrapper, false);
    }

    default int deleteByPageCode(String pageCode) {
        LambdaQueryWrapper<PageShareEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PageShareEntity::getPageCode, pageCode);
        return delete(queryWrapper);
    }
}
