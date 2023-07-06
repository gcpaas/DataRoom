package com.gccloud.dataroom.core.module.template.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.module.basic.dto.BasePageDTO;
import com.gccloud.dataroom.core.module.chart.components.datasource.DataSetDataSource;
import com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO;
import com.gccloud.dataroom.core.module.template.dao.DataRoomPageTemplateDao;
import com.gccloud.dataroom.core.module.template.dto.PageTemplateSearchDTO;
import com.gccloud.dataroom.core.module.template.entity.PageTemplateEntity;
import com.gccloud.dataroom.core.module.template.service.IPageTemplateService;
import com.gccloud.common.exception.GlobalException;
import com.gccloud.common.vo.PageVO;
import org.apache.commons.lang3.StringUtils;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/3/20 16:38
 */
@Service("dataRoomPageTemplateService")
public class PageTemplateServiceImpl extends ServiceImpl<DataRoomPageTemplateDao, PageTemplateEntity> implements IPageTemplateService {
    @Override
    public PageVO<PageTemplateEntity> getPage(PageTemplateSearchDTO searchDTO) {
        LambdaQueryWrapper<PageTemplateEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getType()), PageTemplateEntity::getType, searchDTO.getType());
        return page(searchDTO, queryWrapper);
    }

    @Override
    public List<PageTemplateEntity> getList(PageTemplateSearchDTO searchDTO) {
        LambdaQueryWrapper<PageTemplateEntity> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(StringUtils.isNotBlank(searchDTO.getType()), PageTemplateEntity::getType, searchDTO.getType());
        return list(queryWrapper);
    }

    @Override
    public String add(PageTemplateEntity pageTemplate) {
        BasePageDTO config = pageTemplate.getConfig();
        // 清空数据配置
        ((DataRoomPageDTO) config).setId(null);
        ((DataRoomPageDTO) config).getChartList().forEach(chart -> {
            chart.setDataSource(new DataSetDataSource());
            chart.setCode(null);
        });
        this.save(pageTemplate);
        return pageTemplate.getId();
    }

    @Override
    public void deleteByIds(List<String> ids) {
        if (ids == null || ids.size() == 0) {
            return;
        }
        this.removeByIds(ids);
    }

    @Override
    public void update(PageTemplateEntity pageTemplate) {
        if (StringUtils.isBlank(pageTemplate.getId())) {
            throw new GlobalException("id不能为空");
        }
        this.updateById(pageTemplate);
    }
}
