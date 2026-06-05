# Operation Log Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a backend operation-log pipeline that records all `/dataRoom/**` requests, supports annotation-defined operation/business semantics, and persists logs asynchronously without per-endpoint refactors.

**Architecture:** Add a new `core.operationlog` package for request context, annotation metadata, policy, resolver, async publisher, and web lifecycle hooks. Register a servlet filter before Shiro for full coverage, layer an MVC interceptor and `ResponseBodyAdvice` for handler-aware semantics, bridge global exception handling into the same request context, and persist `dr_operation_log` rows through MyBatis-Plus with H2/MySQL/PG DDL scripts.

**Tech Stack:** Spring Boot 3.5, Spring MVC, Apache Shiro Jakarta, MyBatis-Plus, Jackson, JUnit 5, Mockito, Spring Boot Test.

---

## File Structure

### New backend package

- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/annotation/OperationLogMeta.java`
  - Controller class / method annotation for explicit target, action, and business semantics.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/model/OperationLogContext.java`
  - Mutable per-request context object stored in request attributes.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/model/OperationLogResolvedMeta.java`
  - Immutable resolved metadata object returned by the resolver.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/model/OperationLogDetailLevel.java`
  - Enum-like detail level for `FULL` and `SUMMARY`.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPolicy.java`
  - URI-based policy for full logging, summary logging, truncation, and sensitive-field handling.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogResolver.java`
  - Annotation-first resolver for target, action, business, and descriptive text.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPublisher.java`
  - Async task submission boundary.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPersistService.java`
  - Convert contexts into `OperationLogEntity` and insert through mapper.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogContextHolder.java`
  - Request-attribute helper for sharing the current context across filter, interceptor, advice, and exception bridge.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogFilter.java`
  - Earliest request hook, body capture, timing, auth-failure fallback.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogInterceptor.java`
  - Handler-aware metadata enrichment and handler timing.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogResponseAdvice.java`
  - `Resp` result mapping.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogExceptionBridge.java`
  - Shared helper for attaching exceptions and failure reasons.

### New persistence files

- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/entity/OperationLogEntity.java`
  - MyBatis-Plus entity mapped to `dr_operation_log`.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/mapper/OperationLogMapper.java`
  - Mapper for inserts and future queries.

### Configuration and integration points

- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/OperationLogConfiguration.java`
  - Beans for async executor, filter registration, interceptor registration, and resolver/policy wiring.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/DataRoomConfiguration.java`
  - Keep existing common config; only adjust if shared beans must move.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/shiro/ShiroAuthFilter.java`
  - Attach auth-failure metadata to the current operation-log context before writing the 401 body.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/exception/DataRoomExceptionHandler.java`
  - Bridge exceptions into the request context before returning `Resp`.

### Controller annotation adoption

- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/page/PageController.java`
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/dataset/DatasetController.java`
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/datasource/DataSourceController.java`
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/datasource/ExcelDataSourceController.java`
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/ResourceController.java`
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/map/MapController.java`
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/user/UserController.java`
  - Add class defaults and method overrides only where business semantics must outrank URL inference.

### Controller annotation retrofit checklist

- Add class-level defaults to:
  - `PageController`
  - `DatasetController`
  - `DataSourceController`
  - `ExcelDataSourceController`
  - `ResourceController`
  - `MapController`
  - `UserController`
  - `CaptchaController`
- Leave standard CRUD endpoints on rule inference unless a controller-specific test proves the semantics are insufficient.
- Add method-level overrides only to:
  - `PageController.publish`
  - `PageController.offline`
  - `PageController.updatePageConfig`
  - `PageController.updatePageConfig4Preview`
  - `PageController.getPageConfig`
  - `PageController.stageClear`
  - `PageController.stageRollback`
  - `DatasetController.run`
  - `DatasetController.runTest`
  - `ExcelDataSourceController.upload`
  - `ExcelDataSourceController.createAndImport`
  - `ExcelDataSourceController.reimport`
  - `ExcelDataSourceController.viewData`
  - `ResourceController.upload`
  - `ResourceController.updateModelConfig`
  - `ResourceController.uploadModelCover`
  - `UserController.login`
  - `UserController.updateProfile`
  - `CaptchaController.generate`
