# Page Share Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add share-link management for DataRoom pages and visual screens using `share_` tokens carried by the existing `dataRoomToken` URL parameter.

**Architecture:** Add a single-row-per-page `dr_page_share` persistence model and service layer, then extend Shiro authentication to recognize `share_` tokens as database-backed, revocable `sharer` identities. The frontend reuses the page list and existing preview routes, adding a share dialog that manages enabled state, expiration, IP whitelist, token refresh, and link copy.

**Tech Stack:** Spring Boot 3.5, MyBatis-Plus, Shiro 2 Jakarta, H2 init SQL, JUnit 5/Mockito; Vue 3, TypeScript, Vite, Element Plus.

---

## File Map

Backend creates:

- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/entity/PageShareEntity.java`: MyBatis entity for `dr_page_share`.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/mapper/PageShareMapper.java`: mapper with `DataRoomMapper` conventions plus token lookup helpers.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/dto/PageShareSaveDto.java`: save request DTO.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/vo/PageShareVo.java`: response VO including `shareUrl`.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/service/ClientAccessService.java`: client IP extraction and exact/CIDR whitelist validation.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/service/PageShareService.java`: token generation, save, detail, share auth validation, URL building.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/PageShareController.java`: developer-only share management endpoints.
- `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/service/ClientAccessServiceTest.java`: IP and whitelist unit tests.
- `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/service/PageShareServiceTest.java`: share token and save/validate behavior tests.

Backend modifies:

- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/shiro/ShiroAuthRealm.java`: route `share_` tokens to `PageShareService`, return `LoginUser` with `sharer` role.
- `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/shiro/ShiroAuthRealmTest.java`: add share token auth test.
- `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/PageController.java`: delete page share record when deleting a page.
- `dataRoomServer/src/main/resources/h2/dataroom_h2.all.sql`: create `dr_page_share` table and indexes.
- `doc/sql/dataroom_mysql.all.sql`: document MySQL `dr_page_share` table and indexes.
- `doc/sql/dataroom_pg.all.sql`: document PostgreSQL `dr_page_share` table, comments, and indexes.

Frontend creates:

- `dataRoomFront/src/dataRoom/page/components/PageShareDialog.vue`: Element Plus share management dialog.

Frontend modifies:

- `dataRoomFront/src/dataRoom/page/api.ts`: add share DTO/VO types and `pageApi.shareDetail`, `pageApi.shareSave`.
- `dataRoomFront/src/dataRoom/page/index.vue`: add menu item, dialog state, share open handler.

## Task 1: Backend Share Model, Services, and Tests

**Files:**

- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/entity/PageShareEntity.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/mapper/PageShareMapper.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/dto/PageShareSaveDto.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/vo/PageShareVo.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/service/ClientAccessService.java`
- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/service/PageShareService.java`
- Modify: `dataRoomServer/src/main/resources/h2/dataroom_h2.all.sql`
- Modify: `doc/sql/dataroom_mysql.all.sql`
- Modify: `doc/sql/dataroom_pg.all.sql`
- Test: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/service/ClientAccessServiceTest.java`
- Test: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/page/service/PageShareServiceTest.java`

- [ ] **Step 1: Write failing tests for client IP and whitelist behavior**

Create `ClientAccessServiceTest` with these cases:

```java
@Test
void resolveClientIpPrefersForwardedForFirstAddress() {
    MockHttpServletRequest request = new MockHttpServletRequest();
    request.addHeader("X-Forwarded-For", "203.0.113.10, 10.0.0.2");
    request.addHeader("X-Real-IP", "198.51.100.7");
    assertEquals("203.0.113.10", service.resolveClientIp(request));
}

@Test
void whitelistAllowsEmptyExactIpAndCidr() {
    assertTrue(service.matchesWhitelist("192.168.1.10", ""));
    assertTrue(service.matchesWhitelist("192.168.1.10", "192.168.1.10"));
    assertTrue(service.matchesWhitelist("192.168.1.20", "192.168.1.0/24"));
    assertTrue(service.matchesWhitelist("2001:db8::8", "2001:db8::/64"));
    assertFalse(service.matchesWhitelist("192.168.2.20", "192.168.1.0/24"));
}

@Test
void validateWhitelistReportsLineNumber() {
    DataRoomException error = assertThrows(DataRoomException.class,
            () -> service.validateWhitelist("192.168.1.1\nnot-an-ip"));
    assertTrue(error.getMessage().contains("第 2 行"));
}
```

- [ ] **Step 2: Write failing tests for share save and validation behavior**

