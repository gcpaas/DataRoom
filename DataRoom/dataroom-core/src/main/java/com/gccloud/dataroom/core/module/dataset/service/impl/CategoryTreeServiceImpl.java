package com.gccloud.dataroom.core.module.dataset.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.module.dataset.dao.CategoryTreeDao;
import com.gccloud.dataroom.core.module.dataset.entity.CategoryTree;
import com.gccloud.dataroom.core.module.dataset.service.CategoryTreeService;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.service.ITreeService;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import javax.annotation.Resource;
import java.util.List;
import java.util.Set;

/**
 * @author pan.shun
 * @since 2021/9/7 11:09
 */
@Service
@Slf4j
public class CategoryTreeServiceImpl extends ServiceImpl<CategoryTreeDao, CategoryTree> implements CategoryTreeService {

    @Resource
    private ITreeService treeService;


    @Override
    public List<CategoryTree> queryCategoryTree(String tableName, String moduleCode, Integer ifFilter) {
        LambdaQueryWrapper<CategoryTree> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CategoryTree::getTableName, tableName);
        List<CategoryTree> categoryTreeList = this.list(queryWrapper);
        treeService.transToTree(categoryTreeList);
        categoryTreeList.removeIf(categoryTree -> !"0".equals(categoryTree.getParentId()));
        return categoryTreeList;
    }


    @Override
    public void addOrUpdateTree(CategoryTree categoryTree) {
        checkNodeName(categoryTree);
        if (StringUtils.isEmpty(categoryTree.getId())) {
            if (StringUtils.isEmpty(categoryTree.getParentId())) {
                categoryTree.setParentId("0");
            }
            this.save(categoryTree);
        } else {
            this.updateById(categoryTree);
        }
    }

    @Override
    public void removeNodeById(String id) {
        LambdaQueryWrapper<CategoryTree> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CategoryTree::getParentId, id);
        // 存在子节点不允许删除
        if (this.count(queryWrapper) != 0) {
            throw new GlobalException("当前节点存在子节点，不可删除");
        }
        this.removeById(id);
    }

    /**
     * 该方法可以将某个种类其下的所有子集放至idList中
     */
    @Override
    public Set<String> getAllChildren(Set<String> idList, String typeId) {
        LambdaQueryWrapper<CategoryTree> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CategoryTree::getParentId, typeId);
        List<CategoryTree> list = this.list(wrapper);
        if (!CollectionUtils.isEmpty(list)) {
            list.forEach(r -> {
                idList.add(r.getId());
                Set<String> data = getAllChildren(idList, r.getId());
                idList.addAll(data);
            });
        }
        return idList;
    }

    /**
     * 递归获取当前分类目录树
     *
     * @param categoryTree
     * @param typeId
     * @return
     */
    public CategoryTree recursiveTree(CategoryTree categoryTree, String typeId) {
        LambdaQueryWrapper<CategoryTree> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(CategoryTree::getParentId, typeId);
        List<CategoryTree> list = this.list(queryWrapper);
        categoryTree.setChildren(list);
        if (!CollectionUtils.isEmpty(list)) {
            list.forEach(l -> {
                recursiveTree(l, l.getId());
            });
        }
        return categoryTree;
    }

    /**
     * 判断节点名称是否重复
     */
    private void checkNodeName(CategoryTree categoryTree) throws GlobalException {
        LambdaQueryWrapper<CategoryTree> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(CategoryTree::getName, categoryTree.getName());
        wrapper.eq(CategoryTree::getTableName, categoryTree.getTableName());
        wrapper.ne(StringUtils.isNotBlank(categoryTree.getId()), CategoryTree::getId, categoryTree.getId());
        if (StringUtils.isNotBlank(categoryTree.getModuleCode())) {
            wrapper.eq(CategoryTree::getModuleCode, categoryTree.getModuleCode());
        }
        if (!CollectionUtils.isEmpty(this.list(wrapper))) {
            throw new GlobalException("节点名称已存在");
        }
    }
}
