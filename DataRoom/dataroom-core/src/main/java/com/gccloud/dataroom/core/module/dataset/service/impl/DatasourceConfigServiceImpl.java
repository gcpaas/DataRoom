package com.gccloud.dataroom.core.module.dataset.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.service.impl.ServiceImpl;
import com.gccloud.dataroom.core.module.dataset.dao.DatasourceConfigDao;
import com.gccloud.dataroom.core.module.dataset.dto.DataSourceDto;
import com.gccloud.dataroom.core.module.dataset.entity.DatasetProcessEntity;
import com.gccloud.dataroom.core.module.dataset.entity.DatasourceConfig;
import com.gccloud.dataroom.core.module.dataset.entity.OriginalTable;
import com.gccloud.dataroom.core.module.dataset.service.DatasetProcessService;
import com.gccloud.dataroom.core.module.dataset.service.DatasourceConfigService;
import com.gccloud.dataroom.core.module.dataset.service.OriginalTableService;
import com.gccloud.dataroom.core.module.dataset.utils.DBUtils;
import com.gccloud.dataroom.core.module.dataset.utils.DESUtils;
import com.gccloud.dataroom.core.module.dataset.vo.DatasourceConfigVo;
import com.gccloud.dataroom.core.exception.GlobalException;
import com.gccloud.dataroom.core.vo.PageVO;
import com.gccloud.dataroom.core.utils.QueryWrapperUtils;
import com.gccloud.dataroom.core.utils.BeanConvertUtils;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;

import javax.annotation.Resource;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * @author pan.shun
 * @since 2021/9/6 14:58
 */
@Service
@Slf4j
public class DatasourceConfigServiceImpl extends ServiceImpl<DatasourceConfigDao, DatasourceConfig> implements DatasourceConfigService {

    @Resource
    @Lazy
    private OriginalTableService originalTableService;

    @Resource
    @Lazy
    private DatasetProcessService datasetProcessService;


    @Override
    public PageVO<DatasourceConfig> getPage(DataSourceDto dataSourceDto) {
        LambdaQueryWrapper<DatasourceConfig> queryWrapper = QueryWrapperUtils.wrapperLike(
                new LambdaQueryWrapper<>(), dataSourceDto.getSourceName(),
                DatasourceConfig::getSourceName
        );
        if (!StringUtils.isEmpty(dataSourceDto.getSourceType())) {
            queryWrapper.eq(DatasourceConfig::getSourceType, dataSourceDto.getSourceType());
        }
        if (!StringUtils.isEmpty(dataSourceDto.getModuleCode())) {
            queryWrapper.eq(DatasourceConfig::getModuleCode, dataSourceDto.getModuleCode());
        }
        queryWrapper.orderByDesc(DatasourceConfig::getCreateDate);
        PageVO<DatasourceConfig> page = this.page(dataSourceDto, queryWrapper);
        page.getList().forEach(datasourceConfig -> datasourceConfig.setPassword(null));
        return page;
    }

    @Override
    public void addOrUpdateDataSource(DatasourceConfig datasourceConfig) {
        // 新增
        if (StringUtils.isEmpty(datasourceConfig.getId())) {
            datasourceConfig.setPassword(DESUtils.getEncryptString(datasourceConfig.getPassword()));
            this.save(datasourceConfig);
            return;
        }
        // 修改
        if (StringUtils.isBlank(datasourceConfig.getPassword())) {
            // 密码为空，不修改密码
            datasourceConfig.setPassword(null);
            this.updateById(datasourceConfig);
            return;
        }
        try {
            datasourceConfig.setDriverClassName(null);
            //解密
            DESUtils.getDecryptString(datasourceConfig.getPassword());
        } catch (Exception e) {
            log.info("当前密码尚未进行加密，重新加密： {}", e.getMessage());
            datasourceConfig.setPassword(DESUtils.getEncryptString(datasourceConfig.getPassword()));
        }
        this.updateById(datasourceConfig);
    }

