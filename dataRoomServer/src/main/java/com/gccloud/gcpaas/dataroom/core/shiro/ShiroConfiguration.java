package com.gccloud.gcpaas.dataroom.core.shiro;

import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import jakarta.servlet.Filter;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.apache.shiro.mgt.DefaultSessionStorageEvaluator;
import org.apache.shiro.mgt.DefaultSubjectDAO;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.session.mgt.SessionManager;
import org.apache.shiro.spring.LifecycleBeanPostProcessor;
import org.apache.shiro.spring.security.interceptor.AuthorizationAttributeSourceAdvisor;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.config.ShiroFilterConfiguration;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.apache.shiro.web.session.mgt.DefaultWebSessionManager;
import org.springframework.aop.framework.autoproxy.DefaultAdvisorAutoProxyCreator;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

import java.io.Serializable;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@Component
@Configuration
public class ShiroConfiguration {

    private static final String OAUTH = "OAUTH";

    private static final String STATELESS_ANON = "noSessionCreation,anon";

    private static final String STATELESS_OAUTH = "noSessionCreation,OAUTH";


    @Bean
    public SessionManager sessionManager() {
        DefaultWebSessionManager sessionManager = new StatelessWebSessionManager();
        sessionManager.setSessionValidationSchedulerEnabled(false);
        sessionManager.setDeleteInvalidSessions(false);
        sessionManager.setSessionIdCookieEnabled(false);
        sessionManager.setSessionIdUrlRewritingEnabled(false);
        return sessionManager;
    }

    @Bean
    public SecurityManager securityManager(ShiroAuthRealm shiroAuthRealm, SessionManager sessionManager) {
        DefaultSessionStorageEvaluator sessionStorageEvaluator = new DefaultSessionStorageEvaluator();
        sessionStorageEvaluator.setSessionStorageEnabled(false);
        DefaultSubjectDAO subjectDAO = new DefaultSubjectDAO();
        subjectDAO.setSessionStorageEvaluator(sessionStorageEvaluator);

        DefaultWebSecurityManager securityManager = new DefaultWebSecurityManager();
        securityManager.setRealm(shiroAuthRealm);
        securityManager.setSessionManager(sessionManager);
        securityManager.setSubjectDAO(subjectDAO);
        securityManager.setRememberMeManager(null);
        return securityManager;
    }

    @Bean
    public ShiroFilterConfiguration shiroFilterConfiguration() {
        ShiroFilterConfiguration configuration = new ShiroFilterConfiguration();
        configuration.setStaticSecurityManagerEnabled(true);
        return configuration;
    }

    @Bean
    public ShiroFilterFactoryBean shiroFilter(SecurityManager securityManager,
                                              ShiroFilterConfiguration shiroFilterConfiguration,
                                              DataRoomConfig dataRoomConfig) {
        DataRoomShiroFilterFactoryBean shiroFilter = new DataRoomShiroFilterFactoryBean();
        shiroFilter.setSecurityManager(securityManager);
        shiroFilter.setShiroFilterConfiguration(shiroFilterConfiguration);
        Map<String, Filter> filters = new HashMap<>(16);
        shiroFilter.setFilters(filters);
        filters.put(OAUTH, new ShiroAuthFilter(dataRoomConfig.getJwt().getTokenKey()));
        Map<String, String> filterMap = new LinkedHashMap<>();
        filterMap.put("/dataRoom/captcha/**", STATELESS_ANON);
        filterMap.put("/dataRoom/user/login", STATELESS_ANON);
        filterMap.put("/dataRoom/user/login/**", STATELESS_ANON);
        filterMap.put("/cas/login", STATELESS_ANON);

        filterMap.put("/webjars/swagger-ui/**", STATELESS_OAUTH);
        filterMap.put("/webjars/**", STATELESS_ANON);
        filterMap.put("/v3/api-docs/**", STATELESS_ANON);
        filterMap.put("/doc.html/**", STATELESS_ANON);
        // /h2-console
        filterMap.put("/h2-console/**", STATELESS_ANON);
        // 静态资源
        filterMap.put("/static/**", STATELESS_ANON);
        // 非 local 存储资源代理访问，暂时公开不鉴权
        filterMap.put("/dataRoom/resource/file/**", STATELESS_ANON);
        filterMap.put("/**", STATELESS_OAUTH);
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

    private static class StatelessWebSessionManager extends DefaultWebSessionManager {

        @Override
        protected Serializable getSessionId(ServletRequest request, ServletResponse response) {
            return null;
        }
    }
}
