package com.gccloud.gcpaas.core.resources.storage;

import com.gccloud.gcpaas.dataroom.core.config.DataRoomConfig;
import com.gccloud.gcpaas.dataroom.core.config.bean.ResourceBean;
import com.gccloud.gcpaas.dataroom.core.constant.ResourceType;
import com.gccloud.gcpaas.dataroom.core.entity.ResourceEntity;
import com.gccloud.gcpaas.dataroom.core.resources.storage.*;
import jakarta.annotation.PostConstruct;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.InOrder;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.CreateBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadBucketResponse;
import software.amazon.awssdk.services.s3.model.HeadBucketRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.NoSuchBucketException;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.inOrder;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class S3ResourceStorageServiceImplTest {

    @Test
    void initIsPostConstructLifecycleMethod() throws Exception {
        assertTrue(S3ResourceStorageServiceImpl.class
                .getDeclaredMethod("init")
                .isAnnotationPresent(PostConstruct.class));
    }

    @Test
    void storeCreatesBucketBeforeUploadWhenBucketDoesNotExist() throws Exception {
        S3Client s3Client = mock(S3Client.class);
        when(s3Client.headBucket(any(HeadBucketRequest.class))).thenThrow(NoSuchBucketException.builder().build());
        S3ResourceStorageServiceImpl storageService = newStorageService(s3Client);
        MockMultipartFile file = new MockMultipartFile("file", "chart.png", "image/png", "image".getBytes());

        StoredResource storedResource = storageService.store(ResourceStoreRequest.builder()
                .file(file)
                .objectKey("/image/chart.png")
                .resourceType(ResourceType.IMAGE)
                .build());

        assertEquals("image/chart.png", storedResource.getObjectKey());
        InOrder inOrder = inOrder(s3Client);
        inOrder.verify(s3Client).headBucket(any(HeadBucketRequest.class));
        inOrder.verify(s3Client).createBucket(any(CreateBucketRequest.class));
        inOrder.verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));

        ArgumentCaptor<CreateBucketRequest> createBucketRequestCaptor = ArgumentCaptor.forClass(CreateBucketRequest.class);
        verify(s3Client).createBucket(createBucketRequestCaptor.capture());
        assertEquals("dataroom", createBucketRequestCaptor.getValue().bucket());
    }

    @Test
    void storeSkipsBucketCreationWhenBucketAlreadyExists() throws Exception {
        S3Client s3Client = mock(S3Client.class);
        when(s3Client.headBucket(any(HeadBucketRequest.class))).thenReturn(HeadBucketResponse.builder().build());
        S3ResourceStorageServiceImpl storageService = newStorageService(s3Client);
        MockMultipartFile file = new MockMultipartFile("file", "chart.png", "image/png", "image".getBytes());

        StoredResource storedResource = storageService.store(ResourceStoreRequest.builder()
                .file(file)
                .objectKey("/image/chart.png")
                .resourceType(ResourceType.IMAGE)
                .build());

        assertEquals("image/chart.png", storedResource.getObjectKey());
        verify(s3Client, never()).createBucket(any(CreateBucketRequest.class));
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void storeContinuesWhenConcurrentBucketCreationReportsAlreadyOwned() throws Exception {
        S3Client s3Client = mock(S3Client.class);
        when(s3Client.headBucket(any(HeadBucketRequest.class))).thenThrow(NoSuchBucketException.builder().build());
        when(s3Client.createBucket(any(CreateBucketRequest.class))).thenThrow(S3Exception.builder()
                .awsErrorDetails(software.amazon.awssdk.awscore.exception.AwsErrorDetails.builder()
                        .errorCode("BucketAlreadyOwnedByYou")
                        .build())
                .build());
        S3ResourceStorageServiceImpl storageService = newStorageService(s3Client);
        MockMultipartFile file = new MockMultipartFile("file", "chart.png", "image/png", "image".getBytes());

        StoredResource storedResource = storageService.store(ResourceStoreRequest.builder()
                .file(file)
                .objectKey("/image/chart.png")
                .resourceType(ResourceType.IMAGE)
                .build());

        assertEquals("image/chart.png", storedResource.getObjectKey());
        verify(s3Client).putObject(any(PutObjectRequest.class), any(RequestBody.class));
    }

    @Test
    void loadReturnsNullWhenObjectDoesNotExist() throws Exception {
        S3Client s3Client = mock(S3Client.class);
        when(s3Client.headObject(any(HeadObjectRequest.class))).thenThrow(S3Exception.builder()
                .statusCode(404)
                .build());
        S3ResourceStorageServiceImpl storageService = newStorageService(s3Client);
        ResourceEntity resource = new ResourceEntity();
        resource.setPath("image/missing.png");

        ResourceStream stream = storageService.load(resource, ResourceFileVariant.MAIN);

        assertNull(stream);
    }

    private S3ResourceStorageServiceImpl newStorageService(S3Client s3Client) {
        S3ResourceStorageServiceImpl storageService = new S3ResourceStorageServiceImpl();
        ReflectionTestUtils.setField(storageService, "dataRoomConfig", newDataRoomConfig());
        ReflectionTestUtils.setField(storageService, "s3Client", s3Client);
        return storageService;
    }

    private DataRoomConfig newDataRoomConfig() {
        DataRoomConfig dataRoomConfig = new DataRoomConfig();
        ResourceBean.S3 s3 = dataRoomConfig.getResource().getStorage().getS3();
        s3.setEndpoint("http://127.0.0.1:9000");
        s3.setBucket("dataroom");
        s3.setAccessKey("dataroom");
        s3.setSecretKey("dataroom");
        s3.setRegion("us-east-1");
        s3.setPathStyleAccess(true);
        return dataRoomConfig;
    }
}
