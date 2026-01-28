package com.gccloud.gcpaas.core.util;

import com.gccloud.gcpaas.core.shiro.LoginUser;
import org.apache.shiro.SecurityUtils;
import org.apache.shiro.subject.Subject;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.MockedStatic;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/**
 * LoginUserUtils 单元测试
 */
@DisplayName("LoginUserUtils 工具类测试")
class LoginUserUtilsTest {

    @Test
    @DisplayName("测试获取当前用户成功")
    void testGetCurrentUserSuccess() {
        // 创建测试用户
        LoginUser expectedUser = new LoginUser();
        expectedUser.setUsername("testuser");
        expectedUser.setRealName("测试用户");
        
        // Mock Subject
        Subject mockSubject = mock(Subject.class);
        when(mockSubject.getPrincipal()).thenReturn(expectedUser);
        
        // Mock SecurityUtils.getSubject()
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject).thenReturn(mockSubject);
            
            // 获取当前用户
            LoginUser currentUser = LoginUserUtils.getCurrentUser();
            
            // 验证结果
            assertNotNull(currentUser, "当前用户不应为空");
            assertEquals(expectedUser, currentUser, "应返回预期的用户");
            assertEquals("testuser", currentUser.getUsername(), "用户名应正确");
            assertEquals("测试用户", currentUser.getRealName(), "真实姓名应正确");
        }
    }

    @Test
    @DisplayName("测试Principal为null时返回null")
    void testGetCurrentUserWhenPrincipalIsNull() {
        // Mock Subject，principal为null
        Subject mockSubject = mock(Subject.class);
        when(mockSubject.getPrincipal()).thenReturn(null);
        
        // Mock SecurityUtils.getSubject()
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject).thenReturn(mockSubject);
            
            // 获取当前用户
            LoginUser currentUser = LoginUserUtils.getCurrentUser();
            
            // 验证结果
            assertNull(currentUser, "Principal为null时应返回null");
        }
    }

    @Test
    @DisplayName("测试获取Subject抛出异常时返回null")
    void testGetCurrentUserWhenExceptionThrown() {
        // Mock SecurityUtils.getSubject()抛出异常
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject)
                .thenThrow(new RuntimeException("Shiro未初始化"));
            
            // 获取当前用户
            LoginUser currentUser = LoginUserUtils.getCurrentUser();
            
            // 验证结果（应捕获异常并返回null）
            assertNull(currentUser, "异常时应返回null");
        }
    }

    @Test
    @DisplayName("测试Subject为null时的处理")
    void testGetCurrentUserWhenSubjectIsNull() {
        // Mock SecurityUtils.getSubject()返回null
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject).thenReturn(null);
            
            // 获取当前用户（会抛出NullPointerException，应被捕获）
            LoginUser currentUser = LoginUserUtils.getCurrentUser();
            
            // 验证结果
            assertNull(currentUser, "Subject为null时应返回null");
        }
    }

    @Test
    @DisplayName("测试Principal类型错误时抛出异常")
    void testGetCurrentUserWhenPrincipalTypeWrong() {
        // Mock Subject，principal为错误类型
        Subject mockSubject = mock(Subject.class);
        when(mockSubject.getPrincipal()).thenReturn("wrong_type_principal");
        
        // Mock SecurityUtils.getSubject()
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject).thenReturn(mockSubject);
            
            // 获取当前用户（会抛出ClassCastException，应被捕获）
            LoginUser currentUser = LoginUserUtils.getCurrentUser();
            
            // 验证结果
            assertNull(currentUser, "Principal类型错误时应返回null");
        }
    }

    @Test
    @DisplayName("测试获取包含扩展属性的用户")
    void testGetCurrentUserWithExtProps() {
        // 创建包含扩展属性的用户
        LoginUser expectedUser = new LoginUser();
        expectedUser.setUsername("testuser2");
        expectedUser.setRealName("测试用户2");
        expectedUser.setExtProps(java.util.Map.of("dept", "IT", "role", "admin"));
        
        // Mock Subject
        Subject mockSubject = mock(Subject.class);
        when(mockSubject.getPrincipal()).thenReturn(expectedUser);
        
        // Mock SecurityUtils.getSubject()
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject).thenReturn(mockSubject);
            
            // 获取当前用户
            LoginUser currentUser = LoginUserUtils.getCurrentUser();
            
            // 验证结果
            assertNotNull(currentUser, "当前用户不应为空");
            assertNotNull(currentUser.getExtProps(), "扩展属性不应为空");
            assertEquals("IT", currentUser.getExtProps().get("dept"), "部门信息应正确");
            assertEquals("admin", currentUser.getExtProps().get("role"), "角色信息应正确");
        }
    }

    @Test
    @DisplayName("测试多次调用获取相同用户")
    void testMultipleCallsGetSameUser() {
        // 创建测试用户
        LoginUser expectedUser = new LoginUser();
        expectedUser.setUsername("testuser3");
        expectedUser.setRealName("测试用户3");
        
        // Mock Subject
        Subject mockSubject = mock(Subject.class);
        when(mockSubject.getPrincipal()).thenReturn(expectedUser);
        
        // Mock SecurityUtils.getSubject()
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject).thenReturn(mockSubject);
            
            // 多次获取当前用户
            LoginUser user1 = LoginUserUtils.getCurrentUser();
            LoginUser user2 = LoginUserUtils.getCurrentUser();
            LoginUser user3 = LoginUserUtils.getCurrentUser();
            
            // 验证结果
            assertNotNull(user1, "第一次获取不应为空");
            assertNotNull(user2, "第二次获取不应为空");
            assertNotNull(user3, "第三次获取不应为空");
            
            // 所有调用应返回相同的用户对象
            assertSame(user1, user2, "应返回相同的用户对象");
            assertSame(user2, user3, "应返回相同的用户对象");
        }
    }

    @Test
    @DisplayName("测试用户未登录场景")
    void testGetCurrentUserWhenNotLoggedIn() {
        // Mock Subject，但未登录（principal为null）
        Subject mockSubject = mock(Subject.class);
        when(mockSubject.getPrincipal()).thenReturn(null);
        
        // Mock SecurityUtils.getSubject()
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject).thenReturn(mockSubject);
            
            // 获取当前用户
            LoginUser currentUser = LoginUserUtils.getCurrentUser();
            
            // 验证结果
            assertNull(currentUser, "用户未登录时应返回null");
            
            // 验证调用了getPrincipal
            verify(mockSubject).getPrincipal();
        }
    }

    @Test
    @DisplayName("测试Shiro认证异常处理")
    void testHandleShiroAuthenticationException() {
        // Mock SecurityUtils.getSubject()抛出认证异常
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject)
                .thenThrow(new org.apache.shiro.authc.AuthenticationException("认证失败"));
            
            // 获取当前用户
            LoginUser currentUser = LoginUserUtils.getCurrentUser();
            
            // 验证结果（异常应被捕获，返回null）
            assertNull(currentUser, "认证异常时应返回null");
        }
    }

    @Test
    @DisplayName("测试获取用户基本属性")
    void testGetCurrentUserBasicProperties() {
        // 创建完整用户信息
        LoginUser expectedUser = new LoginUser();
        expectedUser.setUsername("admin");
        expectedUser.setRealName("管理员");
        expectedUser.setEmail("admin@example.com");
        expectedUser.setPhone("13800138000");
        expectedUser.setState("1");
        expectedUser.setTenantCode("default");
        
        // Mock Subject
        Subject mockSubject = mock(Subject.class);
        when(mockSubject.getPrincipal()).thenReturn(expectedUser);
        
        // Mock SecurityUtils.getSubject()
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject).thenReturn(mockSubject);
            
            // 获取当前用户
            LoginUser currentUser = LoginUserUtils.getCurrentUser();
            
            // 验证所有基本属性
            assertNotNull(currentUser, "用户不应为空");
            assertEquals("admin", currentUser.getUsername(), "用户名应正确");
            assertEquals("管理员", currentUser.getRealName(), "真实姓名应正确");
            assertEquals("admin@example.com", currentUser.getEmail(), "邮箱应正确");
            assertEquals("13800138000", currentUser.getPhone(), "电话应正确");
            assertEquals("1", currentUser.getState(), "状态应正确");
            assertEquals("default", currentUser.getTenantCode(), "租户编码应正确");
        }
    }

    @Test
    @DisplayName("测试并发场景下获取用户")
    void testGetCurrentUserInConcurrentScenario() throws InterruptedException {
        // 创建测试用户
        LoginUser expectedUser = new LoginUser();
        expectedUser.setUsername("concurrent_test");
        expectedUser.setRealName("并发测试用户");
        
        // Mock Subject
        Subject mockSubject = mock(Subject.class);
        when(mockSubject.getPrincipal()).thenReturn(expectedUser);
        
        // Mock SecurityUtils.getSubject()
        try (MockedStatic<SecurityUtils> mockedSecurityUtils = mockStatic(SecurityUtils.class)) {
            mockedSecurityUtils.when(SecurityUtils::getSubject).thenReturn(mockSubject);
            
            // 模拟多线程并发获取用户
            Thread[] threads = new Thread[5];
            LoginUser[] results = new LoginUser[5];
            
            for (int i = 0; i < 5; i++) {
                final int index = i;
                threads[i] = new Thread(() -> {
                    results[index] = LoginUserUtils.getCurrentUser();
                });
                threads[i].start();
            }
            
            // 等待所有线程完成
            for (Thread thread : threads) {
                thread.join();
            }
            
            // 验证所有结果
            for (int i = 0; i < 5; i++) {
                assertNotNull(results[i], "线程 " + i + " 应获取到用户");
                assertEquals("concurrent_test", results[i].getUsername(), "用户名应正确");
            }
        }
    }
}
