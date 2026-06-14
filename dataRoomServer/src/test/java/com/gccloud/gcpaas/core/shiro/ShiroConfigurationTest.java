package com.gccloud.gcpaas.core.shiro;

import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Proxy;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;

class ShiroConfigurationTest {

    @Test
    void resourceProxyFileEndpointIsAnonymous() {
        ShiroConfiguration configuration = new ShiroConfiguration();

        ShiroFilterFactoryBean shiroFilter = configuration.shiroFilter(securityManager());

        assertEquals("anon", shiroFilter.getFilterChainDefinitionMap().get("/dataRoom/resource/file/**"));
    }

    @Test
    void mcpEndpointUsesDefaultAuthenticatedFilter() {
        ShiroConfiguration configuration = new ShiroConfiguration();

        ShiroFilterFactoryBean shiroFilter = configuration.shiroFilter(securityManager());

        assertEquals("OAUTH", shiroFilter.getFilterChainDefinitionMap().get("/**"));
        assertNull(shiroFilter.getFilterChainDefinitionMap().get("/dataRoom/mcp/**"));
    }

    private SecurityManager securityManager() {
        return (SecurityManager) Proxy.newProxyInstance(
                SecurityManager.class.getClassLoader(),
                new Class<?>[]{SecurityManager.class},
                (proxy, method, args) -> null
        );
    }
}
