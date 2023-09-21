package com.gccloud.dataroom.core.module.manage.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.utils.BeanConvertUtils;
import com.gccloud.dataroom.core.module.basic.dao.DataRoomPagePreviewDao;
import com.gccloud.dataroom.core.module.basic.entity.PagePreviewEntity;
import com.gccloud.dataroom.core.module.chart.bean.Chart;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;
import com.gccloud.dataroom.core.module.manage.service.IDataRoomPagePreviewService;
import com.gccloud.dataroom.core.utils.CodeGenerateUtils;
import org.springframework.stereotype.Service;

import java.util.Date;
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
        String originalCode = bigScreenPageDTO.getCode();
        String code = PREVIEW_KEY + "_" + originalCode;
        LambdaQueryWrapper<PagePreviewEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(PagePreviewEntity::getCode, code);
        List<PagePreviewEntity> list = this.list(queryWrapper);
        if (list != null && !list.isEmpty()) {
            // 有则直接更新
            PagePreviewEntity pagePreviewEntity = list.get(0);
            bigScreenPageDTO.setCode(code);
            pagePreviewEntity.setConfig(bigScreenPageDTO);
            pagePreviewEntity.setCreateDate(new Date());
            this.updateById(pagePreviewEntity);
            return code;
        }
        // 没有则新增
        bigScreenPageDTO.setCode(code);
        PagePreviewEntity pagePreviewEntity = BeanConvertUtils.convert(bigScreenPageDTO, PagePreviewEntity.class);
        pagePreviewEntity.setCreateDate(new Date());
        pagePreviewEntity.setConfig(bigScreenPageDTO);
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

    @Override
    public void clear() {
        // 清除创建时间超过一天的预览数据
        Date date = new Date();
        date.setTime(date.getTime() - 24 * 60 * 60 * 1000);
        LambdaQueryWrapper<PagePreviewEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.le(PagePreviewEntity::getCreateDate, date);
        this.delete(queryWrapper);
    }
}
