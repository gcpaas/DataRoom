package com.gccloud.gcpaas.core.config;

import com.gccloud.gcpaas.core.constant.PageType;
import org.apache.commons.lang3.StringUtils;
import org.springframework.core.convert.converter.Converter;

public class PageTypeConverter implements Converter<String, PageType> {

    @Override
    public PageType convert(String source) {
        if (StringUtils.isBlank(source)) {
            return null;
        }
        String normalized = source.trim();
        for (PageType pageType : PageType.values()) {
            if (pageType.getType().equalsIgnoreCase(normalized) || pageType.name().equalsIgnoreCase(normalized)) {
                return pageType;
            }
        }
        throw new IllegalArgumentException("不支持的页面类型: " + source);
    }
}
