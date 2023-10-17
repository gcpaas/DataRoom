package com.gccloud.dataroom.core.module.file.enums;

/**
 *  文件操作类型
 *  Description
 * @author Acechengui
 */
public enum FileUploadType {
    LOCAL("local"),
    MINIO("minio");

    // 以上是枚举的成员，必须先定义，而且使用分号结束
    private final String value;
    FileUploadType(String value) {
        this.value = value;
    }
    public String getValue() {
        return value;
    }
}
