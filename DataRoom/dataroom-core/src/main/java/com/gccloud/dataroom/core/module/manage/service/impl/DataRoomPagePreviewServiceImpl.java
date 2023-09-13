package com.gccloud.dataroom.core.module.manage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.dataroom.core.module.basic.dao.DataRoomPagePreviewDao;
import com.gccloud.dataroom.core.module.basic.entity.PagePreviewEntity;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPagePreviewService;
import com.gccloud.dataroom.core.utils.CodeGenerateUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/9/13 10:11
 */
@Service
public class DataRoomPagePreviewServiceImpl extends ServiceImpl<DataRoomPagePreviewDao, PagePreviewEntity> implements IDataRoomPagePreviewService {




    @Override
    public String add(DataRoomPageDTO bigScreenPageDTO) {
        String code = CodeGenerateUtils.generate(PREVIEW_KEY);
        bigScreenPageDTO.setCode(code);
        PagePreviewEntity pagePreviewEntity = BeanConvertUtils.convert(bigScreenPageDTO, PagePreviewEntity.class);
        this.save(pagePreviewEntity);
        return code;
    }

    @Override
    public PagePreviewEntity getByCode(String code) {
        LambdaQueryWrapper<PagePreviewEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PagePreviewEntity::getCode, code);
        List<PagePreviewEntity> list = this.list(queryWrapper);
        if (list == null || list.isEmpty()) {
            throw new GlobalException("大屏预览数据不存在，可能已过期");
        }
        return list.get(0);
    }
}
