package com.gccloud.dataroom.core.module.manage.extend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/8/1 15:10
 */
@Component
public class DataRoomExtendClient {

    @Autowired(required = false)
    private IDataRoomExtendService extendService;


    /**
     * 删除大屏后的扩展方法
     * @param code
     */
    public void deleteByCode(String code) {
        if (extendService != null) {
            extendService.deleteByCode(code);
        }
    }

    /**
     * 根据权限过滤
     * @param allCode 全部的大屏id
     * @return 当前用户有权限的大屏id
     */
    public List<String> filterByPermission(List<String> allCode) {
        if (extendService != null) {
            return extendService.filterByPermission(allCode);
        }
        return allCode;
    }

    /**
     * 大屏新增后的权限处理
     * @param code 新增的大屏id
     */
    public void afterAdd(String code) {
        if (extendService != null) {
            extendService.afterAdd(code);
        }
    }

    /**
     * 大屏删除后的权限处理
     * @param code 删除的大屏id
     */
    public void afterDelete(String code) {
        if (extendService != null) {
            extendService.afterDelete(code);
        }
    }


}
