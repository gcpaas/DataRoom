package com.gccloud.dataroom.core.module.file.enums;

/**
 * @Description Description
 * @Author Acechengui
 * @Date Created in 2023-10-14
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
