package com.gccloud.gcpaas.core.page.service;

import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import com.gccloud.gcpaas.dataroom.core.constant.PageType;
import com.gccloud.gcpaas.dataroom.core.entity.PageEntity;
import com.gccloud.gcpaas.dataroom.core.entity.PageShareEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.PageMapper;
import com.gccloud.gcpaas.dataroom.core.mapper.PageShareMapper;
import com.gccloud.gcpaas.dataroom.core.page.dto.PageShareSaveDto;
import com.gccloud.gcpaas.dataroom.core.page.service.ClientAccessService;
import com.gccloud.gcpaas.dataroom.core.page.service.PageShareService;
import com.gccloud.gcpaas.dataroom.core.page.vo.PageShareVo;
import com.gccloud.gcpaas.dataroom.core.shiro.LoginUser;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Date;
import java.util.HashMap;
import java.util.concurrent.atomic.AtomicReference;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PageShareServiceTest {

    private PageShareMapper pageShareMapper;
    private PageMapper pageMapper;
    private PageShareService service;

    @BeforeEach
    void setUp() {
        pageShareMapper = mock(PageShareMapper.class);
        pageMapper = mock(PageMapper.class);
        service = new PageShareService();
        ReflectionTestUtils.setField(service, "pageShareMapper", pageShareMapper);
        ReflectionTestUtils.setField(service, "pageMapper", pageMapper);
        ReflectionTestUtils.setField(service, "clientAccessService", new ClientAccessService());
    }

    @Test
    void firstSaveCreatesShareTokenWithPrefix() {
        when(pageMapper.getByCode("page_1")).thenReturn(page("page_1", PageType.PAGE, PageStatus.DESIGN));
        when(pageShareMapper.getByPageCode("page_1")).thenReturn(null);
        AtomicReference<PageShareEntity> inserted = new AtomicReference<>();
        when(pageShareMapper.insert(any(PageShareEntity.class))).thenAnswer(invocation -> {
            inserted.set(invocation.getArgument(0));
            return 1;
        });

        PageShareVo vo = service.save(dto("page_1", true, false), request());

        assertNotNull(inserted.get());
        assertTrue(inserted.get().getToken().startsWith(PageShareService.SHARE_TOKEN_PREFIX));
        assertEquals(inserted.get().getToken(), vo.getToken());
        assertTrue(vo.getShareUrl().contains("dataRoomToken=" + inserted.get().getToken()));
    }

    @Test
    void existingSaveWithoutRefreshPreservesTokenAndUpdatesConfig() {
        PageShareEntity existing = share("page_1", "share_existing", true, null, "");
        when(pageMapper.getByCode("page_1")).thenReturn(page("page_1", PageType.PAGE, PageStatus.DESIGN));
        when(pageShareMapper.getByPageCode("page_1")).thenReturn(existing);
        AtomicReference<PageShareEntity> updated = new AtomicReference<>();
        when(pageShareMapper.updateById(any(PageShareEntity.class))).thenAnswer(invocation -> {
            updated.set(invocation.getArgument(0));
            return 1;
        });

        PageShareSaveDto dto = dto("page_1", false, false);
        dto.setIpWhitelist("192.168.1.0/24");
        PageShareVo vo = service.save(dto, request());

        assertEquals("share_existing", updated.get().getToken());
        assertEquals("share_existing", vo.getToken());
        assertEquals(false, updated.get().getEnabled());
        assertEquals("192.168.1.0/24", updated.get().getIpWhitelist());
    }

    @Test
    void existingSaveWithRefreshChangesToken() {
        PageShareEntity existing = share("page_1", "share_existing", true, null, "");
        when(pageMapper.getByCode("page_1")).thenReturn(page("page_1", PageType.PAGE, PageStatus.DESIGN));
        when(pageShareMapper.getByPageCode("page_1")).thenReturn(existing);
        AtomicReference<PageShareEntity> updated = new AtomicReference<>();
        when(pageShareMapper.updateById(any(PageShareEntity.class))).thenAnswer(invocation -> {
            updated.set(invocation.getArgument(0));
            return 1;
        });

        PageShareVo vo = service.save(dto("page_1", true, true), request());

        assertTrue(updated.get().getToken().startsWith(PageShareService.SHARE_TOKEN_PREFIX));
        assertNotEquals("share_existing", updated.get().getToken());
        assertEquals(updated.get().getToken(), vo.getToken());
    }

    @Test
    void expiredSaveRequestThrows() {
        PageShareSaveDto dto = dto("page_1", true, false);
        dto.setExpireTime(new Date(System.currentTimeMillis() - 1000L));

        DataRoomException error = assertThrows(DataRoomException.class, () -> service.save(dto, request()));

        assertEquals("过期时间不能早于当前时间", error.getMessage());
    }

    @Test
    void authenticateShareTokenRejectsDisabledExpiredUnpublishedAndIpMismatch() {
        assertAuthRejected(share("page_1", "share_disabled", false, null, ""), PageStatus.PUBLISHED, "分享链接已停用");
        assertAuthRejected(share("page_1", "share_expired", true, new Date(System.currentTimeMillis() - 1000L), ""), PageStatus.PUBLISHED, "分享链接已过期");
        assertAuthRejected(share("page_1", "share_unpublished", true, null, ""), PageStatus.DESIGN, "页面未发布或不存在");
        assertAuthRejected(share("page_1", "share_ip", true, null, "203.0.113.0/24"), PageStatus.PUBLISHED, "当前 IP 不允许访问该分享链接");
    }

    @Test
    void authenticateShareTokenReturnsSharerLoginUser() {
        PageShareEntity share = share("page_1", "share_valid", true, null, "192.168.1.0/24");
        when(pageShareMapper.getByToken("share_valid")).thenReturn(share);
        when(pageMapper.getByCode("page_1")).thenReturn(page("page_1", PageType.PAGE, PageStatus.PUBLISHED));

        LoginUser user = service.authenticateShareToken("share_valid", request());

        assertEquals("share", user.getAccount());
        assertEquals("分享访问者", user.getUsername());
        assertEquals(DataRoomRole.SHARER, user.getRole());
        assertEquals(DataRoomRole.SHARER, user.getRoleCodeList().get(0));
        assertEquals(true, user.getExtProps().get(PageShareService.SHARE_EXT_FLAG));
        assertEquals("page_1", user.getExtProps().get(PageShareService.SHARE_EXT_PAGE_CODE));
    }

    @Test
    void assertShareAccessOnlyAllowsSharedPublishedPage() {
        LoginUser shareUser = shareUser("page_1");

        service.assertShareAccessToPage(shareUser, "page_1", PageStatus.PUBLISHED);

        DataRoomException wrongPage = assertThrows(DataRoomException.class,
                () -> service.assertShareAccessToPage(shareUser, "page_2", PageStatus.PUBLISHED));
        DataRoomException wrongStatus = assertThrows(DataRoomException.class,
                () -> service.assertShareAccessToPage(shareUser, "page_1", PageStatus.DESIGN));

        assertEquals("页面未发布或不存在", wrongPage.getMessage());
        assertEquals("页面未发布或不存在", wrongStatus.getMessage());
    }

    @Test
    void deleteByPageCodeDelegatesToMapper() {
        service.deleteByPageCode("page_1");

        verify(pageShareMapper).deleteByPageCode("page_1");
    }

    private void assertAuthRejected(PageShareEntity share, PageStatus pageStatus, String message) {
        when(pageShareMapper.getByToken(share.getToken())).thenReturn(share);
        when(pageMapper.getByCode(share.getPageCode())).thenReturn(page("page_1", PageType.PAGE, pageStatus));

        DataRoomException error = assertThrows(DataRoomException.class,
                () -> service.authenticateShareToken(share.getToken(), request()));

        assertEquals(message, error.getMessage());
    }

    private PageShareSaveDto dto(String pageCode, boolean enabled, boolean refreshToken) {
        PageShareSaveDto dto = new PageShareSaveDto();
        dto.setPageCode(pageCode);
        dto.setEnabled(enabled);
        dto.setRefreshToken(refreshToken);
        return dto;
    }

    private PageEntity page(String code, PageType pageType, PageStatus pageStatus) {
        PageEntity page = new PageEntity();
        page.setCode(code);
        page.setPageType(pageType);
        page.setPageStatus(pageStatus);
        return page;
    }

    private PageShareEntity share(String pageCode, String token, boolean enabled, Date expireTime, String ipWhitelist) {
        PageShareEntity share = new PageShareEntity();
        share.setPageCode(pageCode);
        share.setPageType(PageType.PAGE);
        share.setToken(token);
        share.setEnabled(enabled);
        share.setExpireTime(expireTime);
        share.setIpWhitelist(ipWhitelist);
        return share;
    }

    private LoginUser shareUser(String pageCode) {
        LoginUser loginUser = new LoginUser();
        loginUser.setRole(DataRoomRole.SHARER);
        HashMap<String, Object> extProps = new HashMap<>();
        extProps.put(PageShareService.SHARE_EXT_FLAG, true);
        extProps.put(PageShareService.SHARE_EXT_PAGE_CODE, pageCode);
        loginUser.setExtProps(extProps);
        return loginUser;
    }

    private HttpServletRequest request() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.setScheme("http");
        request.setServerName("localhost");
        request.setServerPort(8081);
        request.setContextPath("/dataRoom");
        request.setRemoteAddr("192.168.1.10");
        return request;
    }
}
