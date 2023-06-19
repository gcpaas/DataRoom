package com.gccloud.dataroom.core.module.dataset.service;

import com.gccloud.dataroom.core.module.dataset.entity.CategoryTree;
import com.gccloud.dataroom.core.service.ISuperService;

import java.util.List;
import java.util.Set;

/**
 * @author pan.shun
 * @since 2021/9/7 11:08
 */
public interface CategoryTreeService extends ISuperService<CategoryTree> {

    /**
     * 分类树查询
     *
     * @param tableName
     * @param moduleCode
     * @param ifFilter
     * @return
     */
    List<CategoryTree> queryCategoryTree(String tableName, String moduleCode, Integer ifFilter);

    /**
     * 新增或修改分类树
     *
     * @param categoryTree
     */
    void addOrUpdateTree(CategoryTree categoryTree);

    /**
     * 根据ID删除分类树节点
     *
     * @param id
     */
    void removeNodeById(String id);

    /**
     * 该方法可以将某个种类其下的所有子集放至idList中
     *
     * @param idList
     * @param typeId
     * @return
     */
    Set<String> getAllChildren(Set<String> idList, String typeId);

}