Create `PageShareServiceTest` using Mockito for `PageShareMapper`, `PageMapper`, and `HttpServletRequest`. Cover:

- first save creates token beginning with `share_`;
- existing save with `refreshToken=false` preserves token and updates config;
- existing save with `refreshToken=true` changes token;
- expired save request throws `DataRoomException("过期时间不能早于当前时间")`;
- `authenticateShareToken` rejects disabled, expired, unpublished, and IP-mismatched records;
- `authenticateShareToken` returns a `LoginUser` whose role is `sharer`.

- [ ] **Step 3: Run backend tests and confirm failure**

Run:

```bash
mvn -q -pl dataRoomServer -Dtest=ClientAccessServiceTest,PageShareServiceTest test
```

Expected: FAIL because classes do not exist.

- [ ] **Step 4: Implement entity, mapper, DTO, VO, H2 schema, ClientAccessService, PageShareService**

Implementation requirements:

- `PageShareEntity` extends `BaseEntity` and maps to `dr_page_share`.
- `PageShareMapper` extends `DataRoomMapper<PageShareEntity>` and provides default helper methods using `LambdaQueryWrapper`:
  - `getByPageCode(String pageCode)`
  - `getByToken(String token)`
  - `deleteByPageCode(String pageCode)`
- `PageShareSaveDto` fields: `pageCode`, `enabled`, `expireTime`, `ipWhitelist`, `refreshToken`.
- `PageShareVo` fields: `pageCode`, `pageType`, `enabled`, `expireTime`, `ipWhitelist`, `token`, `shareUrl`, `created`.
- `ClientAccessService` resolves `X-Forwarded-For`, then `X-Real-IP`, then `remoteAddr`; validates and matches exact IP/CIDR for IPv4 and IPv6 using `InetAddress` and byte masks.
- `PageShareService.save(PageShareSaveDto, HttpServletRequest)` validates page exists and is not a directory, validates expiration is not before now, validates whitelist, creates or updates one record per page, and returns `PageShareVo`.
- `PageShareService.authenticateShareToken(String token, HttpServletRequest request)` uses full `share_` token, validates enabled/expiration/page published/IP whitelist, and returns `LoginUser` with account `share`, username `分享访问者`, role `sharer`, status normal.
- `PageShareService.buildShareUrl(...)` uses request scheme, server name, server port, context path, page type, `published`, page code, and token.
- H2, MySQL, and PostgreSQL SQL files add `dr_page_share` after `dr_page`, with unique `page_code`, index on `token`, and BaseEntity audit columns. PostgreSQL also adds table and column comments consistent with the surrounding file.

- [ ] **Step 5: Run backend tests and confirm pass**

Run:

```bash
mvn -q -pl dataRoomServer -Dtest=ClientAccessServiceTest,PageShareServiceTest test
```

Expected: PASS.

## Task 2: Backend API and Shiro Integration

**Files:**

- Create: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/PageShareController.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/shiro/ShiroAuthRealm.java`
- Modify: `dataRoomServer/src/test/java/com/gccloud/gcpaas/core/shiro/ShiroAuthRealmTest.java`
- Modify: `dataRoomServer/src/main/java/com/gccloud/gcpaas/dataroom/core/page/PageController.java`
- Test: existing and new Shiro tests

- [ ] **Step 1: Add Shiro share-token failing test**

In `ShiroAuthRealmTest`, add a test that injects a mocked `PageShareService`, invokes `doGetAuthenticationInfo` with `new ShiroAuthToken("share_abc")`, and asserts:

- `PageShareService.authenticateShareToken("share_abc", requestOrNull)` is used;
- returned principal has role `sharer`;
- `userService` and JWT parsing path are not required.

- [ ] **Step 2: Implement PageShareController**

Add:

```java
@RestController
@Controller
@Tag(name = "页面分享")
@RequestMapping("/dataRoom/page/share")
public class PageShareController {
    @Resource
    private PageShareService pageShareService;

    @GetMapping("/detail/{pageCode}")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    public Resp<PageShareVo> detail(@PathVariable("pageCode") String pageCode, HttpServletRequest request) {
        return Resp.success(pageShareService.detail(pageCode, request));
    }