- Explicitly do not annotate in phase 1:
  - Standard `list/detail/insert/update/delete` methods
  - `UserController.current`
  - `UserController.roles`
  - `PageController.stageDelete`
  - `PageController.updateName`

### DDL and tests

- `dataRoomServer/src/main/resources/db/dataroom_h2.all.sql`
- `doc/sql/mysql/dataroom_mysql.all.sql`
- `doc/sql/pg/dataroom_pg.all.sql`
- `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogSchemaTest.java`
- `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogResolverTest.java`
- `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogPublisherTest.java`
- `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogWebFlowTest.java`
- `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogControllerAnnotationTest.java`

### Existing references to keep open while implementing

- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/bean/Resp.java`
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/util/LoginUserUtils.java`
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/MybatisMetaObjectHandler.java`

---

### Task 1: Schema And Persistence Skeleton

**Files:**
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/entity/OperationLogEntity.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/mapper/OperationLogMapper.java`
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogSchemaTest.java`
- Modify: `dataRoomServer/src/main/resources/db/dataroom_h2.all.sql`
- Modify: `doc/sql/mysql/dataroom_mysql.all.sql`
- Create: `doc/sql/pg/dataroom_pg.all.sql`

- [ ] **Step 1: Write the failing schema smoke test**

Create `OperationLogSchemaTest.java` with direct file-content assertions so the table contract is locked before code exists:

```java
package com.gccloud.gcpaas.core.operationlog;

import org.junit.jupiter.api.Test;

import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertTrue;

class OperationLogSchemaTest {

    @Test
    void ddlScriptsContainOperationLogTableAndBusinessColumns() throws Exception {
        String h2 = Files.readString(Path.of("src/main/resources/db/dataroom_h2.all.sql"));
        String mysql = Files.readString(Path.of("../doc/sql/mysql/dataroom_mysql.all.sql"));
        String pg = Files.readString(Path.of("../doc/sql/pg/dataroom_pg.all.sql"));

        assertTrue(h2.contains("dr_operation_log"));
        assertTrue(mysql.contains("dr_operation_log"));
        assertTrue(pg.contains("dr_operation_log"));
        assertTrue(h2.contains("business_type"));
        assertTrue(h2.contains("handler_duration_ms"));
    }
}
```

- [ ] **Step 2: Run the schema test and verify it fails**

Run: `mvn test -pl dataRoomServer -Dtest=OperationLogSchemaTest`

Expected: FAIL because `OperationLogSchemaTest` and the `dr_operation_log` DDL do not exist yet.

- [ ] **Step 3: Add the entity, mapper, and DDL**

Create `OperationLogEntity.java` and `OperationLogMapper.java`, then add aligned H2/MySQL/PG DDL:

```java
@Data
@TableName("dr_operation_log")
public class OperationLogEntity extends BaseEntity {
    private String traceId;
    private String operatorId;
    private String operatorName;
    private String operatorRole;
    private String targetType;
    private String targetId;
    private String targetName;
    private String actionType;
    private String actionDesc;
    private String businessType;
    private String businessName;
    private String businessDesc;
    private String requestUri;
    private String requestMethod;
    private String clientIp;
    private String userAgent;
    private String contentType;
    private String queryParams;
    private String requestBody;
    private String requestParamSummary;
    private String resultStatus;
    private Integer responseCode;
    private String responseMessage;
    private String exceptionType;
    private String exceptionStack;
    private Date requestTime;
    private Long durationMs;
    private Long handlerDurationMs;
}
```

```sql
CREATE TABLE IF NOT EXISTS dr_operation_log (
    id VARCHAR(64) PRIMARY KEY,
    trace_id VARCHAR(128),
    operator_id VARCHAR(64),
    operator_name VARCHAR(128),
    operator_role VARCHAR(128),
    target_type VARCHAR(64),
    target_id VARCHAR(128),
    target_name VARCHAR(255),
    action_type VARCHAR(64),
    action_desc VARCHAR(255),
    business_type VARCHAR(128),
    business_name VARCHAR(255),
    business_desc VARCHAR(255),
    request_uri VARCHAR(512),
    request_method VARCHAR(16),
    client_ip VARCHAR(64),
    user_agent VARCHAR(512),
    content_type VARCHAR(128),
    query_params CLOB,
    request_body CLOB,
    request_param_summary CLOB,
    result_status VARCHAR(32),
    response_code INT,
    response_message VARCHAR(512),
    exception_type VARCHAR(255),
    exception_stack CLOB,
    request_time TIMESTAMP,
    duration_ms BIGINT,
    handler_duration_ms BIGINT,
    create_date TIMESTAMP,
    create_user VARCHAR(64),
    update_date TIMESTAMP,
    update_user VARCHAR(64),
    tenant_code VARCHAR(64),
    del_flag VARCHAR(1) DEFAULT '0'
);
```

- [ ] **Step 4: Run the schema test and verify it passes**

Run: `mvn test -pl dataRoomServer -Dtest=OperationLogSchemaTest`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/core/entity/OperationLogEntity.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/mapper/OperationLogMapper.java \
  dataRoomServer/src/main/resources/db/dataroom_h2.all.sql \
  doc/sql/mysql/dataroom_mysql.all.sql \
  doc/sql/pg/dataroom_pg.all.sql \
  dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogSchemaTest.java
git commit -m "feat: add operation log schema"
```

