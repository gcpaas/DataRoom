import com.alibaba.druid.pool.DruidDataSource;
import com.gccloud.common.utils.JSON;
import com.google.common.collect.Lists;
import com.google.common.collect.Maps;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.json.JSONArray;
import org.json.JSONObject;
import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.junit4.SpringRunner;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * @author hongyang
 * @version 1.0
 * @date 2023/6/20 15:29
 */
@Slf4j
@RunWith(SpringRunner.class)
public class DataMigrationTest {

    /**
     * 版本升级处理数据集数据迁移
     * 执行前请：
     * 1. 执行doc/update.sql
     * 2. 修改数据库连接信息
     */
    @Test
    public void dataMigration() {
        // 设置数据源
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setDriverClassName("com.mysql.jdbc.Driver");
        dataSource.setUrl("jdbc:mysql://127.0.0.1:3306/dataroom?rewriteBatchedStatements=true&useUnicode=true&characterEncoding=UTF-8");
        dataSource.setUsername("root");
        dataSource.setPassword("pwd");
        JdbcTemplate jdbcTemplate = new JdbcTemplate(dataSource);
        // 处理数据源
        log.info("开始处理数据源");
        handleDataSource(jdbcTemplate);
        // 处理分类
        log.info("开始处理分类");
        handleCategory(jdbcTemplate);
        // 处理数据集
        log.info("开始处理数据集");
        handleDataset(jdbcTemplate);

    }


    /**
     * 数据源数据迁移
     * @param jdbcTemplate
     */
    private static void handleDataSource(JdbcTemplate jdbcTemplate) {
        String migrateSql = "INSERT INTO ds_datasource (id, source_name, source_type, driver_class_name, url, host, port, username, password, module_code, editable, remark, update_date, create_date, del_flag)\n" +
                "SELECT id, source_name, source_type, driver_class_name, url, host, port, username, password, module_code, editable, remark, update_date, create_date, del_flag\n" +
                "FROM big_screen_datasource_config where del_flag = 0";
        jdbcTemplate.execute(migrateSql);
        String updateSql = "UPDATE ds_datasource SET source_type = 'PostgreSQL' where  source_type = 'TelePG'";
        jdbcTemplate.execute(updateSql);
        String updateSql2 = "UPDATE ds_datasource SET source_type = 'Mysql' where  source_type = 'TeleDB'";
        jdbcTemplate.execute(updateSql2);
        log.info("数据源数据迁移完成");
    }

    /**
     * 分类树ids更新SQL
     */
    public static final String updateSql = "update ds_category_tree set ids = '%s' where id = '%s'";

    /**
     * 分类树数据迁移
     * @param jdbcTemplate
     */
    private static void handleCategory(JdbcTemplate jdbcTemplate) {
        String migrateSql = "INSERT INTO ds_category_tree (id, name, parent_id, type, module_code, update_date, create_date, del_flag)\n" +
                "SELECT id, name, parent_id, table_name, module_code, update_date, create_date, del_flag\n" +
                "FROM big_screen_category_tree where del_flag = 0";
        jdbcTemplate.execute(migrateSql);
        String sql = "select * from ds_category_tree where del_flag = 0";
        List<Map<String, Object>> categoryList = jdbcTemplate.queryForList(sql);
        // 根据parent_id组装成树形结构，将子节点放到父节点的children中，并组装ids
        Map<String, Map<String, Object>> categoryMap = Maps.newHashMap();
        categoryList.forEach(category -> categoryMap.put(category.get("id").toString(), category));
        categoryList.forEach(category -> {
            String parentId = category.get("parent_id").toString();
            if (StringUtils.isBlank(parentId) || "0".equals(parentId)) {
                return;
            }
            Map<String, Object> parentCategory = categoryMap.get(parentId);
            if (parentCategory == null) {
                return;
            }
            List<Map<String, Object>> children = (List<Map<String, Object>>) parentCategory.get("children");
            if (children == null) {
                children = Lists.newArrayList();
                parentCategory.put("children", children);
            }
            children.add(category);
        });
        // 取出根节点
        List<Map<String, Object>> rootCategoryList = categoryList.stream().filter(category -> {
            String parentId = category.get("parent_id").toString();
            return StringUtils.isBlank(parentId) || "0".equals(parentId);
        }).collect(Collectors.toList());
        // 处理ids
        handleIds(rootCategoryList, "");
        List<String> updateSqlList = Lists.newArrayList();
        // 类型修改
        updateSqlList.add("update ds_category_tree set type = 'dataset' where type = 'r_dataset'");
        // 组装update sql
        getUpdateSql(rootCategoryList, updateSqlList);
        // 批量执行update sql
        jdbcTemplate.batchUpdate(updateSqlList.toArray(new String[0]));
        log.info("分类树数据迁移完成");

    }

