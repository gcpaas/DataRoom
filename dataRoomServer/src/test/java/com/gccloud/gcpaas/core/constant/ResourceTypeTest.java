package com.gccloud.gcpaas.core.constant;

import com.gccloud.gcpaas.dataroom.core.constant.ResourceType;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ResourceTypeTest {

    @Test
    void getByExtensionResolvesKnownResourceTypes() {
        assertEquals(ResourceType.IMAGE, ResourceType.getByExtension("png"));
        assertEquals(ResourceType.IMAGE, ResourceType.getByExtension(".JPG"));
        assertEquals(ResourceType.VIDEO, ResourceType.getByExtension("mp4"));
        assertEquals(ResourceType.MODEL, ResourceType.getByExtension("gltf"));
    }

    @Test
    void getByExtensionDefaultsToImageForBlankOrUnknownExtensions() {
        assertEquals(ResourceType.IMAGE, ResourceType.getByExtension(null));
        assertEquals(ResourceType.IMAGE, ResourceType.getByExtension(""));
        assertEquals(ResourceType.IMAGE, ResourceType.getByExtension("txt"));
    }
}
