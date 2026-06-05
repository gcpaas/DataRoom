package com.gccloud.gcpaas.core.util;

import java.util.HashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class ParamUtils {

    private static final Pattern PARAM_PATTERN = Pattern.compile("\\#\\{(.*?)\\}");


    /**
     * 解析参数
     *
     * @param content
     * @return
     */
    public static Set<String> parse(String content) {
        Matcher matcher = PARAM_PATTERN.matcher(content);
        Set<String> paramSet = new HashSet<>();
        while (matcher.find()) {
            String name = matcher.group(1);
            paramSet.add(name.trim());
        }
        return paramSet;
    }

    /**
     * 替换参数
     *
     * @param content
     * @param name
     * @param val
     * @return
     */
    public static String replace(String content, String name, String val) {
        String regex = "\\#\\{\\s*" + Pattern.quote(name) + "\\s*\\}";
        return content.replaceAll(regex, val);
    }
}