### Task 2: Annotation Contract, Policy, And Resolver

**Files:**
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/annotation/OperationLogMeta.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/model/OperationLogDetailLevel.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/model/OperationLogResolvedMeta.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPolicy.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogResolver.java`
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogResolverTest.java`

- [ ] **Step 1: Write the failing resolver tests**

Create `OperationLogResolverTest.java` to lock annotation precedence, URI fallback, and summary/full policy:

```java
@Test
void methodAnnotationOverridesControllerAndPathRules() throws Exception {
    Method method = PageController.class.getMethod("publish", PagePublishDto.class);
    MockHttpServletRequest request = new MockHttpServletRequest("POST", "/dataRoom/page/publish");

    OperationLogResolvedMeta meta = resolver.resolve(request, new HandlerMethod(new PageController(), method));

    assertEquals("page", meta.getTargetType());
    assertEquals("publish", meta.getActionType());
    assertEquals("page_publish", meta.getBusinessType());
    assertEquals("页面发布", meta.getBusinessName());
}

@Test
void datasetRunUsesSummaryDetailLevelByPolicy() {
    assertEquals(OperationLogDetailLevel.SUMMARY, policy.resolveDetailLevel("/dataRoom/dataset/run"));
}
```

- [ ] **Step 2: Run the resolver test and verify it fails**

Run: `mvn test -pl dataRoomServer -Dtest=OperationLogResolverTest`

Expected: FAIL because resolver, policy, and annotation types do not exist.

- [ ] **Step 3: Implement annotation, detail level, policy, and resolver**

Use annotation-first resolution with path fallback:

```java
@Target({ElementType.TYPE, ElementType.METHOD})
@Retention(RetentionPolicy.RUNTIME)
public @interface OperationLogMeta {
    String targetType() default "";
    String actionType() default "";
    String actionDesc() default "";
    String businessType() default "";
    String businessName() default "";
    String businessDesc() default "";
    boolean highFrequency() default false;
    OperationLogDetailLevel detailLevel() default OperationLogDetailLevel.DEFAULT;
}
```

```java
public OperationLogResolvedMeta resolve(HttpServletRequest request, HandlerMethod handlerMethod) {
    OperationLogMeta methodMeta = AnnotatedElementUtils.findMergedAnnotation(handlerMethod.getMethod(), OperationLogMeta.class);
    OperationLogMeta classMeta = AnnotatedElementUtils.findMergedAnnotation(handlerMethod.getBeanType(), OperationLogMeta.class);
    OperationLogResolvedMeta base = resolveFromRequestPath(request.getRequestURI(), request.getMethod());
    return merge(base, classMeta, methodMeta, policy.resolveDetailLevel(request.getRequestURI()));
}
```

- [ ] **Step 4: Run the resolver test and verify it passes**

Run: `mvn test -pl dataRoomServer -Dtest=OperationLogResolverTest`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/annotation/OperationLogMeta.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/model/OperationLogDetailLevel.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/model/OperationLogResolvedMeta.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPolicy.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogResolver.java \
  dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogResolverTest.java
