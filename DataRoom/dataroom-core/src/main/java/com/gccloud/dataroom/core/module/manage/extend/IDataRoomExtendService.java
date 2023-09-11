package com.gccloud.dataroom.core.module.manage.extend;

import java.util.List;

/**
 * 大屏扩展接口
 * @author hongyang
 * @version 1.0
 * @date 2023/8/1 15:10
 */
public interface IDataRoomExtendService {

    /**
     * 大屏删除拓展
     * 会在大屏删除后调用
     * 已废弃，请使用afterDelete方法
     * @param code
     */
    @Deprecated
    default void deleteByCode(String code) {}

    /**
     * 大屏新增后的处理, 可在此处处理权限等
     * @param code 新增的大屏code
     */
    default void afterAdd(String code) {}

    /**
     * 大屏删除后的处理, 可在此处处理权限等
     * @param code 删除的大屏code
     */
    default void afterDelete(String code) {}

}
