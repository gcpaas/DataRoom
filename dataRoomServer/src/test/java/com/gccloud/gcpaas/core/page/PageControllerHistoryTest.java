package com.gccloud.gcpaas.core.page;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.MybatisMapperBuilderAssistant;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gccloud.gcpaas.dataroom.core.bean.Resp;
import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import com.gccloud.gcpaas.dataroom.core.entity.PageEntity;
import com.gccloud.gcpaas.dataroom.core.entity.PageStageEntity;
import com.gccloud.gcpaas.dataroom.core.exception.DataRoomException;
import com.gccloud.gcpaas.dataroom.core.page.PageController;
import com.gccloud.gcpaas.dataroom.core.page.dto.PageStageSearchDto;
import com.gccloud.gcpaas.dataroom.core.page.dto.PageThumbnailUpdateDto;
import com.gccloud.gcpaas.dataroom.core.page.service.PageService;
import com.gccloud.gcpaas.dataroom.core.page.service.PageStageService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.text.ParseException;
import java.util.Collection;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class PageControllerHistoryTest {

    @Test
    @SuppressWarnings("unchecked")
    void stagePageOrdersHistoryByCreateDateDescThenIdDesc() throws ParseException {
        TableInfoHelper.initTableInfo(new MybatisMapperBuilderAssistant(new MybatisConfiguration(), ""), PageStageEntity.class);
        CapturingPageStageService pageStageService = new CapturingPageStageService();
        PageController controller = new PageController();
        ReflectionTestUtils.setField(controller, "pageStageService", pageStageService);

        PageStageSearchDto searchDto = new PageStageSearchDto();
        searchDto.setCurrent(1);
        searchDto.setSize(20);
        searchDto.setCode("page-1");
        searchDto.setPageStatus(PageStatus.HISTORY);
        searchDto.setStartDate("2026-06-01 00:00:00");
        searchDto.setEndDate("2026-06-08 00:00:00");

        controller.stagePage(searchDto);

        String normalizedOrderBy = pageStageService.capturedQueryWrapper
                .getExpression()
                .getOrderBy()
                .getSqlSegment()
                .replace("`", "")
                .replace("\"", "")
                .replaceAll("\\s+", "")
                .toLowerCase(Locale.ROOT);
        assertEquals("orderbycreate_datedesc,iddesc", normalizedOrderBy);
        String normalizedConditions = pageStageService.capturedQueryWrapper.getExpression().getNormal().getSqlSegment().toLowerCase(Locale.ROOT);
        assertTrue(normalizedConditions.contains("page_status"));
    }

    @Test
    @SuppressWarnings("unchecked")
    void stagePageAllowsNullDates() throws ParseException {
        TableInfoHelper.initTableInfo(new MybatisMapperBuilderAssistant(new MybatisConfiguration(), ""), PageStageEntity.class);
        CapturingPageStageService pageStageService = new CapturingPageStageService();
        PageController controller = new PageController();
        ReflectionTestUtils.setField(controller, "pageStageService", pageStageService);

        PageStageSearchDto searchDto = new PageStageSearchDto();
        searchDto.setCurrent(1);
        searchDto.setSize(20);
        searchDto.setCode("page-1");
        searchDto.setPageStatus(PageStatus.HISTORY);

        controller.stagePage(searchDto);

        String normalizedConditions = pageStageService.capturedQueryWrapper.getExpression().getNormal().getSqlSegment().toLowerCase(Locale.ROOT);
        assertTrue(normalizedConditions.contains("page_status"));
        assertTrue(!normalizedConditions.contains("create_date"));
    }

    @Test
    void updateThumbnailUpdatesOnlyPageThumbnailByCode() {
        TableInfoHelper.initTableInfo(new MybatisMapperBuilderAssistant(new MybatisConfiguration(), ""), PageEntity.class);
        CapturingPageService pageService = new CapturingPageService(true);
        PageController controller = new PageController();
        ReflectionTestUtils.setField(controller, "pageService", pageService);

        PageThumbnailUpdateDto updateDto = new PageThumbnailUpdateDto();
        updateDto.setCode("page-1");
        updateDto.setThumbnail("/dataRoom/resource/file/cover-1/thumbnail");

        Resp<Boolean> response = controller.updateThumbnail(updateDto);

        assertEquals(200, response.getCode());
        assertTrue(response.getData());
        assertNotNull(pageService.capturedUpdateWrapper);
        String sqlSet = pageService.capturedUpdateWrapper.getSqlSet().toLowerCase(Locale.ROOT);
        assertTrue(sqlSet.contains("thumbnail"));
        assertTrue(sqlSet.contains("update_date"));
        String sqlSetColumns = sqlSet.replaceAll("#\\{[^}]+}", "");
        assertTrue(!sqlSetColumns.replace("thumbnail", "").contains("name"));
        assertTrue(!sqlSetColumns.contains("page_status"));
        assertTrue(!sqlSetColumns.contains("page_type"));
        assertTrue(!sqlSetColumns.contains("parent_code"));
        assertTrue(!sqlSetColumns.contains("remark"));
        String normalizedConditions = pageService.capturedUpdateWrapper.getExpression().getNormal().getSqlSegment().toLowerCase(Locale.ROOT);
        assertTrue(normalizedConditions.contains("code"));
        Collection<Object> paramValues = pageService.capturedUpdateWrapper.getParamNameValuePairs().values();
        assertTrue(paramValues.contains("page-1"));
        assertTrue(paramValues.contains("/dataRoom/resource/file/cover-1/thumbnail"));
    }

    @Test
    void updateThumbnailRejectsBlankCode() {
        PageController controller = new PageController();
        PageThumbnailUpdateDto updateDto = new PageThumbnailUpdateDto();
        updateDto.setCode(" ");
        updateDto.setThumbnail("/dataRoom/resource/file/cover-1/thumbnail");

        DataRoomException exception = assertThrows(DataRoomException.class, () -> controller.updateThumbnail(updateDto));

        assertEquals("页面编码不能为空", exception.getMessage());
    }

    @Test
    void updateThumbnailRejectsBlankThumbnail() {
        PageController controller = new PageController();
        PageThumbnailUpdateDto updateDto = new PageThumbnailUpdateDto();
        updateDto.setCode("page-1");
        updateDto.setThumbnail(" ");

        DataRoomException exception = assertThrows(DataRoomException.class, () -> controller.updateThumbnail(updateDto));

        assertEquals("封面地址不能为空", exception.getMessage());
    }

    @Test
    void updateThumbnailRejectsMissingPage() {
        TableInfoHelper.initTableInfo(new MybatisMapperBuilderAssistant(new MybatisConfiguration(), ""), PageEntity.class);
        CapturingPageService pageService = new CapturingPageService(false);
        PageController controller = new PageController();
        ReflectionTestUtils.setField(controller, "pageService", pageService);
        PageThumbnailUpdateDto updateDto = new PageThumbnailUpdateDto();
        updateDto.setCode("missing-page");
        updateDto.setThumbnail("/dataRoom/resource/file/cover-1/thumbnail");

        DataRoomException exception = assertThrows(DataRoomException.class, () -> controller.updateThumbnail(updateDto));

        assertEquals("页面不存在", exception.getMessage());
    }

    private static class CapturingPageStageService extends PageStageService {
        private LambdaQueryWrapper<PageStageEntity> capturedQueryWrapper;

        @Override
        @SuppressWarnings("unchecked")
        public <E extends IPage<PageStageEntity>> E page(E page, Wrapper<PageStageEntity> queryWrapper) {
            this.capturedQueryWrapper = (LambdaQueryWrapper<PageStageEntity>) queryWrapper;
            return page;
        }
    }

    private static class CapturingPageService extends PageService {
        private final boolean updateResult;
        private LambdaUpdateWrapper<PageEntity> capturedUpdateWrapper;

        private CapturingPageService(boolean updateResult) {
            this.updateResult = updateResult;
        }

        @Override
        @SuppressWarnings("unchecked")
        public boolean update(Wrapper<PageEntity> updateWrapper) {
            this.capturedUpdateWrapper = (LambdaUpdateWrapper<PageEntity>) updateWrapper;
            return updateResult;
        }
    }
}