git commit -m "feat: add operation log resolver"
```

### Task 3: Request Context And Async Persistence

**Files:**
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/model/OperationLogContext.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogContextHolder.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPublisher.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPersistService.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/OperationLogConfiguration.java`
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogPublisherTest.java`

- [ ] **Step 1: Write the failing async persistence tests**

Create `OperationLogPublisherTest.java` with one happy-path insert assertion and one swallow-exception assertion:

```java
@Test
void publisherPersistsContextWithoutBlockingCaller() {
    OperationLogMapper mapper = mock(OperationLogMapper.class);
    Executor executor = Runnable::run;
    OperationLogPersistService persistService = new OperationLogPersistService(mapper, objectMapper, policy);
    OperationLogPublisher publisher = new OperationLogPublisher(executor, persistService);

    OperationLogContext context = new OperationLogContext();
    context.setRequestUri("/dataRoom/page/publish");
    context.setActionType("publish");
    context.setBusinessType("page_publish");

    publisher.publish(context);

    verify(mapper).insert(any(OperationLogEntity.class));
}

@Test
void publisherSwallowsPersistenceFailure() {
    doThrow(new RuntimeException("db down")).when(mapper).insert(any(OperationLogEntity.class));
    assertDoesNotThrow(() -> publisher.publish(context));
}
```

- [ ] **Step 2: Run the publisher test and verify it fails**

Run: `mvn test -pl dataRoomServer -Dtest=OperationLogPublisherTest`

Expected: FAIL because context, publisher, persist service, and config do not exist.

- [ ] **Step 3: Implement context holder, publisher, persist service, and executor config**

Add a request-scoped context model and dedicated executor:

```java
public class OperationLogContext {
    private String traceId;
    private String requestUri;
    private String requestMethod;
    private String targetType;
    private String actionType;
    private String businessType;
    private String resultStatus;
    private Integer responseCode;
    private String responseMessage;
    private Throwable exception;
    private Date requestTime;
    private long requestStartNanos;
    private Long handlerStartNanos;
    private OperationLogDetailLevel detailLevel = OperationLogDetailLevel.FULL;
}
```

```java
@Bean("operationLogExecutor")
public Executor operationLogExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setThreadNamePrefix("operation-log-");
    executor.setCorePoolSize(2);
    executor.setMaxPoolSize(4);
    executor.setQueueCapacity(200);
    executor.setRejectedExecutionHandler(new ThreadPoolExecutor.DiscardPolicy());
    executor.initialize();
    return executor;
}
```

- [ ] **Step 4: Run the publisher test and verify it passes**

Run: `mvn test -pl dataRoomServer -Dtest=OperationLogPublisherTest`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/model/OperationLogContext.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogContextHolder.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPublisher.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPersistService.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/OperationLogConfiguration.java \
  dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogPublisherTest.java
git commit -m "feat: add operation log async persistence"
```

### Task 4: Web Lifecycle Hooks And Failure Bridging

**Files:**
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogFilter.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogInterceptor.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogResponseAdvice.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogExceptionBridge.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/config/OperationLogConfiguration.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/shiro/ShiroAuthFilter.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/exception/DataRoomExceptionHandler.java`
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogWebFlowTest.java`

- [ ] **Step 1: Write the failing web-flow tests**

Create `OperationLogWebFlowTest.java` with focused servlet and MVC assertions:

```java
@Test
void filterCreatesContextAndPublishesAfterSuccessfulChain() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/dataRoom/page/list");
    MockHttpServletResponse response = new MockHttpServletResponse();
    FilterChain chain = (req, resp) -> ((HttpServletResponse) resp).setStatus(200);

    filter.doFilter(request, response, chain);

    verify(publisher).publish(argThat(context ->
        "/dataRoom/page/list".equals(context.getRequestUri()) &&
        "success".equals(context.getResultStatus())
    ));
}

@Test
void shiroAuthFailureMarksFailureReasonBeforeWriting401() throws Exception {
    MockHttpServletRequest request = new MockHttpServletRequest("GET", "/dataRoom/page/list");
    MockHttpServletResponse response = new MockHttpServletResponse();

    OperationLogContextHolder.set(request, new OperationLogContext());
    shiroAuthFilter.onAccessDenied(request, response);

    assertEquals("auth", OperationLogContextHolder.get(request).getBusinessType());
    assertEquals("failure", OperationLogContextHolder.get(request).getResultStatus());
}
```

- [ ] **Step 2: Run the web-flow test and verify it fails**

Run: `mvn test -pl dataRoomServer -Dtest=OperationLogWebFlowTest`

