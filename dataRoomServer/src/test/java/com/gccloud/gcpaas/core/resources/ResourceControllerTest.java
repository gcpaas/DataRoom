package com.gccloud.gcpaas.core.resources;

import com.gccloud.gcpaas.core.bean.Resp;
import com.gccloud.gcpaas.core.constant.ResourceType;
import com.gccloud.gcpaas.core.entity.ResourceEntity;
import com.gccloud.gcpaas.core.mapper.ResourceMapper;
import com.gccloud.gcpaas.core.resources.storage.IResourceStorageService;
import com.gccloud.gcpaas.core.resources.storage.ResourceFileVariant;
import com.gccloud.gcpaas.core.resources.storage.ResourceStoreRequest;
import com.gccloud.gcpaas.core.resources.storage.ResourceStream;
import com.gccloud.gcpaas.core.resources.storage.StoredResource;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class ResourceControllerTest {

    @Test
    void uploadCreatesResourceWithMainFileAndCoverThroughCurrentStorage() throws IOException {
        ResourceMapper resourceMapper = mock(ResourceMapper.class);
        RecordingStorageService storageService = new RecordingStorageService("s3");
        ResourceController controller = newController(resourceMapper, storageService);

        MockMultipartFile file = new MockMultipartFile("file", "销售看板.png", "image/png", "main".getBytes());
        MockMultipartFile cover = new MockMultipartFile("cover", "销售封面.jpg", "image/jpeg", "cover".getBytes());

        Resp<ResourceEntity> response = controller.upload(null, file, cover, null, null, null, "备注");

        assertEquals(200, response.getCode());
        ResourceEntity data = response.getData();
        assertNotNull(data.getId());
        assertFalse(data.getId().isBlank());
        assertEquals("销售看板", data.getName());
        assertEquals(ResourceType.IMAGE, data.getResourceType());
        assertEquals("root", data.getParentCode());
        assertEquals("备注", data.getRemark());
        assertEquals("/dataRoom/resource/file/" + data.getId(), data.getUrl());
        assertEquals("/dataRoom/resource/file/" + data.getId() + "/thumbnail", data.getThumbnail());
        assertEquals(2, storageService.storeRequests.size());

        ArgumentCaptor<ResourceEntity> insertedCaptor = ArgumentCaptor.forClass(ResourceEntity.class);
        verify(resourceMapper).insert(insertedCaptor.capture());
        ResourceEntity inserted = insertedCaptor.getValue();
        assertTrue(inserted.getPath().startsWith("image/"));
        assertTrue(inserted.getThumbnail().startsWith("image/"));
    }

    @Test
    void uploadUpdatesExistingResourceAndDeletesReplacedObjects() throws IOException {
        ResourceMapper resourceMapper = mock(ResourceMapper.class);
        RecordingStorageService storageService = new RecordingStorageService("local");

        ResourceEntity existing = new ResourceEntity();
        existing.setId("resource_1");
        existing.setName("旧名称");
        existing.setResourceType(ResourceType.VIDEO);
        existing.setParentCode("root");
        existing.setPath("video/old.mp4");
        existing.setThumbnail("/video/old-cover.png");
        when(resourceMapper.selectById("resource_1")).thenReturn(existing);
        ResourceController controller = newController(resourceMapper, storageService);

        MockMultipartFile file = new MockMultipartFile("file", "新视频.mp4", "video/mp4", "video".getBytes());
        MockMultipartFile cover = new MockMultipartFile("cover", "新封面.png", "image/png", "cover".getBytes());

        Resp<ResourceEntity> response = controller.upload("resource_1", file, cover, "新名称", "video", "media", null);

        assertEquals(200, response.getCode());
        ResourceEntity data = response.getData();
        assertEquals("resource_1", data.getId());
        assertEquals("新名称", data.getName());
        assertEquals(ResourceType.VIDEO, data.getResourceType());
        assertEquals("media", data.getParentCode());
        assertTrue(data.getPath().startsWith("video/"));
        assertTrue(data.getUrl().startsWith("/video/"));
        assertTrue(data.getThumbnail().startsWith("/video/"));
        assertTrue(storageService.deletedObjectKeys.contains("video/old.mp4"));
        assertTrue(storageService.deletedObjectKeys.contains("/video/old-cover.png"));
        verify(resourceMapper).updateById(any(ResourceEntity.class));
    }

    private ResourceController newController(ResourceMapper resourceMapper,
                                             IResourceStorageService storageService) {
        ResourceController controller = new ResourceController();
        ReflectionTestUtils.setField(controller, "resourceMapper", resourceMapper);
        ReflectionTestUtils.setField(controller, "resourceStorageService", storageService);
        return controller;
    }

    private static class RecordingStorageService implements IResourceStorageService {
        private final String storageType;
        private final List<ResourceStoreRequest> storeRequests = new ArrayList<>();
        private final List<String> deletedObjectKeys = new ArrayList<>();

        private RecordingStorageService(String storageType) {
            this.storageType = storageType;
        }

        @Override
        public String getStorageType() {
            return storageType;
        }

        @Override
        public StoredResource store(ResourceStoreRequest request) throws IOException {
            storeRequests.add(request);
            return StoredResource.builder()
                    .objectKey(request.getObjectKey())
                    .accessUrl("/" + request.getObjectKey())
                    .size((int) (request.getFile().getSize() / 1024))
                    .build();
        }

        @Override
        public ResourceStream load(ResourceEntity resource, ResourceFileVariant variant) {
            return null;
        }

        @Override
        public void delete(String objectKey) {
            deletedObjectKeys.add(objectKey);
        }
    }
}
