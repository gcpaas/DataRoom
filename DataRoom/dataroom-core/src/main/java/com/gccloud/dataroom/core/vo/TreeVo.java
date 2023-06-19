package com.gccloud.dataroom.core.vo;

import java.util.List;

/**
 * @author liuchengbiao
 * @date 2020-07-22 14:25
 */
public interface TreeVo<T> {

    void setId(String id);

    String getId();

    void setParentId(String parentId);

    String getParentId();

    void setName(String name);

    String getName();

    void setParentName(String parentName);

    String getParentName();

    void setChildren(List<T> children);

    List<T> getChildren();
}