Expected: FAIL because the filter, interceptor, response advice, and exception bridge do not exist yet.

- [ ] **Step 3: Implement filter, interceptor, response advice, exception bridge, and integration hooks**

Register the filter before Shiro, capture both total and handler timings, and bridge auth / exception failures:

```java
protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
    ContentCachingRequestWrapper requestWrapper = new ContentCachingRequestWrapper(request);
    ContentCachingResponseWrapper responseWrapper = new ContentCachingResponseWrapper(response);
    OperationLogContext context = contextHolder.create(requestWrapper);
    try {
        filterChain.doFilter(requestWrapper, responseWrapper);
        context.markResponseStatus(responseWrapper.getStatus());
    } catch (Exception ex) {
        exceptionBridge.attach(context, ex);
        throw ex;
    } finally {
        publisher.publish(context.complete(requestWrapper, responseWrapper));
        responseWrapper.copyBodyToResponse();
    }
}
```

```java
@Override
public Object beforeBodyWrite(Object body, MethodParameter returnType, MediaType selectedContentType,
                              Class<? extends HttpMessageConverter<?>> selectedConverterType,
                              ServerHttpRequest request, ServerHttpResponse response) {
    if (body instanceof Resp<?> resp) {
        OperationLogContext context = contextHolder.get(((ServletServerHttpRequest) request).getServletRequest());
        context.setResponseCode(resp.getCode());
        context.setResponseMessage(resp.getMessage());
        context.setResultStatus(resp.getCode() != null && resp.getCode() == 200 ? "success" : "failure");
    }
    return body;
}
```

- [ ] **Step 4: Run the web-flow test and verify it passes**

Run: `mvn test -pl dataRoomServer -Dtest=OperationLogWebFlowTest`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogFilter.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogInterceptor.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogResponseAdvice.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/web/OperationLogExceptionBridge.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/shiro/ShiroAuthFilter.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/exception/DataRoomExceptionHandler.java \
  dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogWebFlowTest.java
git commit -m "feat: wire operation log web lifecycle"
```

### Task 5: Controller Annotation Adoption And Sensitive-Field Coverage

**Files:**
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/page/PageController.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/dataset/DatasetController.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/datasource/DataSourceController.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/datasource/ExcelDataSourceController.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/ResourceController.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/map/MapController.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/user/UserController.java`
- Create: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogControllerAnnotationTest.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPolicy.java`

- [ ] **Step 1: Write the failing annotation coverage test**

Create `OperationLogControllerAnnotationTest.java` to lock the key business overrides:

```java
@Test
void publishRunUploadAndLoginEndpointsCarryExplicitOperationMetadata() throws Exception {
    assertNotNull(PageController.class.getMethod("publish", PagePublishDto.class).getAnnotation(OperationLogMeta.class));
    assertNotNull(DatasetController.class.getMethod("run", DatasetRunRequest.class).getAnnotation(OperationLogMeta.class));
    assertNotNull(ResourceController.class.getMethod("upload", MultipartFile.class, MultipartFile.class, String.class, String.class).getAnnotation(OperationLogMeta.class));
    assertNotNull(UserController.class.getMethod("login", Map.class).getAnnotation(OperationLogMeta.class));
}
```

- [ ] **Step 2: Run the annotation coverage test and verify it fails**

Run: `mvn test -pl dataRoomServer -Dtest=OperationLogControllerAnnotationTest`

Expected: FAIL because the controllers do not carry `@OperationLogMeta` yet.

- [ ] **Step 3: Add class defaults, key method overrides, and sensitive-field policy**

Annotate controllers and tighten summary/full plus redaction behavior:

```java
@OperationLogMeta(targetType = "page", businessType = "page", businessName = "页面管理")
@RequestMapping("/dataRoom/page")
public class PageController {

    @OperationLogMeta(
        targetType = "page",
        actionType = "publish",
        actionDesc = "发布页面",
        businessType = "page_publish",
        businessName = "页面发布",
        businessDesc = "发布可视化页面"
    )
    @PostMapping("/publish")
    public Resp<String> publish(@RequestBody PagePublishDto pagePublishDto) { ... }
}
```

Apply the same pattern for the other controller defaults:

```java
@OperationLogMeta(targetType = "dataset", businessType = "dataset", businessName = "数据集管理")
@RequestMapping("/dataRoom/dataset")
public class DatasetController { ... }

