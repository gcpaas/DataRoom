package com.gccloud.gcpaas.core.shiro;

import jakarta.servlet.Filter;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.session.mgt.SessionManager;
import org.apache.shiro.spring.LifecycleBeanPostProcessor;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.apache.shiro.web.servlet.SimpleCookie;
import org.apache.shiro.web.session.mgt.DefaultWebSessionManager;
import org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@Configuration
public class ShiroConfiguration {

    private static final String OAUTH = "OAUTH";

    private static final String ANON = "anon";

    @Bean
    public SimpleCookie sessionIdCookie() {
        SimpleCookie simpleCookie = new SimpleCookie("sid");
        simpleCookie.setHttpOnly(true);
        /**
         * 1、大于0时，前端发送请求会自动在Cookie中携带sid，切换用户登录时，获取当前用户还是之前的
         * 2、等于0时，前端看不到sid cookie, 但是druid、springboot-admin 等工具无法使用
         */
        simpleCookie.setMaxAge(3600);
        return simpleCookie;
    }

    @Bean
    public SessionManager sessionManager(SimpleCookie idCookie) {
        DefaultWebSessionManager sessionManager = new DefaultWebSessionManager();
        sessionManager.setSessionValidationSchedulerEnabled(true);
        sessionManager.setSessionIdCookieEnabled(true);
        sessionManager.setSessionIdCookie(idCookie);
        return sessionManager;
    }

    @Bean
    public SecurityManager securityManager(ShiroAuthRealm shiroAuthRealm, SessionManager sessionManager) {
        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(shiroAuthRealm);
        securityManager.setSessionManager(sessionManager);
        securityManager.setRememberMeManager(null);
        return securityManager;
    }

    @Bean
    public ShiroFilterFactoryBean shiroFilter(SecurityManager securityManager) {
        DataRoomShiroFilterFactoryBean shiroFilter = new DataRoomShiroFilterFactoryBean();
        shiroFilter.setSecurityManager(securityManager);
        Map<String, Filter> filters = new HashMap<>(16);
        shiroFilter.setFilters(filters);
        filters.put(OAUTH, new ShiroAuthFilter());
        Map<String, String> filterMap = new LinkedHashMap<>();
        filterMap.put("/dataRoom/captcha/**", ANON);
        filterMap.put("/dataRoom/user/login/**", ANON);
        
        // Knife4j doc.html 需要
        filterMap.put("/webjars/**", ANON);
        filterMap.put("/v3/api-docs/**", ANON);
        filterMap.put("/doc.html/**", ANON);
        // 静态资源
        filterMap.put("/static/**", ANON);
        filterMap.put("/**", OAUTH);
        shiroFilter.setFilterChainDefinitionMap(filterMap);
        return shiroFilter;
    }

    @Bean
    public LifecycleBeanPostProcessor lifecycleBeanPostProcessor() {
        return new LifecycleBeanPostProcessor();
    }

    @Bean
    public DefaultAdvisorAutoProxyCreator defaultAdvisorAutoProxyCreator() {
        DefaultAdvisorAutoProxyCreator proxyCreator = new DefaultAdvisorAutoProxyCreator();
        proxyCreator.setProxyTargetClass(true);
        return proxyCreator;
    }

    @Bean
    public AuthorizationAttributeSourceAdvisor authorizationAttributeSourceAdvisor(SecurityManager securityManager) {
        AuthorizationAttributeSourceAdvisor advisor = new AuthorizationAttributeSourceAdvisor();
        advisor.setSecurityManager(securityManager);
        return advisor;
    }
}