    /**
     * 处理分类树ids
     * @param categoryList
     * @param parentIds
     */
    private static void handleIds(List<Map<String, Object>> categoryList, String parentIds) {
        if (categoryList == null || categoryList.isEmpty()) {
            return;
        }
        categoryList.forEach(category -> {
            String id = category.get("id").toString();
            String ids = parentIds + "," + id;
            if (StringUtils.isBlank(parentIds)) {
                ids = id;
            }
            category.put("ids", ids);
            List<Map<String, Object>> children = (List<Map<String, Object>>) category.get("children");
            handleIds(children, ids);
        });

    }

    /**
     * 组装分类树update sql
     * @param categoryList
     * @param updateSqlList
     */
    private static void getUpdateSql(List<Map<String, Object>> categoryList, List<String> updateSqlList) {
        if (categoryList == null || categoryList.isEmpty()) {
            return;
        }
        categoryList.forEach(category -> {
            String id = category.get("id").toString();
            String ids = category.get("ids").toString();
            updateSqlList.add(String.format(updateSql, ids, id));
            List<Map<String, Object>> children = (List<Map<String, Object>>) category.get("children");
            getUpdateSql(children, updateSqlList);
        });
    }

    /**
     * 数据集新增SQL
     */
    public static final String insertSql = "INSERT INTO ds_dataset (id, name, code, type_id, remark, dataset_type, module_code, editable, source_id, cache, config) VALUES ('%s', '%s', '%s', %s, '%s', '%s', '%s', %s, %s, %s, '%s');";

