package com.gccloud.gcpaas.core.page.service;

import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.MybatisMapperBuilderAssistant;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import com.gccloud.gcpaas.dataroom.core.constant.PageType;
import com.gccloud.gcpaas.dataroom.core.entity.PageEntity;
import com.gccloud.gcpaas.dataroom.core.entity.PageStageEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.mapper.PageMapper;
import com.gccloud.gcpaas.dataroom.core.page.bean.PageConfig;
import com.gccloud.gcpaas.dataroom.core.page.service.PageService;
import com.gccloud.gcpaas.dataroom.core.page.service.PageStageService;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PageServiceCopyTest {

    @BeforeAll
    static void initTableInfo() {
        TableInfoHelper.initTableInfo(new MybatisMapperBuilderAssistant(new MybatisConfiguration(), ""), PageEntity.class);
        TableInfoHelper.initTableInfo(new MybatisMapperBuilderAssistant(new MybatisConfiguration(), ""), PageStageEntity.class);
    }

    @Test
    void copyDesignIsTransactional() throws Exception {
        Method method = PageService.class.getMethod("copyDesign", String.class);

        assertNotNull(method.getAnnotation(Transactional.class));
    }

    @Test
    void copyDesignCreatesNewPageAndOnlyDesignStageWithNewCode() {
        PageMapper pageMapper = mock(PageMapper.class);
        PageStageService pageStageService = mock(PageStageService.class);
        PageService pageService = newService(pageMapper, pageStageService);
        PageEntity sourcePage = page("source-code");
        PageConfig pageConfig = new PageConfig();
        PageStageEntity sourceDesign = stage("source-code", PageStatus.DESIGN, pageConfig);
        when(pageMapper.getByCode("source-code")).thenReturn(sourcePage);
        when(pageMapper.insert(any(PageEntity.class))).thenReturn(1);
        when(pageStageService.getByCode("source-code", PageStatus.DESIGN)).thenReturn(sourceDesign);
        when(pageStageService.save(any(PageStageEntity.class))).thenReturn(true);

        String newCode = pageService.copyDesign("source-code");

        ArgumentCaptor<PageEntity> pageCaptor = ArgumentCaptor.forClass(PageEntity.class);
        ArgumentCaptor<PageStageEntity> stageCaptor = ArgumentCaptor.forClass(PageStageEntity.class);
        verify(pageMapper, times(1)).insert(pageCaptor.capture());
        verify(pageStageService, times(1)).save(stageCaptor.capture());

        PageEntity copiedPage = pageCaptor.getValue();
        assertEquals(newCode, copiedPage.getCode());
        assertNotEquals("source-code", copiedPage.getCode());
        assertEquals("经营看板-副本", copiedPage.getName());
        assertEquals(PageType.PAGE, copiedPage.getPageType());
        assertEquals(PageStatus.DESIGN, copiedPage.getPageStatus());
        assertEquals("folder-1", copiedPage.getParentCode());
        assertEquals("业务说明", copiedPage.getRemark());
        assertEquals("/dataRoom/resource/file/cover-1/thumbnail", copiedPage.getThumbnail());
        assertNull(copiedPage.getId());
        assertNull(copiedPage.getCreateDate());
        assertNull(copiedPage.getUpdateDate());
        assertNull(copiedPage.getCreateUser());
        assertNull(copiedPage.getUpdateUser());
        assertNull(copiedPage.getTenantCode());

        PageStageEntity copiedStage = stageCaptor.getValue();
        assertEquals(newCode, copiedStage.getPageCode());
        assertEquals(PageStatus.DESIGN, copiedStage.getPageStatus());
        assertEquals(PageType.PAGE, copiedStage.getPageType());
        assertEquals("复制自 source-code", copiedStage.getRemark());
        assertSame(pageConfig, copiedStage.getPageConfig());
        assertNull(copiedStage.getId());
        assertNull(copiedStage.getCreateDate());
        assertNull(copiedStage.getUpdateDate());
        assertNull(copiedStage.getCreateUser());
        assertNull(copiedStage.getUpdateUser());
        assertNull(copiedStage.getTenantCode());
    }

    @Test
    void copyDesignRejectsMissingSourcePage() {
        PageMapper pageMapper = mock(PageMapper.class);
        PageStageService pageStageService = mock(PageStageService.class);
        PageService pageService = newService(pageMapper, pageStageService);
        when(pageMapper.getByCode("missing")).thenReturn(null);

        DataRoomException exception = assertThrows(DataRoomException.class, () -> pageService.copyDesign("missing"));

        assertEquals("页面不存在", exception.getMessage());
        verify(pageMapper, never()).insert(any(PageEntity.class));
        verify(pageStageService, never()).save(any(PageStageEntity.class));
    }

    @Test
    void copyDesignRejectsMissingDesignStage() {
        PageMapper pageMapper = mock(PageMapper.class);
        PageStageService pageStageService = mock(PageStageService.class);
        PageService pageService = newService(pageMapper, pageStageService);
        when(pageMapper.getByCode("source-code")).thenReturn(page("source-code"));
        when(pageStageService.getByCode("source-code", PageStatus.DESIGN)).thenReturn(null);

        DataRoomException exception = assertThrows(DataRoomException.class, () -> pageService.copyDesign("source-code"));

        assertEquals("页面设计态不存在", exception.getMessage());
        verify(pageMapper, never()).insert(any(PageEntity.class));
        verify(pageStageService, never()).save(any(PageStageEntity.class));
    }

    private static PageService newService(PageMapper pageMapper, PageStageService pageStageService) {
        PageService service = new PageService();
        ReflectionTestUtils.setField(service, "baseMapper", pageMapper);
        ReflectionTestUtils.setField(service, "pageStageService", pageStageService);
        return service;
    }

    private static PageEntity page(String code) {
        PageEntity page = new PageEntity();
        page.setId("source-id");
        page.setCode(code);
        page.setName("经营看板");
        page.setPageType(PageType.PAGE);
        page.setPageStatus(PageStatus.PUBLISHED);
        page.setParentCode("folder-1");
        page.setRemark("业务说明");
        page.setThumbnail("/dataRoom/resource/file/cover-1/thumbnail");
        page.setCreateDate(new Date(1));
        page.setUpdateDate(new Date(2));
        page.setCreateUser("old-creator");
        page.setUpdateUser("old-updater");
        page.setTenantCode("old-tenant");
        return page;
    }

    private static PageStageEntity stage(String pageCode, PageStatus status, PageConfig pageConfig) {
        PageStageEntity stage = new PageStageEntity();
        stage.setId(status.name() + "-id");
        stage.setPageCode(pageCode);
        stage.setPageStatus(status);
        stage.setPageType(PageType.PAGE);
        stage.setRemark(status.name());
        stage.setPageConfig(pageConfig);
        stage.setCreateDate(new Date(3));
        stage.setUpdateDate(new Date(4));
        stage.setCreateUser("old-stage-creator");
        stage.setUpdateUser("old-stage-updater");
        stage.setTenantCode("old-tenant");
        return stage;
    }
}
