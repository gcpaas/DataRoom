package com.gccloud.gcpaas.core.resources.storage;

import com.gccloud.gcpaas.core.config.DataRoomConfig;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

class ResourceStorageServiceConditionTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(StorageConfiguration.class)
            .withBean(DataRoomConfig.class, DataRoomConfig::new);

    @Test
    void localStorageServiceIsLoadedByDefault() {
        contextRunner.run(context -> {
            assertThat(context).hasSingleBean(ResourceStorageService.class);
            assertThat(context.getBean(ResourceStorageService.class)).isInstanceOf(LocalResourceStorageServiceImpl.class);
            assertThat(context).doesNotHaveBean(MinioResourceStorageServiceImpl.class);
        });
    }

    @Test
    void minioStorageServiceIsLoadedWhenStorageTypeIsMinio() {
        contextRunner
                .withPropertyValues("dataroom.resource.storage.type=minio")
                .run(context -> {
                    assertThat(context).hasSingleBean(ResourceStorageService.class);
                    assertThat(context.getBean(ResourceStorageService.class)).isInstanceOf(MinioResourceStorageServiceImpl.class);
                    assertThat(context).doesNotHaveBean(LocalResourceStorageServiceImpl.class);
                });
    }

    @Configuration(proxyBeanMethods = false)
    @Import({LocalResourceStorageServiceImpl.class, MinioResourceStorageServiceImpl.class})
    static class StorageConfiguration {
    }
}