    @Override
    public String checkRepeat(DatasourceConfig datasourceConfig) {
        LambdaQueryWrapper<DatasourceConfig> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(DatasourceConfig::getSourceName, datasourceConfig.getSourceName());
        queryWrapper.ne(StringUtils.isNotBlank(datasourceConfig.getId()), DatasourceConfig::getId, datasourceConfig.getId());
        queryWrapper.eq(StringUtils.isNotBlank(datasourceConfig.getModuleCode()), DatasourceConfig::getModuleCode, datasourceConfig.getModuleCode());
        int count = this.count(queryWrapper);
        if (count > 0) {
            return "数据源名称已存在";
        }
        return null;
    }

    @Override
    public void removeSource(String id) {

        LambdaQueryWrapper<OriginalTable> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(OriginalTable::getSourceId, id);
        if (originalTableService.count(queryWrapper) != 0) {
            throw new GlobalException("当前数据源已在原始数据集中使用");
        }

        LambdaQueryWrapper<DatasetProcessEntity> wrapper = new LambdaQueryWrapper<>();
        wrapper.eq(DatasetProcessEntity::getSourceId, id);
        if (datasetProcessService.count(wrapper) != 0) {
            throw new GlobalException("当前数据源已在自助数据集中使用");
        }

        this.removeById(id);
    }

