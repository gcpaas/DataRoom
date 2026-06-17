package com.gccloud.gcpaas.core.operationlog;

import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomExceptionHandler;
import com.gccloud.gcpaas.dataroom.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.dataroom.core.operationlog.model.OperationLogContext;
import com.gccloud.gcpaas.dataroom.core.operationlog.model.OperationLogDetailLevel;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPersistService;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPolicy;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogPublisher;
import com.gccloud.gcpaas.dataroom.core.operationlog.service.OperationLogResolver;
import com.gccloud.gcpaas.dataroom.core.operationlog.web.OperationLogFilter;
import com.gccloud.gcpaas.dataroom.core.operationlog.web.OperationLogInterceptor;
import com.gccloud.gcpaas.dataroom.core.operationlog.web.OperationLogResponseAdvice;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.Test;
import org.apache.shiro.subject.Subject;
import org.apache.shiro.util.ThreadContext;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.test.web.servlet.setup.StandaloneMockMvcBuilder;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.concurrent.Executor;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OperationLogWebFlowTest {

    @Test
    void successRequestRecordsSummaryAndRedactsSensitiveFields() throws Exception {
        OperationLogPersistService persistService = mock(OperationLogPersistService.class);
        MockMvc mockMvc = buildMockMvc(persistService);

        mockMvc.perform(post("/dataRoom/demo/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"datasetCode\":\"dataset_123\",\"password\":\"secret\"}"))
                .andExpect(status().isOk());

        ArgumentCaptor<OperationLogContext> captor = ArgumentCaptor.forClass(OperationLogContext.class);
        verify(persistService).persist(captor.capture());
        OperationLogContext context = captor.getValue();
        assertEquals("/dataRoom/demo/run", context.getRequestUri());
        assertEquals("SUCCESS", context.getResultStatus());
        assertEquals(200, context.getResponseCode());
        assertEquals("dataset_123", context.getTargetId());
        assertEquals("数据集运行", context.getBusinessName());
        assertTrue(context.getRequestBody().contains("\"password\":\"***\""));
    }

    @Test
    void handledExceptionRequestStillRecordsFailure() throws Exception {
        OperationLogPersistService persistService = mock(OperationLogPersistService.class);
        MockMvc mockMvc = buildMockMvc(persistService);

        mockMvc.perform(get("/dataRoom/demo/fail/page_001"))
                .andExpect(status().isOk());

        ArgumentCaptor<OperationLogContext> captor = ArgumentCaptor.forClass(OperationLogContext.class);
        verify(persistService).persist(captor.capture());
        OperationLogContext context = captor.getValue();
        assertEquals("FAILURE", context.getResultStatus());
        assertEquals(500, context.getResponseCode());
        assertEquals("DataRoomException", context.getExceptionType());
        assertEquals("page_001", context.getTargetId());
    }

    @Test
    void multipartRequestUsesPlaceholderBodyAndKeepsRequestParamTarget() throws Exception {
        OperationLogPersistService persistService = mock(OperationLogPersistService.class);
        MockMvc mockMvc = buildMockMvc(persistService);
        MockMultipartFile file = new MockMultipartFile("file", "demo.txt", "text/plain", "hello".getBytes());

        mockMvc.perform(multipart("/dataRoom/demo/upload")
                        .file(file)
                        .param("code", "ds_excel_001")
                        .param("name", "Excel导入"))
                .andExpect(status().isOk());

        ArgumentCaptor<OperationLogContext> captor = ArgumentCaptor.forClass(OperationLogContext.class);
        verify(persistService).persist(captor.capture());
        OperationLogContext context = captor.getValue();
        assertEquals("ds_excel_001", context.getTargetId());
        assertEquals("[multipart payload omitted]", context.getRequestBody());
    }

    @Test
    void authenticatedRequestCapturesOperatorBeforeSubjectCleanup() throws Exception {
        OperationLogPersistService persistService = mock(OperationLogPersistService.class);
        LoginUser loginUser = new LoginUser();
        loginUser.setId("user_001");
        loginUser.setUsername("alice");
        loginUser.setRole("developer");
        loginUser.setTenantCode("tenant_a");
        MockMvc mockMvc = buildMockMvc(persistService, new SubjectBindingFilter(loginUser));

        mockMvc.perform(post("/dataRoom/demo/run")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"datasetCode\":\"dataset_123\"}"))
                .andExpect(status().isOk());

        ArgumentCaptor<OperationLogContext> captor = ArgumentCaptor.forClass(OperationLogContext.class);
        verify(persistService).persist(captor.capture());
        OperationLogContext context = captor.getValue();
        assertEquals("user_001", context.getOperatorId());
        assertEquals("alice", context.getOperatorName());
        assertEquals("developer", context.getOperatorRole());
        assertEquals("tenant_a", context.getTenantCode());
    }

    @Test
    void optionsRequestIsIgnoredByOperationLog() throws Exception {
        OperationLogPersistService persistService = mock(OperationLogPersistService.class);
        MockMvc mockMvc = buildMockMvc(persistService);

        mockMvc.perform(options("/dataRoom/demo/run"))
                .andExpect(status().isOk());

        verifyNoInteractions(persistService);
    }

    private MockMvc buildMockMvc(OperationLogPersistService persistService) {
        return buildMockMvc(persistService, null);
    }

    private MockMvc buildMockMvc(OperationLogPersistService persistService, OncePerRequestFilter authFilter) {
        Executor executor = Runnable::run;
        OperationLogResolver resolver = new OperationLogResolver();
        OperationLogPolicy policy = new OperationLogPolicy();
        OperationLogPublisher publisher = new OperationLogPublisher(executor, persistService);
        StandaloneMockMvcBuilder builder = MockMvcBuilders.standaloneSetup(new DemoController())
                .addInterceptors(new OperationLogInterceptor(resolver))
                .setControllerAdvice(new DataRoomExceptionHandler(), new OperationLogResponseAdvice());
        if (authFilter == null) {
            builder.addFilters(new OperationLogFilter(policy, resolver, publisher));
        } else {
            builder.addFilters(new OperationLogFilter(policy, resolver, publisher), authFilter);
        }
        return builder.build();
    }

    @RestController
    @RequestMapping("/dataRoom/demo")
    @OperationLogMeta(targetType = "dataset", businessType = "dataset_manage", businessName = "数据集管理")
    static class DemoController {

        @PostMapping("/run")
        @OperationLogMeta(
                actionType = "执行",
                actionDesc = "数据集执行",
                businessType = "dataset_runtime",
                businessName = "数据集运行",
                targetIdKey = "datasetCode",
                detailLevel = OperationLogDetailLevel.SUMMARY
        )
        public Resp<String> run(@RequestBody Map<String, Object> body) {
            return Resp.success("ok");
        }

        @RequestMapping("/fail/{code}")
        public Resp<String> fail(@PathVariable("code") String code) {
            throw new DataRoomException("failure");
        }

        @PostMapping("/upload")
        @OperationLogMeta(
                actionType = "上传",
                actionDesc = "上传Excel文件",
                businessType = "excel_import",
                businessName = "Excel导入",
                targetIdKey = "code",
                targetNameKey = "name",
                detailLevel = OperationLogDetailLevel.SUMMARY
        )
        public Resp<String> upload(@RequestParam("file") MultipartFile file,
                                   @RequestParam("code") String code,
                                   @RequestParam("name") String name) {
            return Resp.success(code + ":" + name);
        }
    }

    static class SubjectBindingFilter extends OncePerRequestFilter {

        private final LoginUser loginUser;

        SubjectBindingFilter(LoginUser loginUser) {
            this.loginUser = loginUser;
        }

        @Override
        protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
                throws ServletException, java.io.IOException {
            Subject subject = mock(Subject.class);
            when(subject.getPrincipal()).thenReturn(loginUser);
            ThreadContext.bind(subject);
            try {
                filterChain.doFilter(request, response);
            } finally {
                ThreadContext.remove();
            }
        }
    }
}
