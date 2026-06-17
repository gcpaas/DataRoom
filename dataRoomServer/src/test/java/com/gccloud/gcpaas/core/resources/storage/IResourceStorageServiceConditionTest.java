package com.gccloud.gcpaas.core.resources.storage;

import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.resources.storage.IResourceStorageService;
import com.gccloud.gcpaas.dataroom.core.resources.storage.LocalResourceStorageServiceImpl;
import com.gccloud.gcpaas.dataroom.core.resources.storage.S3ResourceStorageServiceImpl;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Import;

import static org.assertj.core.api.Assertions.assertThat;

class IResourceStorageServiceConditionTest {

    private final ApplicationContextRunner contextRunner = new ApplicationContextRunner()
            .withUserConfiguration(StorageConfiguration.class)
            .withBean(DataRoomConfig.class, IResourceStorageServiceConditionTest::newDataRoomConfig);

    @Test
    void localStorageServiceIsLoadedByDefault() {
        contextRunner.run(context -> {
            assertThat(context).hasSingleBean(IResourceStorageService.class);
            assertThat(context.getBean(IResourceStorageService.class)).isInstanceOf(LocalResourceStorageServiceImpl.class);
            assertThat(context).doesNotHaveBean(S3ResourceStorageServiceImpl.class);
        });
    }

    @Test
    void s3StorageServiceIsLoadedWhenStorageTypeIsS3() {
        contextRunner
                .withPropertyValues("dataroom.resource.storage.type=s3")
                .run(context -> {
                    assertThat(context).hasSingleBean(IResourceStorageService.class);
                    assertThat(context.getBean(IResourceStorageService.class)).isInstanceOf(S3ResourceStorageServiceImpl.class);
                    assertThat(context).doesNotHaveBean(LocalResourceStorageServiceImpl.class);
                });
    }

    @Configuration(proxyBeanMethods = false)
    @Import({LocalResourceStorageServiceImpl.class, S3ResourceStorageServiceImpl.class})
    static class StorageConfiguration {
    }

    private static DataRoomConfig newDataRoomConfig() {
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        dataRoomConfig.getResource().getStorage().getS3().setEndpoint("http://127.0.0.1:9000");
        dataRoomConfig.getResource().getStorage().getS3().setBucket("dataroom");
        dataRoomConfig.getResource().getStorage().getS3().setAccessKey("dataroom");
        dataRoomConfig.getResource().getStorage().getS3().setSecretKey("dataroom");
        return dataRoomConfig;
    }
}
