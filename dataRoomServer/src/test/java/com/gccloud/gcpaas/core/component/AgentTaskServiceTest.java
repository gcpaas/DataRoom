package com.gccloud.gcpaas.core.component;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.MybatisSqlSessionFactoryBuilder;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gccloud.gcpaas.dataroom.core.agent.AgentTaskService;
import com.gccloud.gcpaas.dataroom.core.entity.AgentTaskEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.AgentTaskMapper;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import org.apache.ibatis.datasource.unpooled.UnpooledDataSource;
import org.apache.ibatis.mapping.Environment;
import org.apache.ibatis.session.SqlSession;
import org.apache.ibatis.transaction.jdbc.JdbcTransactionFactory;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.ThreadContext;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;
import org.springframework.jdbc.datasource.init.ResourceDatabasePopulator;
import org.springframework.test.util.ReflectionTestUtils;

import java.sql.Statement;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AgentTaskServiceTest {

    private static final String TRANSCRIPT = """
            [{"id":"message-1","role":"tool","content":"","pageResult":{
              "action":"created","pageCode":"page-1","pageName":"示例页面","pageType":"visualScreen"
            }}]
            """;
    private SqlSession session;
    private AgentTaskService service;
    private Subject subject;

    @BeforeEach
    void setUp() throws Exception {
        UnpooledDataSource dataSource = new UnpooledDataSource("org.h2.Driver",
                "jdbc:h2:mem:agent_service_" + UUID.randomUUID(), "sa", "");
        MybatisConfiguration configuration = new MybatisConfiguration();
        configuration.setMapUnderscoreToCamelCase(true);
        configuration.setEnvironment(new Environment("test", new JdbcTransactionFactory(), dataSource));
        configuration.addMapper(AgentTaskMapper.class);
        session = new MybatisSqlSessionFactoryBuilder().build(configuration).openSession(true);
        new ResourceDatabasePopulator(new ClassPathResource("h2/dataroom_h2.all.sql"))
                .populate(session.getConnection());
        try (Statement statement = session.getConnection().createStatement()) {
            statement.executeUpdate("""
                    INSERT INTO dr_agent_task (id, thread_id, title, create_user, tenant_code, del_flag)
                    VALUES ('owned', 'thread-1', '原始标题', 'alice', 'tenant-a', '0'),
                           ('other', 'thread-2', '他人任务', 'bob', 'tenant-b', '0'),
                           ('deleted', 'thread-3', '已删除', 'alice', 'tenant-a', '1')
                    """);
        }
        service = new AgentTaskService();
        ReflectionTestUtils.setField(service, "baseMapper", session.getMapper(AgentTaskMapper.class));
        LoginUser principal = new LoginUser();
        principal.setAccount("alice");
        subject = mock(Subject.class);
        when(subject.getPrincipal()).thenReturn(principal);
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
    void entityContractHasNoTaskPageFieldsButRetainsMessageCard() throws Exception {
        AgentTaskEntity dto = new AgentTaskEntity();
        dto.setThreadId("thread-1");
        dto.setTranscript(TRANSCRIPT);
        ObjectMapper json = new ObjectMapper();
        JsonNode serialized = json.valueToTree(dto);
        for (String field : List.of("pageCode", "pageName", "pageType")) {
            assertFalse(serialized.has(field));
            assertThrows(NoSuchFieldException.class, () -> AgentTaskEntity.class.getDeclaredField(field));
        }
        AgentTaskEntity restored = json.treeToValue(serialized, AgentTaskEntity.class);
        assertEquals(TRANSCRIPT, restored.getTranscript());
        assertEquals("page-1", json.readTree(restored.getTranscript()).get(0)
                .get("pageResult").get("pageCode").asText());
    }

    @Test
    void savesOnlyTitleAndTranscriptOnSchemaWithoutPageColumns() {
        AgentTaskEntity dto = new AgentTaskEntity();
        dto.setThreadId("thread-1");
        dto.setTitle(" 新标题 ");
        dto.setTranscript(TRANSCRIPT);
        dto.setId("other");
        dto.setCreateUser("bob");
        dto.setTenantCode("tenant-b");
        dto.setDelFlag("1");
        service.saveTranscript(dto);

        AgentTaskEntity saved = service.getOwnedByThreadId("thread-1");
        assertEquals("新标题", saved.getTitle());
        assertEquals(TRANSCRIPT, saved.getTranscript());
        assertEquals("owned", saved.getId());
        assertEquals("alice", saved.getCreateUser());
        assertEquals("tenant-a", saved.getTenantCode());
        assertEquals("0", saved.getDelFlag());
    }

    @Test
    void transcriptOnlySaveAndEmptyArrayRemainSupported() {
        AgentTaskEntity dto = new AgentTaskEntity();
        dto.setThreadId("thread-1");
        dto.setTranscript(TRANSCRIPT);
        service.saveTranscript(dto);
        dto.setTitle("仅改标题");
        dto.setTranscript(null);
        service.saveTranscript(dto);
        assertEquals(TRANSCRIPT, service.getOwnedByThreadId("thread-1").getTranscript());
        dto.setTitle(null);
        dto.setTranscript("[]");
        service.saveTranscript(dto);
        AgentTaskEntity saved = service.getOwnedByThreadId("thread-1");
        assertEquals("仅改标题", saved.getTitle());
        assertEquals("[]", saved.getTranscript());
    }

    @Test
    void listExcludesOtherUsersDeletedTasksAndTranscript() {
        AgentTaskEntity dto = new AgentTaskEntity();
        dto.setThreadId("thread-1");
        dto.setTranscript(TRANSCRIPT);
        service.saveTranscript(dto);
        List<AgentTaskEntity> tasks = service.listByCurrentUser();
        assertEquals(1, tasks.size());
        assertEquals("thread-1", tasks.get(0).getThreadId());
        assertNull(tasks.get(0).getTranscript());
    }

    @Test
    void rejectsOtherUserDeletedMissingAndBlankThread() {
        for (String threadId : List.of("thread-2", "thread-3", "missing", " ")) {
            AgentTaskEntity dto = new AgentTaskEntity();
            dto.setThreadId(threadId);
            dto.setTranscript(TRANSCRIPT);
            assertThrows(DataRoomException.class, () -> service.saveTranscript(dto));
        }
        assertNull(service.getOwnedByThreadId("thread-1").getTranscript());
    }

    @Test
    void rejectsUnauthenticatedSave() {
        when(subject.getPrincipal()).thenReturn(null);
        AgentTaskEntity dto = new AgentTaskEntity();
        dto.setThreadId("thread-1");
        dto.setTranscript(TRANSCRIPT);
        assertThrows(DataRoomException.class, () -> service.saveTranscript(dto));
    }
}
