package com.gccloud.dataroom.core.utils;

import org.apache.commons.lang3.StringUtils;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/10/18 17:29
 */
public class PathUtils {

    /**
     * 处理路径，如果路径中包含\,则替换为/,再检查替换后路径，是否包含连续的/，如果包含，则替换为单个/
     * @param path
     * @return
     */
    public static String normalizePath(String path) {
        if (StringUtils.isBlank(path)) {
            return path;
        }
        path = path.replace("\\", "/");
        while (path.contains("//")) {
            path = path.replace("//", "/");
        }
        return path;
    }

    /**
     * 处理文件路径和文件名
     * 文件名可能包含路径，需要将路径分离出来，转移到filePath下
     * @param filePath
     * @param fileName
     * @return
     */
    public static String[] handlePath(String filePath, String fileName) {
        filePath = normalizePath(filePath);
        // 去除路径最后的/
        if (filePath.endsWith("/")) {
            filePath = filePath.substring(0, filePath.length() - 1);
        }
        fileName = normalizePath(fileName);
        // 去除文件名前的/
        if (fileName.startsWith("/")) {
            fileName = fileName.substring(1);
        }
        // fileName可能包含路径，需要将路径分离出来，转移到filePath下
        String[] split = fileName.split("/");
        if (split.length > 1) {
            String fileNameTemp = split[split.length - 1];
            String filePathTemp = fileName.substring(0, fileName.length() - fileNameTemp.length());
            filePath = filePath + "/" + filePathTemp;
            fileName = fileNameTemp;
        }
        return new String[]{filePath, fileName};
    }
}
