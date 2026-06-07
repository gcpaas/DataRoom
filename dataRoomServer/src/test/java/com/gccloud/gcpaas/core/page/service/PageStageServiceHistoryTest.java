package com.gccloud.gcpaas.core.page.service;

import com.alibaba.fastjson2.JSONObject;
import com.gccloud.gcpaas.core.constant.PageStatus;
import com.gccloud.gcpaas.core.constant.PageType;
import com.gccloud.gcpaas.core.entity.PageStageEntity;
import com.gccloud.gcpaas.core.exception.DataRoomException;
import com.gccloud.gcpaas.core.mapper.PageStageMapper;
import com.gccloud.gcpaas.core.page.bean.PageConfig;
import com.gccloud.gcpaas.core.page.dto.PageHistoryBackupDto;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.Method;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertNotSame;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class PageStageServiceHistoryTest {

    @Test
    void historyMutationMethodsAreTransactional() throws Exception {
        Method backupMethod = PageStageService.class.getMethod("backupHistory", PageHistoryBackupDto.class);
        Method rollbackMethod = PageStageService.class.getMethod("rollbackDesignByHistoryId", String.class);

        assertNotNull(backupMethod.getAnnotation(Transactional.class));
        assertNotNull(rollbackMethod.getAnnotation(Transactional.class));
    }

    @Test
    void backupHistoryAlwaysCreatesNewHistoryRowFromDto() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageConfig pageConfig = pageConfig("manual");
        PageHistoryBackupDto dto = new PageHistoryBackupDto();
        dto.setPageCode("page-1");
        dto.setRemark("手动保存自动备份");
        dto.setPageType(PageType.PAGE);
        dto.setPageConfig(pageConfig);
        when(mapper.insert(any(PageStageEntity.class))).thenReturn(1);

        String id = service.backupHistory(dto);

        ArgumentCaptor<PageStageEntity> captor = ArgumentCaptor.forClass(PageStageEntity.class);
        verify(mapper, times(1)).insert(captor.capture());
        PageStageEntity saved = captor.getValue();
        assertEquals("page-1", saved.getPageCode());
        assertEquals("手动保存自动备份", saved.getRemark());
        assertEquals(PageType.PAGE, saved.getPageType());
        assertEquals(PageStatus.HISTORY, saved.getPageStatus());
        assertSame(pageConfig, saved.getPageConfig());
        assertEquals(saved.getId(), id);
    }

    @Test
    void backupHistoryCreatesNewHistoryRowEvenWhenContentIsIdentical() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageConfig pageConfig = pageConfig("same-version");
        PageHistoryBackupDto dto = new PageHistoryBackupDto();
        dto.setPageCode("page-1");
        dto.setRemark("自动备份");
        dto.setPageType(PageType.PAGE);
        dto.setPageConfig(pageConfig);
        when(mapper.insert(any(PageStageEntity.class))).thenReturn(1);

        service.backupHistory(dto);
        service.backupHistory(dto);

        ArgumentCaptor<PageStageEntity> captor = ArgumentCaptor.forClass(PageStageEntity.class);
        verify(mapper, times(2)).insert(captor.capture());
        PageStageEntity firstSaved = captor.getAllValues().get(0);
        PageStageEntity secondSaved = captor.getAllValues().get(1);
        assertNotSame(firstSaved, secondSaved);
        assertEquals("page-1", firstSaved.getPageCode());
        assertEquals("page-1", secondSaved.getPageCode());
        assertEquals(PageStatus.HISTORY, firstSaved.getPageStatus());
        assertEquals(PageStatus.HISTORY, secondSaved.getPageStatus());
        assertSame(pageConfig, firstSaved.getPageConfig());
        assertSame(pageConfig, secondSaved.getPageConfig());
    }

    @Test
    void backupHistoryRejectsBlankPageCode() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageHistoryBackupDto dto = new PageHistoryBackupDto();
        dto.setPageCode("  ");
        dto.setRemark("自动备份");
        dto.setPageType(PageType.PAGE);
        dto.setPageConfig(pageConfig("manual"));

        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.backupHistory(dto));

        assertEquals("页面编码不能为空", exception.getMessage());
        verify(mapper, never()).insert(any(PageStageEntity.class));
    }

    @Test
    void backupHistoryRejectsMissingPageType() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageHistoryBackupDto dto = new PageHistoryBackupDto();
        dto.setPageCode("page-1");
        dto.setRemark("自动备份");
        dto.setPageConfig(pageConfig("manual"));

        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.backupHistory(dto));

        assertEquals("页面类型不能为空", exception.getMessage());
        verify(mapper, never()).insert(any(PageStageEntity.class));
    }

    @Test
    void backupHistoryRejectsMissingPageConfig() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageHistoryBackupDto dto = new PageHistoryBackupDto();
        dto.setPageCode("page-1");
        dto.setRemark("自动备份");
        dto.setPageType(PageType.PAGE);

        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.backupHistory(dto));

        assertEquals("页面配置不能为空", exception.getMessage());
        verify(mapper, never()).insert(any(PageStageEntity.class));
    }

    @Test
    void backupHistoryThrowsWhenSaveReturnsFalse() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageHistoryBackupDto dto = new PageHistoryBackupDto();
        dto.setPageCode("page-1");
        dto.setRemark("自动备份");
        dto.setPageType(PageType.PAGE);
        dto.setPageConfig(pageConfig("manual"));
        when(mapper.insert(any(PageStageEntity.class))).thenReturn(0);

        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.backupHistory(dto));

        assertEquals("历史备份保存失败", exception.getMessage());
    }

    @Test
    void rollbackDesignByHistoryIdCopiesCurrentDesignToHistoryThenOverwritesDesignConfig() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageStageEntity historyStage = stage("history-1", "page-1", PageStatus.HISTORY, PageType.PAGE, "历史版本", pageConfig("history"));
        PageStageEntity designStage = stage("design-1", "page-1", PageStatus.DESIGN, PageType.PAGE, "当前设计", pageConfig("design"));
        when(mapper.selectById("history-1")).thenReturn(historyStage);
        when(mapper.selectOne(any(), eq(false))).thenReturn(designStage);
        when(mapper.insert(any(PageStageEntity.class))).thenReturn(1);
        when(mapper.updateById(any(PageStageEntity.class))).thenReturn(1);

        String id = service.rollbackDesignByHistoryId("history-1");

        ArgumentCaptor<PageStageEntity> insertCaptor = ArgumentCaptor.forClass(PageStageEntity.class);
        ArgumentCaptor<PageStageEntity> updateCaptor = ArgumentCaptor.forClass(PageStageEntity.class);
        verify(mapper, times(1)).insert(insertCaptor.capture());
        verify(mapper, times(1)).updateById(updateCaptor.capture());

        PageStageEntity rollbackBackup = insertCaptor.getValue();
        assertEquals("page-1", rollbackBackup.getPageCode());
        assertEquals(PageStatus.HISTORY, rollbackBackup.getPageStatus());
        assertEquals("回滚前自动备份", rollbackBackup.getRemark());
        assertSame(designStage.getPageConfig(), rollbackBackup.getPageConfig());

        PageStageEntity updatedDesign = updateCaptor.getValue();
        assertEquals("design-1", updatedDesign.getId());
        assertSame(historyStage.getPageConfig(), updatedDesign.getPageConfig());
        assertNotNull(updatedDesign.getUpdateDate());
        assertEquals(PageStatus.HISTORY, historyStage.getPageStatus());
        assertEquals("history-1", id);
    }

    @Test
    void rollbackDesignByHistoryIdRejectsNonHistoryStage() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageStageEntity publishedStage = stage("published-1", "page-1", PageStatus.PUBLISHED, PageType.PAGE, "已发布", pageConfig("published"));
        when(mapper.selectById("published-1")).thenReturn(publishedStage);

        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.rollbackDesignByHistoryId("published-1"));

        assertEquals("仅支持从历史记录回滚设计态", exception.getMessage());
    }

    @Test
    void rollbackDesignByHistoryIdThrowsWhenBackupSaveFails() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageStageEntity historyStage = stage("history-1", "page-1", PageStatus.HISTORY, PageType.PAGE, "历史版本", pageConfig("history"));
        PageStageEntity designStage = stage("design-1", "page-1", PageStatus.DESIGN, PageType.PAGE, "当前设计", pageConfig("design"));
        when(mapper.selectById("history-1")).thenReturn(historyStage);
        when(mapper.selectOne(any(), eq(false))).thenReturn(designStage);
        when(mapper.insert(any(PageStageEntity.class))).thenReturn(0);

        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.rollbackDesignByHistoryId("history-1"));

        assertEquals("回滚前备份保存失败", exception.getMessage());
        verify(mapper, never()).updateById(any(PageStageEntity.class));
    }

    @Test
    void rollbackDesignByHistoryIdThrowsWhenDesignUpdateFails() {
        PageStageMapper mapper = mock(PageStageMapper.class);
        PageStageService service = newService(mapper);
        PageStageEntity historyStage = stage("history-1", "page-1", PageStatus.HISTORY, PageType.PAGE, "历史版本", pageConfig("history"));
        PageStageEntity designStage = stage("design-1", "page-1", PageStatus.DESIGN, PageType.PAGE, "当前设计", pageConfig("design"));
        when(mapper.selectById("history-1")).thenReturn(historyStage);
        when(mapper.selectOne(any(), eq(false))).thenReturn(designStage);
        when(mapper.insert(any(PageStageEntity.class))).thenReturn(1);
        when(mapper.updateById(any(PageStageEntity.class))).thenReturn(0);

        DataRoomException exception = assertThrows(DataRoomException.class, () -> service.rollbackDesignByHistoryId("history-1"));

        assertEquals("历史回滚失败", exception.getMessage());
    }

    private static PageStageService newService(PageStageMapper mapper) {
        PageStageService service = new PageStageService();
        ReflectionTestUtils.setField(service, "baseMapper", mapper);
        return service;
    }

    private static PageStageEntity stage(String id, String pageCode, PageStatus pageStatus, PageType pageType, String remark, PageConfig pageConfig) {
        PageStageEntity stage = new PageStageEntity();
        stage.setId(id);
        stage.setPageCode(pageCode);
        stage.setPageStatus(pageStatus);
        stage.setPageType(pageType);
        stage.setRemark(remark);
        stage.setPageConfig(pageConfig);
        stage.setUpdateDate(new Date(1_000L));
        return stage;
    }

    private static PageConfig pageConfig(String version) {
        PageConfig pageConfig = new PageConfig();
        JSONObject basicConfig = new JSONObject();
        basicConfig.put("version", version);
        pageConfig.setBasicConfig(basicConfig);
        return pageConfig;
    }
}
