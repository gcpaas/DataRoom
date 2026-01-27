package com.gccloud.gcpaas.core.dataset.service;


import com.gccloud.gcpaas.core.dataset.DatasetRunRequest;
import com.gccloud.gcpaas.core.dataset.DatasetRunResponse;
import com.gccloud.gcpaas.core.entity.DatasetEntity;
import com.gccloud.gcpaas.core.shiro.LoginUser;
import com.gccloud.gcpaas.core.util.LoginUserUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;

@Slf4j
public abstract class AbstractDatasetService {

    /**
     * 数据集运行
     *
     * @param datasetRunRequest
     * @param datasetEntity
     * @return
     */
    public abstract DatasetRunResponse run(DatasetRunRequest datasetRunRequest, DatasetEntity datasetEntity);

    /**
     * 获取系统内置的数据集入参、可让数据集支持分权分域
     *
     * @return
     */
    public Map<String, Object> getDefaultInputParam() {
        LoginUser currentUser = LoginUserUtils.getCurrentUser();
        // 利用反射获取用户信息字段以及对应的值（包括父类字段）
        Map<String, Object> defaultInputParam = new HashMap<>();
        Class<?> clazz = currentUser.getClass();
        // 递归获取当前类及所有父类的字段
        while (clazz != null && clazz != Object.class) {
            for (Field field : clazz.getDeclaredFields()) {
                field.setAccessible(true);
                try {
                    Object value = field.get(currentUser);
                    defaultInputParam.put("user." + field.getName(), value);
                } catch (Exception e) {
                    log.error(ExceptionUtils.getStackTrace(e));
                }
            }
            clazz = clazz.getSuperclass();
        }
        Map<String, Object> extProps = currentUser.getExtProps();
        if (extProps != null) {
            extProps.forEach((key, value) -> {
                defaultInputParam.put("user." + key, value);
            });
        }
        defaultInputParam.remove("user.extProps");
        defaultInputParam.remove("user.password");
        return defaultInputParam;
    }

}