    @PostMapping("/save")
    @RequiresRoles(value = DataRoomRole.DEVELOPER)
    public Resp<PageShareVo> save(@RequestBody PageShareSaveDto dto, HttpServletRequest request) {
        return Resp.success(pageShareService.save(dto, request));
    }
}
```

- [ ] **Step 3: Extend ShiroAuthRealm**

Inject `PageShareService`. At the start of `doGetAuthenticationInfo` after blank/null checks:

```java
if (PageShareService.isShareToken(accessToken)) {
    LoginUser shareUser = pageShareService.authenticateShareToken(accessToken, currentRequestOrNull());
    return new SimpleAuthenticationInfo(shareUser, token.getPrincipal(), getName());
}
```

Use `RequestContextHolder` to fetch the current `HttpServletRequest`; tolerate `null` for unit tests.

- [ ] **Step 4: Clean share record on page delete**

Inject `PageShareService` or `PageShareMapper` into `PageController`. In `delete(String pageCode)`, remove share record for that page after removing stages and page record.

- [ ] **Step 5: Run targeted backend tests**

Run:

```bash
mvn -q -pl dataRoomServer -Dtest=ShiroAuthRealmTest,PageShareServiceTest,ClientAccessServiceTest test
```

Expected: PASS.

## Task 3: Frontend Share API and Dialog

**Files:**

- Modify: `dataRoomFront/src/dataRoom/page/api.ts`
- Create: `dataRoomFront/src/dataRoom/page/components/PageShareDialog.vue`
- Modify: `dataRoomFront/src/dataRoom/page/index.vue`

- [ ] **Step 1: Add page share API types and methods**

In `page/api.ts`, add:

```ts
export interface PageShareVo {
  pageCode: string
  pageType?: string
  enabled: boolean
  expireTime?: string | null
  ipWhitelist?: string
  token?: string
  shareUrl?: string
  created?: boolean
}

export interface PageShareSaveDto {
  pageCode: string
  enabled: boolean
  expireTime?: string | null
  ipWhitelist?: string
  refreshToken: boolean
}
```

Add methods:

```ts
shareDetail(pageCode: string) {
  return request.get<PageShareVo>(`/dataRoom/page/share/detail/${pageCode}`)
},
shareSave(data: PageShareSaveDto) {
  return request.post<PageShareVo>('/dataRoom/page/share/save', data)
},
```

- [ ] **Step 2: Create PageShareDialog.vue**

Use `el-dialog`, `el-form`, `el-switch`, `el-button`, `el-date-picker`, `el-input` textarea, readonly link input, and copy button. Props: `modelValue`, `page`. Emits: `update:modelValue`. Behavior:

- fetch share detail on open;
- quick buttons set expiration to null, +1 day, +7 days, +1 month;
- if existing token exists, `生成分享链接` prompts whether to invalidate historical link;
- save with `refreshToken` according to confirm choice;
- update displayed `shareUrl` from backend response;
- copy button uses `navigator.clipboard.writeText`;
- no Element Plus internal selector overrides, no hard-coded colors.

- [ ] **Step 3: Wire dialog into page list**

In `index.vue`:

- import `Share` icon if available or use existing icon set conservatively;
- add `shareDialogVisible` and `sharingPage`;
- add `handleShare(item)` to set page and open dialog;
- add dropdown item `分享` for `canOperatePage(item)`;
- add case `share`;
- render `<PageShareDialog v-model="shareDialogVisible" :page="sharingPage" />`.

- [ ] **Step 4: Run frontend checks**

Run:

```bash
npm run type-check
npm run lint
```

from `dataRoomFront`.

Expected: PASS.

## Task 4: Full Verification and Final Review

**Files:**

- All files touched by Tasks 1-3.

- [ ] **Step 1: Run backend target tests**

Run:

```bash
mvn -q -pl dataRoomServer -Dtest=ClientAccessServiceTest,PageShareServiceTest,ShiroAuthRealmTest test
```

Expected: PASS.

- [ ] **Step 2: Run catch-block logging test if catch blocks changed**

If implementation added or modified Java `catch` blocks, run:

```bash
mvn -q -pl dataRoomServer -Dtest=CatchBlockLoggingTest -DforkCount=0 test
```

Expected: PASS.

- [ ] **Step 3: Run frontend checks**

Run:

```bash
cd dataRoomFront
npm run type-check
npm run lint
```

Expected: PASS.

- [ ] **Step 4: Review scope**

Verify:

- one page has one share record;
- `share_` token bypasses default JWT/SSO parsing and uses database validation;
- token refresh invalidates old links;
- token preservation updates limits immediately;
- disabled sharing still shows copyable URL but rejects access;
- unpublished page can have a link but rejects access until published;
- share entry appears for non-directory pages;
- no hard-coded CSS colors or Element Plus internal overrides were introduced.

- [ ] **Step 5: Commit implementation**

Commit all implementation changes on branch `page-share`:

```bash
git add dataRoomServer dataRoomFront docs/superpowers/plans/2026-06-28-page-share-implementation.md
git commit -m "feat: add page share links"
```
