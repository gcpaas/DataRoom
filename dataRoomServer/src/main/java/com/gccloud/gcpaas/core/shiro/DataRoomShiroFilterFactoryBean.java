package com.gccloud.gcpaas.core.shiro;

import jakarta.servlet.Filter;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.filter.InvalidRequestFilter;
import org.apache.shiro.web.filter.mgt.DefaultFilter;
import org.apache.shiro.web.filter.mgt.FilterChainManager;

import java.util.Map;

public class DataRoomShiroFilterFactoryBean extends ShiroFilterFactoryBean {

    @Override
    protected FilterChainManager createFilterChainManager() {
        FilterChainManager manager = super.createFilterChainManager();
        Map<String, Filter> filterMap = manager.getFilters();
        Filter invalidRequestFilter = filterMap.get(DefaultFilter.invalidRequest.name());
        if (invalidRequestFilter instanceof InvalidRequestFilter) {
            // 设置false跳过URL携带中文400，servletPath中文校验
            ((InvalidRequestFilter) invalidRequestFilter).setBlockNonAscii(false);
        }
        return manager;
    }
}
