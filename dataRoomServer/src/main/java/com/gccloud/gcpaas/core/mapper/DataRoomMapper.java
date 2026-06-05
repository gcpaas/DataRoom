package com.gccloud.gcpaas.core.mapper;


import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.mapper.BaseMapper;

public interface DataRoomMapper<T> extends BaseMapper<T> {

    default T getByCode(String code) {
        QueryWrapper<T> queryWrapper = new QueryWrapper<T>();
        queryWrapper.eq("code", code);
        return selectOne(queryWrapper, false);
    }

    default int deleteByCode(String code) {
        QueryWrapper<T> queryWrapper = new QueryWrapper<T>();
        queryWrapper.eq("code", code);
        return delete(queryWrapper);
    }
}
