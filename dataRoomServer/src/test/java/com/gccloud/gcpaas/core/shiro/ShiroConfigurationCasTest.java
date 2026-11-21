package com.gccloud.gcpaas.core.shiro;

import com.gccloud.gcpaas.dataroom.core.shiro.ShiroConfiguration;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.shiro.ShiroAuthRealm;
import com.gccloud.gcpaas.dataroom.core.shiro.ShiroAuthToken;
import jakarta.servlet.http.Cookie;
import org.apache.shiro.authc.AuthenticationInfo;
import org.apache.shiro.authc.AuthenticationToken;
import org.apache.shiro.authc.SimpleAuthenticationInfo;
import org.apache.shiro.mgt.DefaultSessionStorageEvaluator;
import org.apache.shiro.mgt.DefaultSubjectDAO;
import org.apache.shiro.mgt.SecurityManager;
import org.apache.shiro.session.Session;
import org.apache.shiro.session.mgt.DefaultSessionContext;
import org.apache.shiro.session.mgt.SessionManager;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.web.config.ShiroFilterConfiguration;
import org.apache.shiro.spring.web.ShiroFilterFactoryBean;
import org.apache.shiro.web.mgt.DefaultWebSecurityManager;
import org.apache.shiro.web.session.mgt.DefaultWebSessionManager;
import org.apache.shiro.web.subject.WebSubject;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import java.util.List;
import java.util.concurrent.Callable;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;

class ShiroConfigurationCasTest {

    @Test
    void filterChainsDisableSessionCreationWithoutChangingAccessRules() {
        ShiroFilterFactoryBean filter = new ShiroConfiguration().shiroFilter(
                mock(SecurityManager.class),
                new ShiroFilterConfiguration(),
                dataRoomConfig()
        );

        for (String path : List.of(
                "/dataRoom/captcha/**",
                "/dataRoom/user/login",
                "/dataRoom/user/login/**",
                "/cas/login",
                "/webjars/**",
                "/v3/api-docs/**",
                "/doc.html/**",
                "/h2-console/**",
                "/static/**",
                "/dataRoom/resource/file/**"
        )) {
            assertEquals("noSessionCreation,anon", filter.getFilterChainDefinitionMap().get(path));
        }
        assertEquals("noSessionCreation,OAUTH", filter.getFilterChainDefinitionMap().get("/**"));
        var matcher = new org.springframework.util.AntPathMatcher();
        for (String path : List.of("/swagger-ui.html", "/swagger-ui/index.html", "/webjars/swagger-ui/index.html")) {
            String firstMatch = filter.getFilterChainDefinitionMap().keySet().stream()
                    .filter(pattern -> matcher.match(pattern, path)).findFirst().orElseThrow();
            assertEquals("noSessionCreation,OAUTH", filter.getFilterChainDefinitionMap().get(firstMatch), path);
        }
    }

    @Test
    void securityManagerDoesNotReadCreateOrPersistSessions() {
        ShiroConfiguration configuration = new ShiroConfiguration();
        SessionManager sessionManager = configuration.sessionManager();
        DefaultWebSessionManager webSessionManager = assertInstanceOf(
                DefaultWebSessionManager.class,
                sessionManager
        );

        assertFalse(webSessionManager.isSessionIdCookieEnabled());
        assertFalse(webSessionManager.isSessionIdUrlRewritingEnabled());

        DefaultWebSecurityManager securityManager = assertInstanceOf(
                DefaultWebSecurityManager.class,
                configuration.securityManager(mock(ShiroAuthRealm.class), sessionManager)
        );
        DefaultSubjectDAO subjectDAO = assertInstanceOf(
                DefaultSubjectDAO.class,
                securityManager.getSubjectDAO()
        );
        DefaultSessionStorageEvaluator evaluator = assertInstanceOf(
                DefaultSessionStorageEvaluator.class,
                subjectDAO.getSessionStorageEvaluator()
        );

        assertFalse(evaluator.isSessionStorageEnabled());
    }

    @Test
    void concurrentTokenLoginsIgnoreJsessionIdAndCreateNoSession() throws Exception {
        ShiroConfiguration configuration = new ShiroConfiguration();
        SessionManager sessionManager = configuration.sessionManager();
        DefaultWebSecurityManager securityManager = assertInstanceOf(
                DefaultWebSecurityManager.class,
                configuration.securityManager(acceptingRealm(), sessionManager)
        );
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch ready = new CountDownLatch(2);
        CountDownLatch start = new CountDownLatch(1);

        Callable<MockHttpServletResponse> login = () -> {
            MockHttpServletRequest request = new MockHttpServletRequest();
            request.setCookies(new Cookie("JSESSIONID", "already-stopped-session"));
            MockHttpServletResponse response = new MockHttpServletResponse();
            Subject subject = new WebSubject.Builder(securityManager, request, response).buildWebSubject();
            ready.countDown();
            start.await();

            subject.login(new ShiroAuthToken("valid-token"));

            assertNull(subject.getSession(false));
            return response;
        };

        try {
            List<Future<MockHttpServletResponse>> futures = List.of(
                    executor.submit(login),
                    executor.submit(login)
            );
            assertTrue(ready.await(5, TimeUnit.SECONDS));
            start.countDown();

            for (Future<MockHttpServletResponse> future : futures) {
                assertNull(future.get(5, TimeUnit.SECONDS).getCookie("JSESSIONID"));
            }
        } finally {
            executor.shutdownNow();
        }
    }

    @Test
    void securityManagerIgnoresValidSessionIdFromRequestUrl() {
        ShiroConfiguration configuration = new ShiroConfiguration();
        SessionManager sessionManager = configuration.sessionManager();
        Session existingSession = sessionManager.start(new DefaultSessionContext());
        DefaultWebSecurityManager securityManager = assertInstanceOf(
                DefaultWebSecurityManager.class,
                configuration.securityManager(acceptingRealm(), sessionManager)
        );
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setQueryString("JSESSIONID=" + existingSession.getId());
        request.setParameter("JSESSIONID", existingSession.getId().toString());

        Subject subject = new WebSubject.Builder(
                securityManager,
                request,
                new MockHttpServletResponse()
        ).buildWebSubject();

        assertNull(subject.getSession(false));
    }

    private static ShiroAuthRealm acceptingRealm() {
        return new ShiroAuthRealm() {
            @Override
            protected AuthenticationInfo doGetAuthenticationInfo(AuthenticationToken token) {
                return new SimpleAuthenticationInfo(token.getPrincipal(), token.getCredentials(), getName());
            }
        };
    }

    private static DataRoomConfig dataRoomConfig() {
        DataRoomConfig config = new DataRoomConfig();
        config.getJwt().setTokenKey("customToken");
        return config;
    }
}
