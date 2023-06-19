package com.gccloud.dataroom.core.utils;

import org.apache.commons.lang3.RandomStringUtils;

/**
 * 编码生成
 */
public class CodeGenerateUtils {

    /**
     * 根据名称统一生成编码
     *
     * @param prefix 前缀
     * @return
     */
    public static String generate(String prefix) {
        if ("app".equals(prefix)) {
            return prefix + "-" + RandomStringUtils.randomAlphanumeric(10).toLowerCase();
        }
        return prefix + "_" + RandomStringUtils.randomAlphanumeric(10);
    }
}
