package com.gccloud.gcpaas.core.config;

import com.baomidou.mybatisplus.core.handlers.MetaObjectHandler;
import com.gccloud.gcpaas.core.shiro.LoginUser;
import com.gccloud.gcpaas.core.util.LoginUserUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.ibatis.reflection.MetaObject;
import org.springframework.stereotype.Service;

import java.util.Date;


@Slf4j
@Service
public class MybatisMetaObjectHandler implements MetaObjectHandler {

    @Override
    public void insertFill(MetaObject metaObject) {
        LoginUser user = LoginUserUtils.getCurrentUser();
        final String CREATE_USER = "createUser";
        if (metaObject.hasGetter(CREATE_USER)) {
            Object createUserValue = metaObject.getValue(CREATE_USER);
            if (createUserValue == null) {
                createUserValue = user == null ? "" : user.getUsername();
                metaObject.setValue(CREATE_USER, createUserValue);
            }
        }
        final String CREATE_DATE = "createDate";
        if (metaObject.hasGetter(CREATE_DATE)) {
            Object createDateValue = metaObject.getValue(CREATE_DATE);
            if (createDateValue == null) {
                metaObject.setValue(CREATE_DATE, new Date());
            }
        }
        final String TENANT_CODE = "tenantCode";
        if (metaObject.hasGetter(TENANT_CODE)) {
            Object tenantCodeValue = metaObject.getValue(TENANT_CODE);
            if (tenantCodeValue == null) {
                String tenantCode = user == null ? "default" : user.getTenantCode();
                metaObject.setValue(TENANT_CODE, tenantCode);
            }
        }
        final String UPDATE_USER = "updateUser";
        if (metaObject.hasGetter(UPDATE_USER)) {
            Object updateByValue = metaObject.getValue(UPDATE_USER);
            if (updateByValue == null) {
                String updateBy = user == null ? "" : user.getUsername();
                metaObject.setValue(UPDATE_USER, updateBy);
            }
        }
        final String UPDATE_DATE = "updateDate";
        if (metaObject.hasGetter(UPDATE_DATE)) {
            Object updateDateValue = metaObject.getValue(UPDATE_DATE);
            if (updateDateValue == null) {
                metaObject.setValue(UPDATE_DATE, new Date());
            }
        }
    }

    @Override
    public void updateFill(MetaObject metaObject) {
        LoginUser user = LoginUserUtils.getCurrentUser();
        final String UPDATE_USER = "updateUser";
        if (metaObject.hasGetter(UPDATE_USER)) {
            Object updateByValue = metaObject.getValue(UPDATE_USER);
            if (updateByValue == null) {
                String updateBy = user == null ? "" : user.getUsername();
                metaObject.setValue(UPDATE_USER, updateBy);
            }
        }
        final String UPDATE_DATE = "updateDate";
        if (metaObject.hasGetter(UPDATE_DATE)) {
            Object updateDateValue = metaObject.getValue(UPDATE_DATE);
            if (updateDateValue == null) {
                metaObject.setValue(UPDATE_DATE, new Date());
            }
        }
    }
}