    /**
     * 数据集数据迁移
     * @param jdbcTemplate
     */
    private static void handleDataset(JdbcTemplate jdbcTemplate) {
        // 新增SQL集合
        List<String> insertSqlList = Lists.newArrayList();
        // 处理JSON类型的数据集
        String sql = "select * from big_screen_dataset where dataset_type = 'json' and del_flag = 0";
        List<Map<String, Object>> jsonDatasetList = jdbcTemplate.queryForList(sql);
        for (Map<String, Object> dataset : jsonDatasetList) {
            String data = dataset.get("data").toString();
            // 解析data
            JSONObject dataJson = JSON.parseObject(data);
            Object json = dataJson.get("json");
            JSONObject fieldDesc = dataJson.getJSONObject("fieldDesc");
            // 遍历fieldDesc，取出key和value
            Set<String> keySet = fieldDesc.keySet();
            List<Map<String, Object>> fieldList = Lists.newArrayList();
            for (String key : keySet) {
                Object value = fieldDesc.get(key);
                Map<String, Object> fieldMap = Maps.newHashMap();
                fieldMap.put("fieldName", key);
                fieldMap.put("fieldDesc", value);
                fieldList.add(fieldMap);
            }
            JSONObject jsonConfig = new JSONObject();
            jsonConfig.put("fieldList", fieldList);
            String jsonStr = JSON.toJSONString(json);
            jsonConfig.put("json", escape(jsonStr));
            jsonConfig.put("fieldDesc", fieldDesc);
            jsonConfig.put("className", "com.gccloud.dataset.entity.config.JsonDataSetConfig");
            String config = JSON.toJSONString(jsonConfig);
            String insertSql = getInsertSql(dataset, config);
            insertSqlList.add(insertSql);
        }
        // 处理script类型的数据集
        sql = "select * from big_screen_dataset where dataset_type = 'script' and del_flag = 0";
        List<Map<String, Object>> scriptDatasetList = jdbcTemplate.queryForList(sql);
        for (Map<String, Object> dataset : scriptDatasetList) {
            String data = dataset.get("data").toString();
            // 解析data
            JSONObject dataJson = JSON.parseObject(data);
            Object script = dataJson.get("script");
            Object paramsList = dataJson.get("paramsList");
            JSONObject fieldDesc = dataJson.getJSONObject("fieldDesc");
            // 遍历fieldDesc，取出key和value
            Set<String> keySet = fieldDesc.keySet();
            List<Map<String, Object>> fieldList = Lists.newArrayList();
            for (String key : keySet) {
                Object value = fieldDesc.get(key);
                Map<String, Object> fieldMap = Maps.newHashMap();
                fieldMap.put("fieldName", key);
                fieldMap.put("fieldDesc", value);
                fieldList.add(fieldMap);
            }
            JSONObject jsonConfig = new JSONObject();
            jsonConfig.put("fieldList", fieldList);
            jsonConfig.put("script", escape(script.toString()));
            jsonConfig.put("paramsList", paramsList);
            jsonConfig.put("fieldDesc", fieldDesc);
            jsonConfig.put("className", "com.gccloud.dataset.entity.config.GroovyDataSetConfig");
            String config = JSON.toJSONString(jsonConfig);
            String insertSql = getInsertSql(dataset, config);
            insertSqlList.add(insertSql);
        }
        // 处理original类型的数据集
        sql = "select a.*,b.* from big_screen_dataset a left join big_screen_datasets_original b on a.dataset_rel_id = b.id where a.dataset_rel_id is not null and a.dataset_type = 'original' and a.del_flag = 0 and b.del_flag =0";
        List<Map<String, Object>> originalDatasetList = jdbcTemplate.queryForList(sql);
        for (Map<String, Object> dataset : originalDatasetList) {
            String sourceId = dataset.get("source_id").toString();
            String tableName = dataset.get("table_name").toString();
            Object repeatStatus = dataset.get("repeat_status");
            Object fieldDesc = dataset.get("field_desc");
            JSONObject fieldDescObj = JSON.parseObject(fieldDesc.toString());
            String fieldInfo = dataset.get("field_info").toString();
            JSONArray fieldJson = JSON.parseArray(dataset.get("field_json").toString());
            List<Map<String, Object>> fieldList = Lists.newArrayList();
            fieldJson.toList().forEach(field -> {
                Map<String, Object> fieldMap = Maps.newHashMap();
                fieldMap.put("fieldName", ((Map) field).get("columnName"));
                fieldMap.put("fieldType", ((Map) field).get("columnType"));
                fieldMap.put("orderNum", ((Map) field).get("orderNum"));
                fieldMap.put("sourceTable", ((Map) field).get("sourceTable"));
                fieldMap.put("fieldDesc", ((Map) field).get("fieldDesc"));
                fieldList.add(fieldMap);
            });
            JSONObject jsonConfig = new JSONObject();
            jsonConfig.put("sourceId", sourceId);
            jsonConfig.put("tableName", tableName);
            jsonConfig.put("repeatStatus", repeatStatus);
            jsonConfig.put("fieldDesc", fieldDescObj);
            jsonConfig.put("fieldInfo", fieldInfo);
            jsonConfig.put("fieldList", fieldList);
            jsonConfig.put("className", "com.gccloud.dataset.entity.config.OriginalDataSetConfig");
            String config = JSON.toJSONString(jsonConfig);
            String insertSql = getInsertSql(dataset, config);
            insertSqlList.add(insertSql);
        }
        // 处理custom、storedProcedure类型的数据集
        sql = "select a.*, b.*\n" +
                "from big_screen_dataset a\n" +
                "         left join big_screen_datasets_custom b on a.dataset_rel_id = b.id\n" +
                "where a.dataset_rel_id is not null\n" +
                "  and ( a.dataset_type = 'storedProcedure' or a.dataset_type = 'custom')\n" +
                "  and a.del_flag = 0\n" +
                "  and b.del_flag = 0\n";
        List<Map<String, Object>> customDatasetList = jdbcTemplate.queryForList(sql);
        for (Map<String, Object> dataset : customDatasetList) {
            String sourceId = dataset.get("source_id").toString();
            String sqlProcess = dataset.get("sql_process").toString();
            Object fieldDesc = dataset.get("field_desc");
            JSONObject fieldDescObj = JSON.parseObject(fieldDesc.toString());
            Object paramList = dataset.get("param_config");
            JSONArray fieldJson = JSON.parseArray(dataset.get("field_json").toString());
            List<Map<String, Object>> fieldList = Lists.newArrayList();
            fieldJson.toList().forEach(field -> {
                Map<String, Object> fieldMap = Maps.newHashMap();
                fieldMap.put("fieldName", ((Map) field).get("columnName"));
                fieldMap.put("fieldType", ((Map) field).get("columnType"));
                fieldMap.put("orderNum", ((Map) field).get("orderNum"));
                fieldMap.put("sourceTable", ((Map) field).get("sourceTable"));
                fieldMap.put("fieldDesc", ((Map) field).get("fieldDesc"));
                fieldList.add(fieldMap);
            });
            JSONObject jsonConfig = new JSONObject();
            jsonConfig.put("sourceId", sourceId);
            jsonConfig.put("sqlProcess", escape(sqlProcess));
            jsonConfig.put("fieldDesc", fieldDescObj);
            jsonConfig.put("fieldList", fieldList);
            JSONArray paramsList = new JSONArray();
            if (StringUtils.isNotBlank(paramList.toString())) {
                paramsList = JSON.parseArray(paramList.toString());
            }
            jsonConfig.put("paramsList", paramsList);
            if (dataset.get("dataset_type").toString().equals("storedProcedure")) {
                jsonConfig.put("className", "com.gccloud.dataset.entity.config.StoredProcedureDataSetConfig");
            } else {
                jsonConfig.put("className", "com.gccloud.dataset.entity.config.CustomDataSetConfig");
            }
            String config = JSON.toJSONString(jsonConfig);
            // 将 \\' 替换成 \'
            config = config.replaceAll("\\\\\\\\'", "\\\\'");
            String insertSql = getInsertSql(dataset, config);
            insertSqlList.add(insertSql);
        }
        // 批量新增
        insertSqlList.forEach(jdbcTemplate::execute);
        log.info("数据集配置迁移完成");
    }

    /**
     * 组装数据集插入sql
     * @param dataset
     * @param config
     * @return
     */
    private static String getInsertSql(Map<String, Object> dataset, String config) {
        String id = dataset.get("id").toString();
        String name = dataset.get("name").toString();
        String type_id = dataset.get("type_id") == null ? "null" : dataset.get("type_id").toString();
        String remark = dataset.get("remark").toString();
        String dataset_type = dataset.get("dataset_type").toString();
        String module_code = "";
        String editable = dataset.get("editable").toString();
        String source_id = dataset.get("source_id") == null ? "null" : dataset.get("source_id").toString();
        String code = "";
        String cache = "0";
        return String.format(insertSql, id, name, code, type_id, remark, dataset_type, module_code, editable, source_id, cache, config);
    }

    /**
     * 转义字符串
     * @param str
     * @return
     */
    private static String escape(String str) {
        str = str.replace("\\", "\\\\");
        str = str.replace("'", "\\'");
        str = str.replace("\"", "\\\"");
        str = str.replace("\n", "\\n");
        str = str.replace("\r", "\\r");
        str = str.replace("\t", "\\t");
        return str;
    }
}
