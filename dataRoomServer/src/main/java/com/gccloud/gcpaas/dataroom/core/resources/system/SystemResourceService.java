package com.gccloud.gcpaas.dataroom.core.resources.system;

import com.gccloud.gcpaas.dataroom.core.constant.ResourceType;
import com.gccloud.gcpaas.dataroom.core.entity.ResourceEntity;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.core.io.support.ResourcePatternResolver;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Slf4j
@Service
public class SystemResourceService {

    static final String RESOURCE_PATTERN = "classpath:/static/dataRoom/resource/image/**/*";
    private static final String RESOURCE_PATH_MARKER = "static/dataRoom/resource/image/";
    private static final String SYSTEM_RESOURCE_ID_PREFIX = "systemResource-";
    private static final String SYSTEM_RESOURCE_PARENT_PREFIX = "systemResource-";
    private static final List<String> IMAGE_EXTENSIONS = List.of("jpg", "jpeg", "png", "gif", "bmp", "svg", "webp");

    private final ResourcePatternResolver resourcePatternResolver;
    private final String resourcePattern;
    private final String resourcePathMarker;
    private volatile List<ResourceEntity> resourceList = List.of();
    private volatile List<SystemResourceCategory> categoryList = List.of();

    public SystemResourceService() {
        this(new PathMatchingResourcePatternResolver(), RESOURCE_PATTERN);
    }

    SystemResourceService(ResourcePatternResolver resourcePatternResolver, String resourcePattern) {
        this.resourcePatternResolver = resourcePatternResolver;
        this.resourcePattern = resourcePattern;
        this.resourcePathMarker = getResourcePathMarker(resourcePattern);
    }

    @PostConstruct
    void refresh() {
        try {
            Resource[] resources = resourcePatternResolver.getResources(resourcePattern);
            ScanResult scanResult = scan(resources);
            resourceList = scanResult.resources();
            categoryList = scanResult.categories();
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            resourceList = List.of();
            categoryList = List.of();
        }
    }

    public List<ResourceEntity> getList(String category) {
        if (StringUtils.isBlank(category)) {
            return resourceList;
        }
        return resourceList.stream()
                .filter(resource -> (SYSTEM_RESOURCE_PARENT_PREFIX + category).equals(resource.getParentCode()))
                .toList();
    }

    public List<SystemResourceCategory> getCategories() {
        return categoryList;
    }

    private ScanResult scan(Resource[] resources) {
        List<ResourceEntity> scannedResources = new ArrayList<>();
        Map<String, String> categoryNameMap = new HashMap<>();
        for (Resource resource : resources) {
            String relativePath = getRelativePath(resource);
            if (StringUtils.isBlank(relativePath)) {
                continue;
            }
            String[] pathParts = relativePath.split("/", 3);
            if (pathParts.length != 2) {
                continue;
            }
            String category = pathParts[0];
            String filename = pathParts[1];
            String extension = FilenameUtils.getExtension(filename).toLowerCase(Locale.ROOT);
            if ("name".equals(extension)) {
                categoryNameMap.put(category, FilenameUtils.getBaseName(filename));
                continue;
            }
            if (!IMAGE_EXTENSIONS.contains(extension)) {
                continue;
            }
            categoryNameMap.putIfAbsent(category, category);
            scannedResources.add(buildResource(resource, category, filename, extension));
        }
        scannedResources.sort(Comparator.comparing(ResourceEntity::getParentCode).thenComparing(ResourceEntity::getName));
        List<SystemResourceCategory> scannedCategories = categoryNameMap.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> new SystemResourceCategory(entry.getKey(), entry.getValue()))
                .toList();
        return new ScanResult(List.copyOf(scannedResources), scannedCategories);
    }

    private ResourceEntity buildResource(Resource resource, String category, String filename, String extension) {
        String relativePath = category + "/" + filename;
        String url = "/dataRoom/resource/image/" + relativePath;
        ResourceEntity entity = new ResourceEntity();
        entity.setId(SYSTEM_RESOURCE_ID_PREFIX + hash(relativePath));
        entity.setName(FilenameUtils.getBaseName(filename));
        entity.setOriginalName(filename);
        entity.setResourceType(ResourceType.getByExtension(extension));
        entity.setParentCode(SYSTEM_RESOURCE_PARENT_PREFIX + category);
        entity.setPath(RESOURCE_PATH_MARKER + relativePath);
        entity.setUrl(url);
        entity.setThumbnail(url);
        entity.setSize(getSizeInKb(resource));
        return entity;
    }

    private String getRelativePath(Resource resource) {
        try {
            String resourceUrl = URLDecoder.decode(resource.getURL().toString(), StandardCharsets.UTF_8);
            int markerIndex = resourceUrl.indexOf(resourcePathMarker);
            if (markerIndex < 0) {
                return null;
            }
            return resourceUrl.substring(markerIndex + resourcePathMarker.length());
        } catch (IOException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return null;
        }
    }

    private Integer getSizeInKb(Resource resource) {
        try {
            long size = resource.contentLength() / 1024;
            return Math.toIntExact(size);
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return 0;
        }
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash).substring(0, 16);
        } catch (NoSuchAlgorithmException e) {
            log.error(ExceptionUtils.getStackTrace(e));
            return String.valueOf(Math.abs(value.hashCode()));
        }
    }

    private String getResourcePathMarker(String resourcePattern) {
        String marker = StringUtils.removeStart(resourcePattern, "classpath:/");
        marker = StringUtils.substringBefore(marker, "**");
        return StringUtils.appendIfMissing(marker, "/");
    }

    private record ScanResult(List<ResourceEntity> resources, List<SystemResourceCategory> categories) {
    }
}
