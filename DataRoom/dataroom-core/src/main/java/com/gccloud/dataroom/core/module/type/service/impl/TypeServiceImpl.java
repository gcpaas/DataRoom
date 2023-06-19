package com.gccloud.dataroom.core.module.type.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.module.type.dao.TypeDao;
import com.gccloud.dataroom.core.module.type.dto.TypeDTO;
import com.gccloud.dataroom.core.module.type.entity.TypeEntity;
import com.gccloud.dataroom.core.module.type.service.ITypeService;
import com.gccloud.dataroom.core.utils.BeanConvertUtils;
import com.gccloud.dataroom.core.utils.CodeGenerateUtils;
import com.google.common.collect.Lists;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/5/26 9:42
 */
@Slf4j
@Service
public class TypeServiceImpl extends ServiceImpl<TypeDao, TypeEntity> implements ITypeService {

    @Override
    public String add(TypeDTO typeDTO) {
        TypeEntity entity = BeanConvertUtils.convert(typeDTO, TypeEntity.class);
        if (StringUtils.isBlank(entity.getCode())) {
            String code = CodeGenerateUtils.generate(typeDTO.getType());
            while (this.checkCodeRepeat(null, typeDTO.getType(), code)) {
                code = CodeGenerateUtils.generate(typeDTO.getType());
            }
            entity.setCode(code);
        } else  {
            while (this.checkCodeRepeat(null, typeDTO.getType(), entity.getCode())) {
                entity.setCode(CodeGenerateUtils.generate(typeDTO.getType()));
            }
        }
        if (this.checkNameRepeat(null, typeDTO.getType(), entity.getName())) {
            throw new GlobalException("分类名称重复");
        }
        this.save(entity);
        return entity.getId();
    }

    @Override
    public void update(TypeDTO typeDTO) {
        TypeEntity entity = BeanConvertUtils.convert(typeDTO, TypeEntity.class);
        if (this.checkNameRepeat(typeDTO.getId(), typeDTO.getType(), entity.getName())) {
            throw new GlobalException("分类名称重复");
        }
        this.updateById(entity);
    }

    @Override
    public void deleteById(String id) {
        if (StringUtils.isBlank(id)) {
            return;
        }
        this.removeById(id);
    }

    @Override
    public List<TypeEntity> listByType(String type) {
        if (StringUtils.isBlank(type)) {
            return Lists.newArrayList();
        }
        LambdaQueryWrapper<TypeEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(TypeEntity::getType, type);
        queryWrapper.orderByAsc(TypeEntity::getOrderNum);
        return this.list(queryWrapper);
    }


    @Override
    public boolean checkCodeRepeat(String id, String type, String code) {
        LambdaQueryWrapper<TypeEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(TypeEntity::getType, type);
        queryWrapper.eq(TypeEntity::getCode, code);
        queryWrapper.ne(StringUtils.isNotBlank(id), TypeEntity::getId, id);
        return this.count(queryWrapper) > 0;
    }

    @Override
    public boolean checkNameRepeat(String id, String type, String name) {
        LambdaQueryWrapper<TypeEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(TypeEntity::getName, name);
        queryWrapper.eq(TypeEntity::getType, type);
        queryWrapper.ne(StringUtils.isNotBlank(id), TypeEntity::getId, id);
        return this.count(queryWrapper) > 0;
    }
}
