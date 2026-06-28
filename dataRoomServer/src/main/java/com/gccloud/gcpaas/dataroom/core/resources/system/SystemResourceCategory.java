package com.gccloud.gcpaas.dataroom.core.resources.system;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.Objects;

@Schema(description = "系统素材分类")
public class SystemResourceCategory {

    @Schema(description = "分类编码")
    private String code;

    @Schema(description = "分类名称")
    private String name;

    public SystemResourceCategory() {
    }

    public SystemResourceCategory(String code, String name) {
        this.code = code;
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof SystemResourceCategory that)) {
            return false;
        }
        return Objects.equals(code, that.code) && Objects.equals(name, that.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(code, name);
    }
}
