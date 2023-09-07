
#20230621 配置表中的类名替换
UPDATE big_screen_page SET config = REPLACE(config, '"className":"com.gccloud.bigscreen', '"className":"com.gccloud.dataroom');
UPDATE big_screen_page SET config = REPLACE(config, '"className":"com.gccloud.dataroom.core.module.manage.dto.BigScreenPageDTO', '"className":"com.gccloud.dataroom.core.module.manage.dto.DataRoomPageDTO');

#20230621 新增数据集相关的表
DROP TABLE IF EXISTS `ds_category_tree`;
CREATE TABLE `ds_category_tree` (
  `id` bigint(64) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `ids` text COMMENT 'id序列',
  `name` varchar(255) DEFAULT NULL COMMENT '名称',
  `parent_id` bigint(64) DEFAULT NULL COMMENT '父级ID',
  `type` varchar(255) NOT NULL,
  `module_code` varchar(255) DEFAULT NULL,
  `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='数据集种类树';


DROP TABLE IF EXISTS `ds_datasource`;
CREATE TABLE `ds_datasource` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `source_name` varchar(255) DEFAULT NULL COMMENT '数据源名称',
  `source_type` varchar(255) DEFAULT NULL COMMENT '数据源类型',
  `driver_class_name` varchar(255) DEFAULT NULL COMMENT '连接驱动',
  `url` varchar(255) DEFAULT NULL COMMENT '连接url',
  `host` varchar(255) DEFAULT NULL COMMENT '主机',
  `port` int(16) DEFAULT NULL COMMENT '端口',
  `username` varchar(255) DEFAULT NULL COMMENT '用户名',
  `password` text COMMENT '密码',
  `module_code` varchar(255) DEFAULT NULL COMMENT '模块编码',
  `editable` tinyint(2) DEFAULT '0' COMMENT '是否可编辑，0 不可编辑 1 可编辑',
  `remark` varchar(255) DEFAULT NULL,
  `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='数据源配置表';

DROP TABLE IF EXISTS `ds_dataset`;
CREATE TABLE `ds_dataset` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '名称',
  `code` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '编码',
  `type_id` varchar(255) DEFAULT NULL COMMENT '种类ID',
  `remark` text CHARACTER SET utf8 COMMENT '描述',
  `dataset_type` varchar(64) CHARACTER SET utf8 NOT NULL COMMENT '数据集类型（自定义数据集 custom、模型数据集model、原始数据集original、API数据集api、JSON数据集 json）',
  `module_code` varchar(255) COLLATE utf8_general_mysql500_ci DEFAULT NULL COMMENT '模块编码',
  `editable` tinyint(2) NOT NULL DEFAULT '0' COMMENT '是否可编辑，0 不可编辑 1 可编辑',
  `source_id` bigint(32) DEFAULT NULL COMMENT '数据源ID',
  `cache` tinyint(1) DEFAULT 0 NOT NULL COMMENT '是否对执行结构缓存 0 不缓存 1 缓存',
  `config` longtext COMMENT '数据集配置',
  `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB   DEFAULT CHARSET=utf8 COLLATE=utf8_general_mysql500_ci COMMENT='数据集表';


# 20230705 添加create_by、update_by
ALTER TABLE `big_screen_page` ADD COLUMN `create_by` bigint(64) NULL DEFAULT 2 COMMENT '创建人' AFTER `del_flag`;
ALTER TABLE `big_screen_page` ADD COLUMN `update_by` bigint(64) NULL DEFAULT 2 COMMENT '更新人' AFTER `create_by`;
ALTER TABLE `big_screen_file` ADD COLUMN `create_by` bigint(64) NULL DEFAULT 2 COMMENT '创建人' AFTER `del_flag`;
ALTER TABLE `big_screen_file` ADD COLUMN `update_by` bigint(64) NULL DEFAULT 2 COMMENT '更新人' AFTER `create_by`;
ALTER TABLE `big_screen_biz_component` ADD COLUMN `create_by` bigint(64) NULL DEFAULT 2 COMMENT '创建人' AFTER `del_flag`;
ALTER TABLE `big_screen_biz_component` ADD COLUMN `update_by` bigint(64) NULL DEFAULT 2 COMMENT '更新人' AFTER `create_by`;
ALTER TABLE `big_screen_page_template` ADD COLUMN `create_by` bigint(64) NULL DEFAULT 2 COMMENT '创建人' AFTER `del_flag`;
ALTER TABLE `big_screen_page_template` ADD COLUMN `update_by` bigint(64) NULL DEFAULT 2 COMMENT '更新人' AFTER `create_by`;
ALTER TABLE `big_screen_type` ADD COLUMN `create_by` bigint(64) NULL DEFAULT 2 COMMENT '创建人' AFTER `del_flag`;
ALTER TABLE `big_screen_type` ADD COLUMN `update_by` bigint(64) NULL DEFAULT 2 COMMENT '更新人' AFTER `create_by`;

ALTER TABLE `ds_datasource` ADD COLUMN `create_by` bigint(64) NULL DEFAULT 2 COMMENT '创建人' AFTER `del_flag`;
ALTER TABLE `ds_datasource` ADD COLUMN `update_by` bigint(64) NULL DEFAULT 2 COMMENT '更新人' AFTER `create_by`;
ALTER TABLE `ds_dataset` ADD COLUMN `create_by` bigint(64) NULL DEFAULT 2 COMMENT '创建人' AFTER `del_flag`;
ALTER TABLE `ds_dataset` ADD COLUMN `update_by` bigint(64) NULL DEFAULT 2 COMMENT '更新人' AFTER `create_by`;
ALTER TABLE `ds_category_tree` ADD COLUMN `create_by` bigint(64) NULL DEFAULT 2 COMMENT '创建人' AFTER `del_flag`;
ALTER TABLE `ds_category_tree` ADD COLUMN `update_by` bigint(64) NULL DEFAULT 2 COMMENT '更新人' AFTER `create_by`;


# 20230710 添加数据集标签表
DROP TABLE IF EXISTS `ds_label`;
CREATE TABLE `ds_label` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `label_name` varchar(255) DEFAULT NULL COMMENT '标签名称',
  `label_type` varchar(255) DEFAULT NULL COMMENT '标签类型',
  `label_desc` varchar(255) DEFAULT NULL COMMENT '标签描述',
  `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `create_by`    bigint(64)  null default 2 comment '创建人',
  `update_by`    bigint(64)  null default 2 comment '更新人',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB   DEFAULT CHARSET=utf8 COLLATE=utf8_general_mysql500_ci COMMENT='标签';

DROP TABLE IF EXISTS `ds_dataset_label`;
CREATE TABLE `ds_dataset_label` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `dataset_id` bigint(32) DEFAULT NULL COMMENT '数据集ID',
  `label_id` bigint(32) DEFAULT NULL COMMENT '标签ID',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB   DEFAULT CHARSET=utf8 COLLATE=utf8_general_mysql500_ci COMMENT='数据集与标签关联表';

# 20230710 数据源新增字段
ALTER TABLE `ds_datasource` ADD COLUMN `table_name` varchar(255) DEFAULT NULL COMMENT '表名' AFTER `module_code`;


# 20230907 新增地图数据维护表
DROP TABLE IF EXISTS `big_screen_map`;
CREATE TABLE `big_screen_map`
(
    `id`                bigint(32) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `parent_code`       varchar(255)        DEFAULT NULL COMMENT '父级地图编码',
    `map_code`          varchar(255)        DEFAULT NULL COMMENT '地图编码',
    `name`              varchar(255)        DEFAULT NULL COMMENT '地图名称',
    `geo_json`          longtext            DEFAULT NULL COMMENT '地图geoJson',
    `level`             tinyint(2) NOT NULL DEFAULT 0 COMMENT '地图级别 0-世界 1-国家 2-省 3-市 4-区县',
    `enable_down`       tinyint(2) NOT NULL DEFAULT 0 COMMENT '是否支持下钻 0-否 1-是',
    `uploaded_geo_json` tinyint(2) NOT NULL DEFAULT 0 COMMENT '是否已上传geoJson 0-否 1-是',
    `update_date`       timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date`       timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`         bigint(64) null     default 2 comment '创建人',
    `update_by`         bigint(64) null     default 2 comment '更新人',
    `del_flag`          tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8 COMMENT ='地图数据维护表';
