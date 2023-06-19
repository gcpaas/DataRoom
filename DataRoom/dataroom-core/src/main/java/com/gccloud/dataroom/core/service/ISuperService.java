package com.gccloud.dataroom.core.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.core.toolkit.support.SFunction;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.baomidou.mybatisplus.extension.service.IService;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.dto.SearchDTO;
import com.gccloud.dataroom.core.dao.DataRoomBaseDao;
import com.gccloud.dataroom.core.vo.PageVO;
import com.gccloud.dataroom.core.utils.QueryWrapperUtils;
import com.google.common.collect.Maps;
import org.apache.commons.lang3.StringUtils;
import org.apache.logging.log4j.util.Strings;

import java.io.Serializable;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * @author liuchengbiao
 * @date 2020-07-13 14:37
 */
public interface ISuperService<T> extends IService<T> {

    /**
     * 属性和列名映射
     */
    Map<String, String> PROPERTY_COLUMN_MAP = Maps.newHashMap();

    /**
     * s
     * 获取BaseDao
     *
     * @return
     */
    default DataRoomBaseDao<T> getBaseDao() {
        return (DataRoomBaseDao<T>) getBaseMapper();
    }

    /**
     * 根据ID删除
     *
     * @param id
     * @return
     */
    default int deleteById(Serializable id) {
        return getBaseMapper().deleteById(id);
    }

    /**
     * 根据条件删除
     *
     * @param wrapper
     * @return
     */
    default int delete(Wrapper<T> wrapper) {
        return getBaseMapper().delete(wrapper);
    }

    ////////////////////////////////////////////////////////////////////////////////
    //   分页查询
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * 分页查询
     *
     * @param searchDTO
     * @param queryWrapper
     * @return
     */
    default PageVO<T> page(SearchDTO searchDTO, LambdaQueryWrapper<T> queryWrapper) {
        Page<T> searchPage = packSearchPage(searchDTO);
        Page<T> page = this.page(searchPage, queryWrapper);
        return new PageVO<T>(page);
    }

    /**
     * 分页查询
     *
     * @param searchDTO
     * @param fieldNames
     * @return
     */
    default PageVO<T> page(SearchDTO searchDTO, SFunction<T, ?>... fieldNames) {
        LambdaQueryWrapper<T> queryWrapper = packQueryWrapper(searchDTO, fieldNames);
        return page(searchDTO, queryWrapper);
    }


    /**
     * 封装查询器
     *
     * @param searchDTO
     * @param fieldNames
     * @return
     */
    default LambdaQueryWrapper<T> packQueryWrapper(SearchDTO searchDTO, SFunction<T, ?>... fieldNames) {
        LambdaQueryWrapper<T> queryWrapper = QueryWrapperUtils.wrapperLike(new LambdaQueryWrapper<T>(), searchDTO.getSearchKey(), fieldNames);
        return queryWrapper;
    }

    /**
     * 封装分页查询的分页条件
     *
     * @param searchDTO
     * @return
     */
    default Page<T> packSearchPage(SearchDTO searchDTO) {
        Page<T> searchPage = new Page<>();
        if (searchDTO.getCurrent() == null || searchDTO.getCurrent() <= 0) {
            searchPage.setCurrent(1);
        } else {
            searchPage.setCurrent(searchDTO.getCurrent());
        }
        Integer current = searchDTO.getCurrent();
        if (current == null) {
            current = 1;
        }
        Integer size = searchDTO.getSize();
        if (size == null || size <= 0) {
            size = 10;
        }
        if (size > 500) {
            size = 500;
        }
        searchPage.setSize(size);
        searchPage.setCurrent(current);
        return searchPage;
    }

    ////////////////////////////////////////////////////////////////////////////////
    //   扩展的方法
    ////////////////////////////////////////////////////////////////////////////////

    /**
     * 字符串数组更改
     *
     * @param idStr
     * @return
     */
    default List<String> convert(String idStr) {
        //判断id是否为空
        if (Strings.isBlank(idStr)) {
            throw new GlobalException("id不允许为空");
        }
        // 将ids 拆分为数组,分隔符为"-"
        String[] idStrArr = StringUtils.split(idStr, "-");
        return Arrays.stream(idStrArr).map(id -> id).collect(Collectors.toList());
    }

    /**
     * 根据字段查询
     *
     * @param field 查询的字段；使用lambda语法
     * @param val   字段对应的值
     * @return
     */
    default T getEntityByField(SFunction<T, ?> field, Object val) {
        LambdaUpdateWrapper<T> query = new LambdaUpdateWrapper<>();
        query.eq(field, val);
        List<T> list = list(query);
        if (list == null || list.size() == 0) {
            return null;
        }
        return list.get(0);
    }


    /**
     * 根据字段获取实体集合
     *
     * @param field
     * @param val
     * @return
     */
    default List<T> getEntitiesByField(SFunction<T, ?> field, Object val) {
        LambdaUpdateWrapper<T> query = new LambdaUpdateWrapper<>();
        query.eq(field, val);
        List<T> list = list(query);
        return list;
    }


}
