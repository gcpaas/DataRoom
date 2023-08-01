package com.gccloud.dataroom.core.module.manage.extend;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

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

}
