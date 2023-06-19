package com.gccloud.dataroom.core.utils;

import com.gccloud.dataroom.core.utils.cover.ICoverLife;
import com.gccloud.dataroom.core.vo.PageVO;
import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.exception.ExceptionUtils;
import org.springframework.beans.BeanUtils;

import java.util.List;

/**
 * 类转换
 *
 * @author liuchengbiao
 * @date 2020-07-07 10:44
 */
@Slf4j
public class BeanConvertUtils {

    /**
     * 复制分页
     *
     * @param pageEntity
     * @param targetClass
     * @param <T>
     * @return
     */
    public static <T> PageVO<T> convertPage(PageVO<? extends Object> pageEntity, Class<T> targetClass) {
        return convertPage(pageEntity, targetClass, null);
    }

    /**
     * 复制分页
     *
     * @param pageEntity
     * @param targetClass
     * @param <T>
     * @return
     */
    public static <T> PageVO<T> convertPage(PageVO<? extends Object> pageEntity, Class<T> targetClass, ICoverLife<?, T> coverLife) {
        PageVO<T> pageVO = new PageVO<>();
        pageVO.setTotalPage(pageEntity.getTotalPage());
        pageVO.setTotalCount(pageEntity.getTotalCount());
        pageVO.setCurrent(pageEntity.getCurrent());
        pageVO.setSize(pageEntity.getSize());
        List<T> list = convert(pageEntity.getList(), targetClass, coverLife);
        pageVO.setList(list);
        return pageVO;
    }

    /**
     * 复制集合
     *
     * @param sourceList
     * @param targetClass
     * @param <T>
     * @return
     */
    public static <T> List<T> convert(List<? extends Object> sourceList, Class<T> targetClass) {
        return convert(sourceList, targetClass, null);
    }

    /**
     * 复制集合
     *
     * @param sourceList
     * @param targetClass
     * @param <T>
     * @return
     */
    public static <T> List<T> convert(List<? extends Object> sourceList, Class<T> targetClass, ICoverLife<?, T> coverLife) {
        if (sourceList == null || sourceList.size() == 0) {
            return Lists.newArrayList();
        }
        List<T> targetList = Lists.newArrayListWithCapacity(sourceList.size());
        for (Object source : sourceList) {
            T target = null;
            try {
                target = targetClass.newInstance();
                BeanUtils.copyProperties(source, target);
                if (coverLife != null) {
                    coverLife.after(source, target);
                }
                targetList.add(target);
            } catch (Exception e) {
                log.error(ExceptionUtils.getStackTrace(e));
            }
        }
        return targetList;
    }

    /**
     * 类转换
     *
     * @param source      被转换的类
     * @param targetClass 需要转为的目标类型
     * @param <T>
     * @return
     */
    public static <T> T convert(Object source, Class<T> targetClass) {
        try {
            if (source == null) {
                return targetClass.newInstance();
            }
            T target = targetClass.newInstance();
            BeanUtils.copyProperties(source, target);
            return target;
        } catch (Exception e) {
            log.error(ExceptionUtils.getStackTrace(e));
        }
        return null;
    }

    /**
     * 类转换
     *
     * @param source 被转换的类
     * @param target 需要转为的目标对象，需要自己先初始化对象
     */
    public static void convert(Object source, Object target) {
        BeanUtils.copyProperties(source, target);
    }
}
