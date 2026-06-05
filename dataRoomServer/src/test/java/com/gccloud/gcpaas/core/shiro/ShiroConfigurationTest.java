package com.gccloud.gcpaas.core.shiro;

import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.mock;

class ShiroConfigurationTest {

    @Test
    void resourceProxyFileEndpointIsAnonymous() {
        ShiroConfiguration configuration = new ShiroConfiguration();

        ShiroFilterFactoryBean shiroFilter = configuration.shiroFilter(mock(SecurityManager.class));

        assertEquals("anon", shiroFilter.getFilterChainDefinitionMap().get("/dataRoom/resource/file/**"));
    }
}
