package com.gccloud.gcpaas.core.page;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.MybatisConfiguration;
import com.baomidou.mybatisplus.core.MybatisMapperBuilderAssistant;
import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.metadata.TableInfoHelper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.gccloud.gcpaas.dataroom.core.constant.PageStatus;
import com.gccloud.gcpaas.dataroom.core.entity.PageStageEntity;
import com.gccloud.gcpaas.dataroom.core.page.PageController;
import com.gccloud.gcpaas.dataroom.core.page.dto.PageStageSearchDto;
import com.gccloud.gcpaas.dataroom.core.page.service.PageStageService;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.text.ParseException;
import java.util.Locale;

import static org.junit.jupiter.api.Assertions.assertEquals;
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

    private static class CapturingPageStageService extends PageStageService {
        private LambdaQueryWrapper<PageStageEntity> capturedQueryWrapper;

        @Override
        @SuppressWarnings("unchecked")
        public <E extends IPage<PageStageEntity>> E page(E page, Wrapper<PageStageEntity> queryWrapper) {
            this.capturedQueryWrapper = (LambdaQueryWrapper<PageStageEntity>) queryWrapper;
            return page;
        }
    }
}