    @Override
    public String sourceLinkTest(DatasourceConfig datasourceConfig) {
        Connection connection = null;
        try {
            if (StringUtils.isEmpty(datasourceConfig.getId())) {
                // 新增时，密码尚未进行加密
                datasourceConfig.setPassword(DESUtils.getEncryptString(datasourceConfig.getPassword()));
            } else {
                DatasourceConfig config = this.getById(datasourceConfig.getId());
                if (StringUtils.isBlank(datasourceConfig.getPassword())) {
                    // 密码为空，则说明密码未修改，使用原密码
                    datasourceConfig.setPassword(config.getPassword());
                }
                if (!config.getPassword().equals(datasourceConfig.getPassword())) {
                    // 密码被修改，需要进行加密
                    datasourceConfig.setPassword(DESUtils.getEncryptString(datasourceConfig.getPassword()));
                }
            }
            connection = DBUtils.getConnection(datasourceConfig);
        } finally {
            try {
                if (connection != null) {
                    connection.close();
                }
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
        return "连接成功";
    }

    @Override
    public Object getSourceTableList(String id) {
        DatasourceConfig datasourceConfig = this.getById(id);
        if (datasourceConfig == null) {
            throw new GlobalException("数据源配置信息不存在");
        }
        //当前数据源下所有的表
        List<String> tableNameList = new ArrayList<>();
        List<Map<String, Object>> tableNameMapList = getTableList(datasourceConfig, tableNameList);
        LambdaQueryWrapper<OriginalTable> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(OriginalTable::getTableName);

        //如果大于1000进行分割并进行or操作
        int size = tableNameList.size();
        batchQueryHandle(size, tableNameList, queryWrapper, id, tableNameMapList);

        Map<String, String> tableComment = DBUtils.getTableComment(tableNameList, datasourceConfig);
        if (!CollectionUtils.isEmpty(tableComment)) {
            tableNameMapList.forEach(r -> {
                String name = (String) r.get("name");
                r.put("comment", tableComment.getOrDefault(name, ""));
            });
        }
        return tableNameMapList;
    }

    @Override
    public Object getSourceViewList(String sourceId) {
        DatasourceConfig datasourceConfig = this.getById(sourceId);
        if (datasourceConfig == null) {
            throw new GlobalException("数据源配置信息不存在");
        }
        //当前数据源下所有的视图
        List<String> viewNameList = new ArrayList<>();
        List<Map<String, Object>> tableNameMapList = getViewList(datasourceConfig, viewNameList);
        LambdaQueryWrapper<OriginalTable> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(OriginalTable::getTableName);
        int size = viewNameList.size();
        //如果数据源不存在视图，则不进行,如果大于1000则进行切割
        batchQueryHandle(size, viewNameList, queryWrapper, sourceId, tableNameMapList);
        return tableNameMapList;
    }

    private void batchQueryHandle(int size,
                                  List<String> viewNameList,
                                  LambdaQueryWrapper<OriginalTable> queryWrapper,
                                  String sourceId,
                                  List<Map<String, Object>> tableNameMapList) {
        List<String> newViewNameList;
        if (size > 1000) {
            int insertTime = size / 500 + 1;
            int startSubListIndex, endSubListIndex;
            for (int i = 0; i < insertTime; i++) {
                startSubListIndex = i * 500;
                int nexIndex = i * 500 + 500;
                endSubListIndex = Math.min(nexIndex, size);
                newViewNameList = viewNameList.subList(startSubListIndex, endSubListIndex);
                queryWrapper.in(OriginalTable::getTableName, newViewNameList);
                if (i != insertTime - 1) {
                    queryWrapper.or();
                }
            }
        } else if (size > 0) {
            queryWrapper.in(OriginalTable::getTableName, viewNameList);
        }
        queryWrapper.eq(OriginalTable::getSourceId, sourceId);
        List<OriginalTable> originalTables = originalTableService.list(queryWrapper);
        if (!CollectionUtils.isEmpty(originalTables) && !CollectionUtils.isEmpty(tableNameMapList)) {
            tableNameMapList.forEach(r -> {
                originalTables.forEach(f -> {
                    if (f.getTableName().equals(r.get("name"))) {
                        r.put("status", 1);
                    }
                });
            });
        }
    }

    /**
     * 获取视图名称
     */
    private List<Map<String, Object>> getViewList(DatasourceConfig datasourceConfig, List<String> viewNameList) {
        Connection connection = DBUtils.getConnection(datasourceConfig);
        Statement statement = null;
        ResultSet results = null;
        try {
            statement = connection.createStatement();
            results = statement.executeQuery(getViewSqlBySourceType(datasourceConfig));
            //获取数据源类型，用于封装数据做判断
            String sourceType = datasourceConfig.getSourceType();
            List<Map<String, Object>> viewList = new ArrayList<>(16);
            //获取视图名
            if (("Mysql").equalsIgnoreCase(sourceType)
                    || ("ClickHouse").equalsIgnoreCase(sourceType)
                    || ("Hive").equalsIgnoreCase(sourceType)
                    || ("Oracle").equalsIgnoreCase(sourceType)) {
                while (results.next()) {
                    String tableName = results.getString(1);
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", tableName);
                    map.put("status", 0);
                    viewList.add(map);
                    viewNameList.add(tableName);
                }
            }
            if (("TelePG").equalsIgnoreCase(sourceType)) {
                while (results.next()) {
                    String tableName = results.getString(1);
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", tableName);
                    map.put("status", 0);
                    viewList.add(map);
                    viewNameList.add(tableName);
                }
            }
            return viewList;
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new GlobalException(e.getMessage());
        } finally {//关闭连接
            try {
                if (results != null) {
                    results.close();
                }
                if (statement != null) {
                    statement.close();
                }
                if (connection != null) {
                    connection.close();
                }
            } catch (SQLException e) {
                log.error("关闭连接发生异常：{}", e.getMessage());
            }
        }
    }


    /**
     * 通过数据源获取表信息
     */
    private List<Map<String, Object>> getTableList(DatasourceConfig datasourceConfig, List<String> tableNameList) {
        Connection connection = DBUtils.getConnection(datasourceConfig);
        Statement statement = null;
        ResultSet results = null;
        try {
            statement = connection.createStatement();
            results = statement.executeQuery(getSqlBySourceType(datasourceConfig));
            //获取数据源类型，用于封装数据做判断
            String sourceType = datasourceConfig.getSourceType();
            List<Map<String, Object>> tableList = new ArrayList<>(16);
            if (("Mysql").equalsIgnoreCase(sourceType)
                    || ("ClickHouse").equalsIgnoreCase(sourceType)
                    || ("Hive").equalsIgnoreCase(sourceType)
                    || ("Oracle").equalsIgnoreCase(sourceType)) {
                while (results.next()) {
                    String tableName = results.getString(1);
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", tableName);
                    map.put("status", 0);
                    tableList.add(map);
                    tableNameList.add(tableName);
                }
            }
            if (("TelePG").equalsIgnoreCase(sourceType)) {
                while (results.next()) {
                    String tableName = results.getString(1);
                    Map<String, Object> map = new HashMap<>();
                    map.put("name", tableName);
                    map.put("status", 0);
                    tableList.add(map);
                    tableNameList.add(tableName);
                }
            }
            return tableList;
        } catch (Exception e) {
            log.error(e.getMessage());
            throw new GlobalException(e.getMessage());
        } finally {//关闭连接
            try {
                if (results != null) {
                    results.close();
                }
                if (statement != null) {
                    statement.close();
                }
                if (connection != null) {
                    connection.close();
                }
            } catch (SQLException e) {
                log.error("关闭连接发生异常：{}", e.getMessage());
            }
        }
    }

    /**
     * 通过数据源获取视图
     */
    private String getViewSqlBySourceType(DatasourceConfig datasourceConfig) {
        if (datasourceConfig.getSourceType().equalsIgnoreCase("Mysql")) {
            return "show table status where comment='view'";
        } else if (datasourceConfig.getSourceType().equalsIgnoreCase("ClickHouse")) {
            return " SELECT name FROM system.tables where engine='View' ";
        } else if (datasourceConfig.getSourceType().equalsIgnoreCase("TelePG")) {
            String currentSchema = "";
            //通过url获取当前schema信息
            String url = datasourceConfig.getUrl();
            String substring = url.substring(url.lastIndexOf("?") + 1);
            String[] strings = substring.split("&");
            for (String string : strings) {
                if (string.contains("currentSchema=")) {
                    currentSchema = string.substring(string.lastIndexOf("=") + 1);
                    break;
                }
            }
            if (StringUtils.isEmpty(currentSchema)) {
                return " select viewname from pg_views where schemaname='public'";
            } else {
                return " select viewname from pg_views where schemaname='" + currentSchema + "'";
            }

        } else if (datasourceConfig.getSourceType().equalsIgnoreCase("Oracle")) {
            return " SELECT VIEW_NAME FROM USER_VIEWS ";
        } else {
            return "";
        }
    }

    /**
     * 通过数据源类型获取不同数据源下查询表的sql语句
     */
    private String getSqlBySourceType(DatasourceConfig datasourceConfig) {
        if (datasourceConfig.getSourceType().equalsIgnoreCase("Mysql")) {
            return "show tables";
        } else if (datasourceConfig.getSourceType().equalsIgnoreCase("ClickHouse")) {
            return "show tables";
        } else if (datasourceConfig.getSourceType().equalsIgnoreCase("Hive")) {
            return "show tables";
        } else if (datasourceConfig.getSourceType().equalsIgnoreCase("TelePG")) {
            String currentSchema = "";
            //通过url获取当前schema信息
            String url = datasourceConfig.getUrl();
            String substring = url.substring(url.lastIndexOf("?") + 1);
            String[] strings = substring.split("&");
            for (String string : strings) {
                if (string.contains("currentSchema=")) {
                    currentSchema = string.substring(string.lastIndexOf("=") + 1);
                    break;
                }
            }
            if (StringUtils.isEmpty(currentSchema)) {
                return " select tablename from pg_tables where schemaname='public' order by tablename ";
            } else {
                return " select tablename from pg_tables where schemaname='" + currentSchema + "' order by tablename ";
            }

        } else if (datasourceConfig.getSourceType().equalsIgnoreCase("Oracle")) {
            return " SELECT TABLE_NAME FROM USER_TABLES ORDER BY TABLE_NAME ";
        } else {
            return "";
        }
    }

    @Override
    public DatasourceConfig getDataSourceById(String sourceId) {
        return this.getById(sourceId);
    }

    @Override
    public List<DatasourceConfigVo> getDatasourceList(String moduleCode) {
        LambdaQueryWrapper<DatasourceConfig> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.select(
                DatasourceConfig::getId,
                DatasourceConfig::getSourceName,
                DatasourceConfig::getSourceType
        );
        if (!StringUtils.isEmpty(moduleCode)) {
            queryWrapper.eq(DatasourceConfig::getModuleCode, moduleCode);
        }
        List<DatasourceConfig> datasourceConfigs = this.list(queryWrapper);
        return BeanConvertUtils.convert(datasourceConfigs, DatasourceConfigVo.class);
    }

}