@OperationLogMeta(targetType = "datasource", businessType = "datasource", businessName = "数据源管理")
@RequestMapping("/dataRoom/dataSource")
public class DataSourceController { ... }

@OperationLogMeta(targetType = "resource", businessType = "resource", businessName = "素材库")
@RequestMapping("/dataRoom/resource")
public class ResourceController { ... }
```

Add method overrides only to the retrofit checklist endpoints. Leave CRUD methods such as `list/detail/insert/update/delete` untouched so the implementation stays aligned with the approved “do not retrofit every interface” scope.

Use the following method-level annotations directly:

```java
// PageController
@OperationLogMeta(
    actionType = "publish",
    actionDesc = "发布页面",
    businessType = "page_publish",
    businessName = "页面发布",
    businessDesc = "发布可视化页面"
)
public Resp<String> publish(@RequestBody PagePublishDto pagePublishDto) { ... }

@OperationLogMeta(
    actionType = "offline",
    actionDesc = "下线页面",
    businessType = "page_publish",
    businessName = "页面下线"
)
public Resp<Void> offline(@RequestBody PageOfflineDto pageOfflineDto) { ... }

@OperationLogMeta(
    actionType = "update",
    actionDesc = "保存页面配置",
    businessType = "page_design",
    businessName = "页面设计保存"
)
public Resp<String> updatePageConfig(...) { ... }

@OperationLogMeta(
    actionType = "preview",
    actionDesc = "保存预览配置",
    businessType = "page_preview",
    businessName = "页面预览保存"
)
public Resp<String> updatePageConfig4Preview(...) { ... }

@OperationLogMeta(
    actionType = "detail",
    actionDesc = "获取页面配置",
    businessType = "page_preview",
    businessName = "页面配置获取",
    highFrequency = true,
    detailLevel = OperationLogDetailLevel.SUMMARY
)
public Resp<?> getPageConfig(...) { ... }

@OperationLogMeta(
    actionType = "clear",
    actionDesc = "清空页面历史",
    businessType = "page_stage",
    businessName = "页面版本管理"
)
public Resp<Void> stageClear(...) { ... }

@OperationLogMeta(
    actionType = "rollback",
    actionDesc = "回滚页面版本",
    businessType = "page_stage",
    businessName = "页面版本回滚"
)
public Resp<String> stageRollback(...) { ... }
```

```java
// DatasetController
@OperationLogMeta(
    actionType = "run",
    actionDesc = "执行数据集",
    businessType = "dataset_run",
    businessName = "数据集执行",
    highFrequency = true,
    detailLevel = OperationLogDetailLevel.SUMMARY
)
public Resp<DatasetRunResponse> run(@RequestBody DatasetRunRequest datasetRunRequest) { ... }

@OperationLogMeta(
    actionType = "run",
    actionDesc = "测试执行数据集",
    businessType = "dataset_test",
    businessName = "数据集测试执行"
)
public Resp<DatasetRunResponse> runTest(@RequestBody DatasetTestRequest datasetTestRequest) { ... }
```

```java
// ExcelDataSourceController
@OperationLogMeta(
    actionType = "upload",
    actionDesc = "上传解析Excel",
    businessType = "excel_parse",
    businessName = "Excel解析上传"
)
public Resp<ExcelDataSourceService.ExcelParseResult> upload(@RequestParam("file") MultipartFile file) { ... }

@OperationLogMeta(
    actionType = "import",
    actionDesc = "创建并导入Excel数据",
    businessType = "excel_create_import",
    businessName = "Excel建表导入"
)
public Resp<ExcelCreateResponse> createAndImport(@RequestBody ExcelCreateRequest request) { ... }

@OperationLogMeta(
    actionType = "import",
    actionDesc = "重新导入Excel数据",
    businessType = "excel_reimport",
    businessName = "Excel重新导入"
)
public Resp<ReimportResponse> reimport(...) { ... }

