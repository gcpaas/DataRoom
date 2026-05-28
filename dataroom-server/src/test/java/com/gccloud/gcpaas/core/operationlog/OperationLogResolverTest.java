package com.gccloud.gcpaas.core.operationlog;

import com.gccloud.gcpaas.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.core.operationlog.model.OperationLogDetailLevel;
import com.gccloud.gcpaas.core.operationlog.model.OperationLogResolvedMeta;
import com.gccloud.gcpaas.core.operationlog.service.OperationLogResolver;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerMapping;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class OperationLogResolverTest {

    private final OperationLogResolver resolver = new OperationLogResolver();

    @Test
    void methodAnnotationOverridesClassDefaultAndResolvesDatasetCodeFromBody() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/dataRoom/dataset/run");
        HandlerMethod handlerMethod = new HandlerMethod(new AnnotatedDatasetController(),
                AnnotatedDatasetController.class.getMethod("run", Map.class));

        OperationLogResolvedMeta resolvedMeta = resolver.resolve(request, handlerMethod,
                Map.of("datasetCode", "dataset_001", "name", "销售数据集"));

        assertEquals("dataset", resolvedMeta.getTargetType());
        assertEquals("dataset_001", resolvedMeta.getTargetId());
        assertEquals("执行", resolvedMeta.getActionType());
        assertEquals("数据集执行", resolvedMeta.getActionDesc());
        assertEquals("dataset_runtime", resolvedMeta.getBusinessType());
        assertEquals("数据集运行", resolvedMeta.getBusinessName());
        assertEquals(OperationLogDetailLevel.SUMMARY, resolvedMeta.getDetailLevel());
    }

    @Test
    void pathRuleFillsCrudActionAndPathVariableWhenNoMethodAnnotation() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/dataRoom/page/delete/page_001");
        request.setAttribute(HandlerMapping.URI_TEMPLATE_VARIABLES_ATTRIBUTE, Map.of("code", "page_001"));
        HandlerMethod handlerMethod = new HandlerMethod(new PlainPageController(),
                PlainPageController.class.getMethod("delete", String.class));

        OperationLogResolvedMeta resolvedMeta = resolver.resolve(request, handlerMethod, null);

        assertEquals("page", resolvedMeta.getTargetType());
        assertEquals("page_001", resolvedMeta.getTargetId());
        assertEquals("删除", resolvedMeta.getActionType());
        assertEquals("页面管理", resolvedMeta.getBusinessName());
        assertEquals(OperationLogDetailLevel.FULL, resolvedMeta.getDetailLevel());
    }

    @OperationLogMeta(targetType = "dataset", businessType = "dataset_manage", businessName = "数据集管理")
    @RequestMapping("/dataRoom/dataset")
    static class AnnotatedDatasetController {

        @PostMapping("/run")
        @OperationLogMeta(
                actionType = "执行",
                actionDesc = "数据集执行",
                businessType = "dataset_runtime",
                businessName = "数据集运行",
                detailLevel = OperationLogDetailLevel.SUMMARY
        )
        public void run(@RequestBody Map<String, Object> body) {
        }
    }

    @RequestMapping("/dataRoom/page")
    static class PlainPageController {

        @PostMapping("/delete/{code}")
        public void delete(String code) {
        }
    }
}
