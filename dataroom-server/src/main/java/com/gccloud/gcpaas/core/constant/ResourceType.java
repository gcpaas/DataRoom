package com.gccloud.gcpaas.core.constant;

import com.baomidou.mybatisplus.annotation.IEnum;
import com.fasterxml.jackson.annotation.JsonValue;
import org.apache.commons.lang3.StringUtils;

import java.util.Arrays;

/**
 * 素材资源类型
 */
public enum ResourceType implements IEnum<String> {
    DIRECTORY("directory", "目录或文件夹"),
    IMAGE("image", "图片", "jpg", "jpeg", "png", "gif", "bmp", "svg", "webp"),
    VIDEO("video", "视频", "mp4", "avi", "mov", "wmv", "flv", "webm", "m3u8", "m4v"),
    MODEL("model", "3D模型", "glb", "gltf", "obj", "stl");

    private final String type;
    private final String desc;
    private final String[] extensions;

    ResourceType(String type, String desc, String... extensions) {
        this.type = type;
        this.desc = desc;
        this.extensions = extensions;
    }

    @JsonValue
    public String getType() {
        return type;
    }

    @Override
    public String getValue() {
        return type;
    }

    public String getDesc() {
        return desc;
    }

    public String[] getExtensions() {
        return extensions.clone();
    }

    public static ResourceType getByExtension(String extension) {
        String normalizedExtension = normalizeExtension(extension);
        if (StringUtils.isBlank(normalizedExtension)) {
            return IMAGE;
        }
        return Arrays.stream(values())
                .filter(type -> type.supportsExtension(normalizedExtension))
                .findFirst()
                .orElse(IMAGE);
    }

    private boolean supportsExtension(String extension) {
        return Arrays.stream(extensions).anyMatch(extension::equals);
    }

    private static String normalizeExtension(String extension) {
        String normalizedExtension = StringUtils.defaultString(extension).trim().toLowerCase();
        if (normalizedExtension.startsWith(".")) {
            return normalizedExtension.substring(1);
        }
        return normalizedExtension;
    }
}
