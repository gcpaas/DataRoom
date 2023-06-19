package com.gccloud.dataroom.core.module.dataset.service;

import com.gccloud.dataroom.core.module.dataset.dto.DataSourceDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.module.dataset.vo.DatasourceConfigVo;
import com.gccloud.dataroom.core.vo.PageVO;
import com.gccloud.dataroom.core.service.ISuperService;

import java.util.List;

/**
 * @author pan.shun
 * @since 2021/9/6 14:58
 */
public interface DatasourceConfigService extends ISuperService<DatasourceConfig> {

    /**
     * 分页查询
     *
     * @param dataSourceDto
     * @return
     */
    PageVO<DatasourceConfig> getPage(DataSourceDto dataSourceDto);

    /**
     * 新增或修改数据源
     *
     * @param datasourceConfig
     */
    void addOrUpdateDataSource(DatasourceConfig datasourceConfig);

    /**
     * 校验数据源信息是否重复
     *
     * @param datasourceConfig
     * @return
     */
    String checkRepeat(DatasourceConfig datasourceConfig);

    /**
     * 根据id删除数据源
     *
     * @param id
     */
    void removeSource(String id);

    /**
     * 测试数据源连接
     *
     * @param datasourceConfig
     * @return
     */
    String sourceLinkTest(DatasourceConfig datasourceConfig);

    /**
     * 根据数据源id查询数据源下的所有表
     *
     * @param id
     * @return
     */
    Object getSourceTableList(String id);

    /**
     * 根据数据源id查询数据源下的所有视图
     *
     * @param sourceId
     * @return
     */
    Object getSourceViewList(String sourceId);

    /**
     * 根据数据源id查询数据源信息
     *
     * @param sourceId
     * @return
     */
    DatasourceConfig getDataSourceById(String sourceId);

    /**
     * 根据模块编码查询数据源列表
     *
     * @param moduleCode
     * @return
     */
    List<DatasourceConfigVo> getDatasourceList(String moduleCode);

}