@OperationLogMeta(
    actionType = "detail",
    actionDesc = "查看Excel数据",
    businessType = "excel_view_data",
    businessName = "Excel数据查看",
    highFrequency = true,
    detailLevel = OperationLogDetailLevel.SUMMARY
)
public Resp<ExcelDataSourceService.ExcelViewDataResult> viewData(...) { ... }
```

```java
// ResourceController
@OperationLogMeta(
    actionType = "upload",
    actionDesc = "上传素材",
    businessType = "resource_upload",
    businessName = "素材上传"
)
public Resp<ResourceEntity> upload(...) throws IOException { ... }

@OperationLogMeta(
    actionType = "update",
    actionDesc = "更新模型配置",
    businessType = "model_config",
    businessName = "模型配置更新"
)
public Resp<Void> updateModelConfig(...) { ... }

@OperationLogMeta(
    actionType = "upload",
    actionDesc = "上传模型封面",
    businessType = "model_cover",
    businessName = "模型封面上传"
)
public Resp<String> uploadModelCover(...) throws IOException { ... }
```

```java
// UserController and CaptchaController
@OperationLogMeta(
    targetType = "user",
    actionType = "login",
    actionDesc = "用户登录",
    businessType = "auth_login",
    businessName = "用户登录"
)
public Resp<String> login(@RequestBody Map<String, String> params) { ... }

@OperationLogMeta(
    actionType = "update",
    actionDesc = "更新个人资料",
    businessType = "user_profile",
    businessName = "个人资料维护"
)
public Resp<Void> updateProfile(@RequestBody UserProfileDTO dto) { ... }

@OperationLogMeta(
    targetType = "captcha",
    actionType = "generate",
    actionDesc = "生成验证码",
    businessType = "auth_captcha",
    businessName = "验证码生成"
)
public Resp<?> generate() { ... }
```

```java
public boolean isSensitiveField(String fieldName) {
    return Set.of("password", "oldPassword", "newPassword", "token", "authorization", "cookie",
            "secret", "accessKey", "secretKey", "privateKey").contains(fieldName);
}
```

- [ ] **Step 4: Run the annotation coverage test and existing controller tests**

Run:

- `mvn test -pl dataRoomServer -Dtest=OperationLogControllerAnnotationTest`
- `mvn test -pl dataRoomServer -Dtest=UserControllerTest,DataSourceControllerTest`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/core/page/PageController.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/dataset/DatasetController.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/datasource/DataSourceController.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/datasource/ExcelDataSourceController.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/resources/ResourceController.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/map/MapController.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/user/UserController.java \
  dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/service/OperationLogPolicy.java \
  dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog/OperationLogControllerAnnotationTest.java
git commit -m "feat: annotate operation log business semantics"
```

### Task 6: End-To-End Verification And Cleanup

**Files:**
- Verify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog/**`
- Verify: `dataRoomServer/src/main/resources/db/dataroom_h2.all.sql`
- Verify: `doc/sql/mysql/dataroom_mysql.all.sql`
- Verify: `doc/sql/pg/dataroom_pg.all.sql`

- [ ] **Step 1: Run all focused operation-log tests**

Run:

```bash
mvn test -pl dataRoomServer -Dtest=OperationLogSchemaTest,OperationLogResolverTest,OperationLogPublisherTest,OperationLogWebFlowTest,OperationLogControllerAnnotationTest
```

Expected: PASS.

- [ ] **Step 2: Run affected existing backend tests**

Run:

```bash
mvn test -pl dataRoomServer -Dtest=UserControllerTest,DataSourceControllerTest,ShiroAuthRealmTest
```

Expected: PASS.

- [ ] **Step 3: Run the full dataRoomServer test suite**

Run:

```bash
mvn test -pl dataRoomServer
```

Expected: PASS, or only unrelated pre-existing failures. If failures are unrelated, capture exact class names and output.

- [ ] **Step 4: Verify no forbidden leaks remain**

Run:

```bash
rg -n "password|secretKey|privateKey|authorization|cookie" dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog
```

Expected: only the intended redaction list and policy code remain; no literal sensitive values or accidental logging of raw credentials.

- [ ] **Step 5: Commit**

```bash
git add dataRoomServer/src/main/java/com/gccloud/gcpaas/core/operationlog \
  dataRoomServer/src/main/resources/db/dataroom_h2.all.sql \
  doc/sql/mysql/dataroom_mysql.all.sql \
  doc/sql/pg/dataroom_pg.all.sql \
  dataRoomServer/src/test/java/com/gccloud/gcpaas/core/operationlog
git commit -m "test: verify operation log implementation"
```
