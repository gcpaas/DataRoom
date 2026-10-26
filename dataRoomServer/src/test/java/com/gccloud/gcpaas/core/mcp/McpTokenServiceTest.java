package com.gccloud.gcpaas.core.mcp;

import com.alibaba.fastjson2.JSON;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.MybatisSqlSessionFactoryBuilder;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.constant.UserStatus;
import com.gccloud.gcpaas.dataroom.core.entity.McpTokenEntity;
import com.gccloud.gcpaas.dataroom.core.entity.UserEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.McpTokenMapper;
import com.gccloud.gcpaas.dataroom.core.mapper.UserMapper;
import com.gccloud.gcpaas.dataroom.core.mcp.McpTokenController;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.McpTokenAddDto;
import com.gccloud.gcpaas.dataroom.core.mcp.bean.McpTokenCreatedVo;
import com.gccloud.gcpaas.dataroom.core.mcp.service.McpTokenService;
import com.gccloud.gcpaas.dataroom.core.page.service.PageShareService;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletResponse;
import org.apache.ibatis.datasource.unpooled.UnpooledDataSource;
import org.apache.ibatis.logging.nologging.NoLoggingImpl;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.ThreadContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.BeanUtils;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.FileSystemResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.Statement;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class McpTokenServiceTest {

    private McpTokenService service;
    private McpTokenMapper tokenMapper;
    private UserMapper userMapper;
    private UserEntity user;
    private LoginUser principal;
    private Subject subject;
    private SqlSession session;
    private final ObjectMapper json = new ObjectMapper().registerModule(new JavaTimeModule());

    @BeforeEach
    void setUp() throws Exception {
        UnpooledDataSource dataSource = new UnpooledDataSource("org.h2.Driver",
                "jdbc:h2:mem:mcp_" + UUID.randomUUID(), "sa", "");
        MybatisConfiguration configuration = new MybatisConfiguration();
        configuration.setMapUnderscoreToCamelCase(true);
        configuration.setLogImpl(NoLoggingImpl.class);
        configuration.setEnvironment(new Environment("test", new JdbcTransactionFactory(), dataSource));
        configuration.addMapper(McpTokenMapper.class);
        session = new MybatisSqlSessionFactoryBuilder().build(configuration).openSession(true);
        new ResourceDatabasePopulator(new FileSystemResource(upgradePath())).populate(session.getConnection());
        tokenMapper = session.getMapper(McpTokenMapper.class);
        userMapper = mock(UserMapper.class);
        service = new McpTokenService();
        ReflectionTestUtils.setField(service, "mcpTokenMapper", tokenMapper);
        ReflectionTestUtils.setField(service, "userMapper", userMapper);
        user = new UserEntity();
        user.setId("local-1");
        user.setAccount("alice");
        user.setTenantCode("tenant-a");
        user.setStatus(UserStatus.NORMAL);
        user.setRole("developer,sharer");
        user.setPassword("database-password");
        when(userMapper.selectById("local-1")).thenAnswer(invocation -> user);
        principal = new LoginUser();
        BeanUtils.copyProperties(user, principal);
        subject = mock(Subject.class);
        when(subject.getPrincipal()).thenAnswer(invocation -> principal);
        ThreadContext.bind(subject);
    }

    @AfterEach
    void tearDown() {
        ThreadContext.unbindSubject();
        if (session != null) {
            session.close();
        }
    }

    @Test
    void createsOnlyHashAndReturnsPlaintextOnce() throws Exception {
        McpTokenCreatedVo result = service.add(dto());
        assertTrue(result.getToken().matches("drmcp_[A-Za-z0-9_-]{43}"));
        assertEquals(32, java.util.Base64.getUrlDecoder().decode(result.getToken().substring(6)).length);
        McpTokenEntity stored = tokenMapper.selectById(result.getId());
        assertEquals(HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256")
                .digest(result.getToken().getBytes(StandardCharsets.UTF_8))), stored.getTokenHash());
        assertEquals(result.getToken().substring(0, 14), stored.getTokenPrefix());
        assertEquals("local-1", stored.getUserId());
        assertEquals("tenant-a", stored.getTenantCode());
        assertNull(result.getTokenHash());
        assertEquals("alice", service.authenticate(result.getToken()).getAccount());
        assertNull(service.authenticate(result.getToken()).getPassword());
        assertEquals("database-password", user.getPassword());
        assertEquals(1, service.list().size());
        assertNull(service.list().get(0).getTokenHash());
        assertEquals(List.of("createDate", "expireTime", "id", "name", "tokenPrefix"),
                json.readTree(json.writeValueAsString(service.list().get(0))).properties().stream()
                        .map(Map.Entry::getKey).sorted().toList());
    }

    @Test
    void supportsMultipleTokensAndImmediateIndependentRevocation() {
        McpTokenCreatedVo first = service.add(dto());
        McpTokenCreatedVo second = service.add(dto());
        assertNotEquals(first.getToken(), second.getToken());
        assertEquals(2, service.list().size());
        service.authenticate(first.getToken());
        service.delete(first.getId());
        assertThrows(DataRoomException.class, () -> service.authenticate(first.getToken()));
        assertNotNull(service.authenticate(second.getToken()));
        assertEquals(1, service.list().size());
        assertThrows(DataRoomException.class, () -> service.delete(first.getId()));
    }

    @Test
    void deleteIsSoftAndOwnerScoped() throws Exception {
        McpTokenCreatedVo token = service.add(dto());
        principal.setId("local-2");
        UserEntity other = new UserEntity();
        BeanUtils.copyProperties(user, other);
        other.setId("local-2");
        when(userMapper.selectById("local-2")).thenReturn(other);
        assertTrue(service.list().isEmpty());
        assertThrows(DataRoomException.class, () -> service.delete(token.getId()));
        assertNotNull(service.authenticate(token.getToken()));
        principal.setId("local-1");
        service.delete(token.getId());
        try (Statement statement = session.getConnection().createStatement();
             ResultSet rows = statement.executeQuery("SELECT del_flag FROM dr_mcp_token")) {
            assertTrue(rows.next());
            assertEquals("1", rows.getString(1));
        }
    }

    @Test
    void rejectsMissingPastAndCurrentExpirationAndInvalidNames() {
        McpTokenAddDto dto = dto();
        dto.setExpireTime(null);
        assertThrows(DataRoomException.class, () -> service.add(dto));
        dto.setExpireTime(OffsetDateTime.now().minusMinutes(1));
        assertThrows(DataRoomException.class, () -> service.add(dto));
        dto.setExpireTime(OffsetDateTime.now());
        assertThrows(DataRoomException.class, () -> service.add(dto));
        dto.setExpireTime(OffsetDateTime.now().plusDays(1));
        dto.setName(" ");
        assertThrows(DataRoomException.class, () -> service.add(dto));
        dto.setName("x".repeat(101));
        assertThrows(DataRoomException.class, () -> service.add(dto));
        assertThrows(DataRoomException.class, () -> service.add(null));
        assertTrue(service.list().isEmpty());
    }

    @Test
    void acceptsIsoOffsetDateAndRejectsInvalidDateInput() throws Exception {
        McpTokenAddDto dto = json.readValue("{\"name\":\"客户端\",\"expireTime\":\"2099-01-01T00:00:00+08:00\"}", McpTokenAddDto.class);
        assertNotNull(service.add(dto));
        for (String value : List.of("not-a-date", "2027-02-30T00:00:00Z", "2027-01-01")) {
            assertThrows(JsonMappingException.class, () -> json.readValue(
                    "{\"name\":\"客户端\",\"expireTime\":\"" + value + "\"}", McpTokenAddDto.class));
        }
        assertThrows(JsonMappingException.class, () -> json.readValue(
                "{\"name\":\"客户端\",\"expireTime\":1234567890}", McpTokenAddDto.class));
    }

    @Test
    void rejectsMalformedAndUnknownTokensWithoutUserLookup() {
        for (String token : List.of("", "share_abc", "eyJ.jwt.value", "drmcp_abc", "drmcp_" + "A".repeat(42) + "B",
                "drmcp_" + "A".repeat(43) + "=", "drmcp_" + "A".repeat(43))) {
            assertThrows(DataRoomException.class, () -> service.authenticate(token));
        }
        assertThrows(DataRoomException.class, () -> service.authenticate(null));
        verifyNoInteractions(userMapper);
    }

    @Test
    void rejectsExpiredToken() {
        McpTokenCreatedVo created = service.add(dto());
        McpTokenEntity token = tokenMapper.selectById(created.getId());
        token.setExpireTime(new Date(System.currentTimeMillis() - 1000));
        tokenMapper.updateById(token);
        assertThrows(DataRoomException.class, () -> service.authenticate(created.getToken()));
    }

    @Test
    void userStatusAndPermissionsAreReloadedOnEveryAuthentication() {
        McpTokenCreatedVo created = service.add(dto());
        LoginUser first = service.authenticate(created.getToken());
        user.setRole("sharer");
        user.setUsername("最新名称");
        LoginUser latest = service.authenticate(created.getToken());
        assertEquals("developer,sharer", first.getRole());
        assertEquals(List.of("sharer"), latest.getRoleCodeList());
        assertEquals("最新名称", latest.getUsername());
        assertNotSame(first, latest);
        for (UserStatus status : List.of(UserStatus.DISABLED, UserStatus.LOCKED, UserStatus.PASSWORD_EXPIRED)) {
            user.setStatus(status);
            assertThrows(DataRoomException.class, () -> service.authenticate(created.getToken()));
        }
        user.setStatus(UserStatus.NORMAL);
        user.setExpireDate(new Date());
        assertThrows(DataRoomException.class, () -> service.authenticate(created.getToken()));
        user.setExpireDate(null);
        user.setDelFlag("1");
        assertThrows(DataRoomException.class, () -> service.authenticate(created.getToken()));
        user = null;
        assertThrows(DataRoomException.class, () -> service.authenticate(created.getToken()));
    }

    @Test
    void tenantChangeInvalidatesAuthenticationAndOwnerOperations() {
        McpTokenCreatedVo created = service.add(dto());
        user.setTenantCode("tenant-b");
        assertThrows(DataRoomException.class, () -> service.authenticate(created.getToken()));
        assertThrows(DataRoomException.class, () -> service.list());
        principal.setTenantCode("tenant-b");
        assertTrue(service.list().isEmpty());
        assertThrows(DataRoomException.class, () -> service.delete(created.getId()));
    }

    @Test
    void rejectsShareVirtualSsoAndMismatchedLocalIdentities() {
        principal.setExtProps(Map.of(PageShareService.SHARE_EXT_FLAG, true));
        assertManagementRejected();
        principal.setExtProps(null);
        principal.setId(null);
        assertManagementRejected();
        principal.setId("local-1");
        principal.setAccount("impersonated");
        assertManagementRejected();
        principal.setAccount("alice");
        principal.setTenantCode("other");
        assertManagementRejected();
        principal.setTenantCode("tenant-a");
        user.setStatus(UserStatus.DISABLED);
        assertManagementRejected();
        principal = null;
        assertManagementRejected();
    }

    @Test
    void failedInsertDoesNotReturnToken() {
        McpTokenMapper failingMapper = mock(McpTokenMapper.class);
        ReflectionTestUtils.setField(service, "mcpTokenMapper", failingMapper);
        when(failingMapper.insert(any(McpTokenEntity.class))).thenReturn(0);
        assertThrows(DataRoomException.class, () -> service.add(dto()));
    }

    @Test
    void secretsNeverAppearInEntityJsonOrToString() throws Exception {
        McpTokenCreatedVo created = service.add(dto());
        McpTokenEntity stored = tokenMapper.selectById(created.getId());
        for (String value : List.of(json.writeValueAsString(stored), JSON.toJSONString(stored),
                stored.toString(), created.toString(), Resp.success(created).toString(),
                json.writeValueAsString(service.list()), JSON.toJSONString(service.list()))) {
            assertFalse(value.contains(created.getToken()));
            assertFalse(value.contains(stored.getTokenHash()));
            assertFalse(value.contains("tokenHash"));
        }
        assertTrue(json.writeValueAsString(created).contains(created.getToken()));
        assertFalse(json.writeValueAsString(created).contains("tokenHash"));
        assertFalse(JSON.toJSONString(created).contains("tokenHash"));
    }

    @Test
    void controllerRequiresSharerAndAddBypassesOperationLoggingAndCaching() throws Exception {
        McpTokenController controller = new McpTokenController();
        ReflectionTestUtils.setField(controller, "mcpTokenService", service);
        for (var method : McpTokenController.class.getDeclaredMethods()) {
            assertArrayEquals(new String[]{DataRoomRole.SHARER}, method.getAnnotation(RequiresRoles.class).value());
        }
        assertNull(McpTokenController.class.getMethod("add", McpTokenAddDto.class, HttpServletResponse.class)
                .getAnnotation(Operation.class));
        MockHttpServletResponse response = new MockHttpServletResponse();
        assertNotNull(controller.add(dto(), response).getData().getToken());
        assertEquals("no-store", response.getHeader("Cache-Control"));
        String config = new String(new ClassPathResource("application-base.yml").getInputStream().readAllBytes(), StandardCharsets.UTF_8);
        assertTrue(config.contains("- /dataRoom/mcpToken/add"));
        assertFalse(config.contains("org.apache.ibatis.logging.stdout.StdOutImpl"));
        assertTrue(config.contains("com.gccloud.gcpaas.dataroom.core.mapper.McpTokenMapper: 'OFF'"));
    }

    @Test
    void upgradeAndH2InitializationAreIdempotentAndPreserveTokens() throws Exception {
        McpTokenCreatedVo created = service.add(dto());
        Connection connection = session.getConnection();
        new ResourceDatabasePopulator(new FileSystemResource(upgradePath())).populate(connection);
        new ResourceDatabasePopulator(new ClassPathResource("h2/dataroom_h2.all.sql")).populate(connection);
        new ResourceDatabasePopulator(new ClassPathResource("h2/dataroom_h2.all.sql")).populate(connection);
        assertNotNull(service.authenticate(created.getToken()));
        try (Statement statement = connection.createStatement();
             ResultSet rows = statement.executeQuery("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'DR_MCP_TOKEN'")) {
            while (rows.next()) {
                assertNotEquals("TOKEN", rows.getString(1));
            }
        }
    }

    private void assertManagementRejected() {
        assertThrows(DataRoomException.class, () -> service.add(dto()));
        assertThrows(DataRoomException.class, () -> service.list());
        assertThrows(DataRoomException.class, () -> service.delete("any-id"));
    }

    private McpTokenAddDto dto() {
        McpTokenAddDto dto = new McpTokenAddDto();
        dto.setName("个人客户端");
        dto.setExpireTime(OffsetDateTime.now().plusDays(1));
        return dto;
    }

    private Path upgradePath() {
        Path modulePath = Path.of("../doc/sql/dataroom_mcp_token.upgrade.sql");
        return Files.exists(modulePath) ? modulePath : Path.of("doc/sql/dataroom_mcp_token.upgrade.sql");
    }
}
