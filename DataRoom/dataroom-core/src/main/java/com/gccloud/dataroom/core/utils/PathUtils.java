/*
 * Copyright 2023 http://gcpaas.gccloud.com
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

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