package com.gccloud.gcpaas.core.operationlog;

import com.gccloud.gcpaas.dataroom.core.user.CaptchaController;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetController;
import com.gccloud.gcpaas.dataroom.core.datasource.DataSourceController;
import com.gccloud.gcpaas.dataroom.core.datasource.ExcelDataSourceController;
import com.gccloud.gcpaas.dataroom.core.map.MapController;
import com.gccloud.gcpaas.dataroom.core.operationlog.annotation.OperationLogMeta;
import com.gccloud.gcpaas.dataroom.core.page.PageController;
import com.gccloud.gcpaas.dataroom.core.resources.ResourceController;
import com.gccloud.gcpaas.dataroom.core.user.UserController;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;

class OperationLogControllerAnnotationTest {

    @Test
    void keyControllersExposeClassLevelDefaults() {
        List<Class<?>> controllers = List.of(
                PageController.class,
                DatasetController.class,
                DataSourceController.class,
                ExcelDataSourceController.class,
                ResourceController.class,
                MapController.class,
                UserController.class,
                CaptchaController.class
        );
        for (Class<?> controller : controllers) {
            assertNotNull(controller.getAnnotation(OperationLogMeta.class), controller.getSimpleName());
        }
    }

    @Test
    void selectedMethodsExposePhaseOneOverridesOnly() {
        assertNotNull(findMethod(PageController.class, "publish").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(PageController.class, "offline").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(PageController.class, "updatePageConfig").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(PageController.class, "updatePageConfig4Preview").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(PageController.class, "getPageConfig").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(PageController.class, "stageClear").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(PageController.class, "stageRollback").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(DatasetController.class, "run").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(DatasetController.class, "runTest").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(ExcelDataSourceController.class, "upload").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(ExcelDataSourceController.class, "createAndImport").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(ExcelDataSourceController.class, "reimport").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(ExcelDataSourceController.class, "viewData").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(ResourceController.class, "upload").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(ResourceController.class, "updateModelConfig").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(ResourceController.class, "uploadModelCover").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(UserController.class, "login").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(UserController.class, "updateProfile").getAnnotation(OperationLogMeta.class));
        assertNotNull(findMethod(CaptchaController.class, "generate").getAnnotation(OperationLogMeta.class));

        assertNull(findMethod(PageController.class, "updateName").getAnnotation(OperationLogMeta.class));
        assertNull(findMethod(PageController.class, "stageDelete").getAnnotation(OperationLogMeta.class));
        assertNull(findMethod(UserController.class, "current").getAnnotation(OperationLogMeta.class));
        assertNull(findMethod(UserController.class, "roles").getAnnotation(OperationLogMeta.class));
    }

    private Method findMethod(Class<?> type, String name) {
        return Arrays.stream(type.getDeclaredMethods())
                .filter(method -> method.getName().equals(name))
                .findFirst()
                .orElseThrow();
    }
}
