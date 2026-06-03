package com.gccloud.gcpaas.core.resources.storage;

import com.gccloud.gcpaas.core.config.DataRoomConfig;
import com.gccloud.gcpaas.core.config.bean.ResourceBean;
import com.gccloud.gcpaas.core.constant.ResourceType;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class MinioResourceStorageServiceImplTest {

    @Test
    void storeCreatesBucketBeforeUploadWhenBucketDoesNotExist() throws Exception {
        MinioClient minioClient = mock(MinioClient.class);
        when(minioClient.bucketExists(any(BucketExistsArgs.class))).thenReturn(false);
        MinioResourceStorageServiceImpl storageService = newStorageService(minioClient);
        MockMultipartFile file = new MockMultipartFile("file", "chart.png", "image/png", "image".getBytes());

        StoredResource storedResource = storageService.store(ResourceStoreRequest.builder()
                .file(file)
                .objectKey("/image/chart.png")
                .resourceType(ResourceType.IMAGE)
                .build());

        assertEquals("image/chart.png", storedResource.getObjectKey());
        InOrder inOrder = inOrder(minioClient);
        inOrder.verify(minioClient).bucketExists(any(BucketExistsArgs.class));
        inOrder.verify(minioClient).makeBucket(any(MakeBucketArgs.class));
        inOrder.verify(minioClient).putObject(any(PutObjectArgs.class));

        ArgumentCaptor<MakeBucketArgs> makeBucketArgsCaptor = ArgumentCaptor.forClass(MakeBucketArgs.class);
        verify(minioClient).makeBucket(makeBucketArgsCaptor.capture());
        assertEquals("dataroom", makeBucketArgsCaptor.getValue().bucket());
        assertEquals("us-east-1", makeBucketArgsCaptor.getValue().region());
    }

    private MinioResourceStorageServiceImpl newStorageService(MinioClient minioClient) {
        MinioResourceStorageServiceImpl storageService = new MinioResourceStorageServiceImpl();
        ReflectionTestUtils.setField(storageService, "dataRoomConfig", newDataRoomConfig());
        ReflectionTestUtils.setField(storageService, "minioClient", minioClient);
        return storageService;
    }

    private DataRoomConfig newDataRoomConfig() {
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        ResourceBean.Minio minio = dataRoomConfig.getResource().getStorage().getMinio();
        minio.setEndpoint("http://127.0.0.1:9000");
        minio.setBucket("dataroom");
        minio.setAccessKey("minioadmin");
        minio.setSecretKey("minioadmin");
        minio.setRegion("us-east-1");
        return dataRoomConfig;
    }
}
