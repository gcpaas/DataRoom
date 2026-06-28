package com.gccloud.gcpaas.core.dataset;

import com.gccloud.gcpaas.dataroom.core.constant.DataRoomRole;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetController;
import com.gccloud.gcpaas.dataroom.core.dataset.DatasetTestRequest;
import org.apache.shiro.authz.annotation.RequiresRoles;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Method;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;

class DatasetControllerShareAccessTest {

    @Test
    void runTestRequiresDeveloperRole() throws NoSuchMethodException {
        Method method = DatasetController.class.getMethod("runTest", DatasetTestRequest.class);

        RequiresRoles requiresRoles = method.getAnnotation(RequiresRoles.class);

        assertArrayEquals(new String[]{DataRoomRole.DEVELOPER}, requiresRoles.value());
    }
}
