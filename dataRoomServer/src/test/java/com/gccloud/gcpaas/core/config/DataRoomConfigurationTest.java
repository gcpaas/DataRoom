package com.gccloud.gcpaas.core.config;

import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfiguration;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertTrue;

class DataRoomConfigurationTest {

    @Test
    void paginationInterceptorRegistersPaginationInnerInterceptor() {
        MybatisPlusInterceptor interceptor = new DataRoomConfiguration().paginationInterceptor();

        assertTrue(interceptor.getInterceptors().stream().anyMatch(PaginationInnerInterceptor.class::isInstance),
                "MyBatis-Plus pagination must register PaginationInnerInterceptor so Page#getTotal() is populated");
    }
}
