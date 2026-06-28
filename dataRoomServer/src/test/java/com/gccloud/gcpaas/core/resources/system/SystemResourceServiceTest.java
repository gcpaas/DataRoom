package com.gccloud.gcpaas.dataroom.core.resources.system;

import com.gccloud.gcpaas.dataroom.core.constant.ResourceType;
import com.gccloud.gcpaas.dataroom.core.entity.ResourceEntity;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

class SystemResourceServiceTest {

    private final SystemResourceService service = new SystemResourceService();

    @Test
    void scanBuildsOnlyFirstLevelCategoryImageResources() {
        service.refresh();

        List<ResourceEntity> resources = service.getList("systemTestCards");

        assertEquals(1, resources.size());
        assertTrue(service.getList(null).stream().noneMatch(resource -> "system-test-root-placeholder".equals(resource.getName())));
        assertTrue(resources.stream().noneMatch(resource -> "分类展示名".equals(resource.getName())));
        assertTrue(resources.stream().noneMatch(resource -> resource.getUrl().contains("/nested/")));

        ResourceEntity resource = resources.stream()
                .filter(item -> "demo-card".equals(item.getName()))
                .findFirst()
                .orElseThrow();
        assertEquals(ResourceType.IMAGE, resource.getResourceType());
        assertEquals("demo-card.png", resource.getOriginalName());
        assertEquals("systemResource-systemTestCards", resource.getParentCode());
        assertEquals("/dataRoom/resource/image/systemTestCards/demo-card.png", resource.getUrl());
        assertEquals(resource.getUrl(), resource.getThumbnail());
        assertEquals("static/dataRoom/resource/image/systemTestCards/demo-card.png", resource.getPath());
        assertTrue(resource.getId().startsWith("systemResource-"));
        assertFalse("systemResource-".equals(resource.getId()));
    }

    @Test
    void getCategoriesUsesNameMarkerFileAndFallsBackToDirectoryName() {
        service.refresh();

        List<SystemResourceCategory> categories = service.getCategories();

        assertTrue(categories.stream().map(SystemResourceCategory::getCode).toList().containsAll(List.of("systemTestCards", "systemTestIcons")));
        assertEquals("分类展示名", categories.stream()
                .filter(category -> "systemTestCards".equals(category.getCode()))
                .findFirst()
                .orElseThrow()
                .getName());
        assertEquals("systemTestIcons", categories.stream()
                .filter(category -> "systemTestIcons".equals(category.getCode()))
                .findFirst()
                .orElseThrow()
                .getName());
    }

    @Test
    void getListFiltersByCategory() {
        service.refresh();

        List<ResourceEntity> resources = service.getList("systemTestIcons");

        assertEquals(1, resources.size());
        assertEquals("logo", resources.get(0).getName());
        assertEquals("/dataRoom/resource/image/systemTestIcons/logo.svg", resources.get(0).getUrl());
    }
}
