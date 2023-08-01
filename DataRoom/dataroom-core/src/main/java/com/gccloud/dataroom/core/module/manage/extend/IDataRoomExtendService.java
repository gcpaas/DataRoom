package com.gccloud.dataroom.core.module.manage.extend;

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
     * @param code
     */
    void deleteByCode(String code);

}
