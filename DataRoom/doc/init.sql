DROP TABLE IF EXISTS `big_screen_file`;
CREATE TABLE `big_screen_file`
(
    `id`             bigint(64)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `module`         varchar(255) NOT NULL DEFAULT '' COMMENT '模块/类型',
    `original_name`  varchar(255) NOT NULL DEFAULT '' COMMENT '原文件名',
    `new_name`       varchar(255) NOT NULL DEFAULT '' COMMENT '新文件名',
    `extension`      varchar(20)  NOT NULL DEFAULT '' COMMENT '后缀名(如: txt、png、doc、java等)',
    `path`           varchar(255) NOT NULL DEFAULT '' COMMENT '路径',
    `url`            varchar(255) NOT NULL DEFAULT '' COMMENT '访问路径',
    `size`           bigint(64)   NOT NULL DEFAULT '0' COMMENT '文件大小',
    `download_count` int(11)      NOT NULL DEFAULT '0' COMMENT '下载次数',
    `user_name`      varchar(20)  NOT NULL DEFAULT '' COMMENT '上传用户',
    `create_date`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_date`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `del_flag`       tinyint(4)   NOT NULL DEFAULT '0' COMMENT '删除标记0:保留，1:删除',
    `bucket`         varchar(100) NOT NULL DEFAULT 'gc-starter' COMMENT '桶名称',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_bin COMMENT ='文件表';

DROP TABLE IF EXISTS `big_screen_page`;
CREATE TABLE `big_screen_page`
(
    `id`          bigint(64)   NOT NULL AUTO_INCREMENT,
    `name`        varchar(100) NOT NULL DEFAULT '' COMMENT '页面中文名称',
    `code`        varchar(255) NOT NULL DEFAULT '' COMMENT '页面编码，页面唯一标识符',
    `cover_picture`        varchar(255) NOT NULL DEFAULT '' COMMENT '封面图片文件路径',
    `icon`        varchar(100) NOT NULL DEFAULT '' COMMENT '页面图标',
    `icon_color`  varchar(100) NOT NULL DEFAULT '' COMMENT '图标颜色',
    `type`        varchar(100) NOT NULL DEFAULT 'custom' COMMENT '页面类型',
    `layout`      varchar(255) NOT NULL DEFAULT '' COMMENT '组件布局，记录组件的相对位置和顺序',
    `config`      longtext COMMENT '表单属性，只有表单类型时才有这个值',
    `parent_code` varchar(255) NOT NULL DEFAULT '' COMMENT '父级目录编码',
    `order_num`   bigint(64)   NOT NULL DEFAULT '0' COMMENT '排序',
    `remark`      varchar(100) NOT NULL DEFAULT '' COMMENT '备忘',
    `model_code`  varchar(255) NOT NULL DEFAULT '' COMMENT '模型编码',
    `app_code`    varchar(255) NOT NULL DEFAULT '' COMMENT '所属应用编码',
    `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `del_flag`    tinyint(1)   NOT NULL DEFAULT '0' COMMENT '删除标识符 1 删除 0未删',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='页面基本信息表';

# 模板表
DROP TABLE IF EXISTS `big_screen_page_template`;
CREATE TABLE `big_screen_page_template`
(
    `id`          bigint(64)                       NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`        varchar(100) COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '模板名称',
    `type`        varchar(100) COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '模板分类',
    `config`      text COLLATE utf8mb4_bin                  DEFAULT NULL COMMENT '模板配置',
    `thumbnail`   varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '缩略图',
    `remark`      varchar(255) COLLATE utf8mb4_bin NOT NULL DEFAULT '' COMMENT '备注',
    `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `del_flag`    tinyint(4)                       NOT NULL DEFAULT '0' COMMENT '删除标记0:保留，1:删除',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_bin COMMENT ='页面模板表';

DROP TABLE IF EXISTS `big_screen_type`;
CREATE TABLE `big_screen_type` (
  `id` bigint(64) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) DEFAULT NULL COMMENT '名称',
  `code` varchar(255) DEFAULT NULL COMMENT '名称',
  `type` varchar(255) DEFAULT NULL COMMENT '名称',
  `order_num`   bigint(64)   NOT NULL DEFAULT '0' COMMENT '排序',
  `update_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='大屏、资源库、组件库分类';

DROP TABLE IF EXISTS `big_screen_biz_component`;
CREATE TABLE `big_screen_biz_component` (
    `id`             bigint(64)   NOT NULL AUTO_INCREMENT,
    `name`           varchar(100) NOT NULL DEFAULT '' COMMENT '业务组件中文名称',
    `code`           varchar(255) NOT NULL DEFAULT '' COMMENT '业务组件编码，唯一标识符',
    `type`          varchar(255) NOT NULL DEFAULT '' COMMENT '分组',
    `cover_picture`  varchar(255) NOT NULL DEFAULT '' COMMENT '封面图片文件路径',
    `vue_content`     longtext COMMENT 'vue组件内容',
    `setting_content` longtext COMMENT '组件配置内容',
    `order_num`      bigint(64)   NOT NULL DEFAULT '0' COMMENT '排序',
    `remark`         varchar(100) NOT NULL DEFAULT '' COMMENT '备注',
    `update_date`    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date`    timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `module_code` varchar(255) NOT NULL DEFAULT '' COMMENT '模块编码',
    `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
    PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='业务组件表';


DROP TABLE IF EXISTS `big_screen_category_tree`;
CREATE TABLE `big_screen_category_tree` (
  `id` bigint(64) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) DEFAULT NULL COMMENT '名称',
  `parent_id` bigint(64) DEFAULT NULL COMMENT '父级ID',
  `parent_name` varchar(255) DEFAULT NULL COMMENT '父级名称',
  `tree_level` bigint(20) NOT NULL DEFAULT '0',
  `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  `table_name` varchar(255) NOT NULL,
  `module_code` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='数据集种类树';

DROP TABLE IF EXISTS `big_screen_datasource_config`;
CREATE TABLE `big_screen_datasource_config` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `source_name` varchar(255) DEFAULT NULL COMMENT '数据源名称',
  `source_type` varchar(255) DEFAULT NULL COMMENT '数据源类型',
  `driver_class_name` varchar(255) DEFAULT NULL COMMENT '连接驱动',
  `database` varchar(255) DEFAULT NULL COMMENT '数据',
  `host` varchar(255) DEFAULT NULL COMMENT '主机',
  `port` int(16) DEFAULT NULL COMMENT '端口',
  `username` varchar(255) DEFAULT NULL COMMENT '用户名',
  `password` text COMMENT '密码',
  `coding` varchar(255) DEFAULT NULL COMMENT '编码',
  `url` varchar(255) DEFAULT NULL COMMENT '连接url',
  `advance_setting_flag` int(16) DEFAULT NULL COMMENT '是否启用高级设置，1：是  ，0：否',
  `init_conn_num` int(16) DEFAULT NULL COMMENT '初始化连接数',
  `max_active_conn_num` int(16) DEFAULT NULL COMMENT '最大活动连接数',
  `max_idle_conn_num` int(16) DEFAULT NULL COMMENT '最大空闲连接数',
  `min_idle_conn_num` int(16) DEFAULT NULL COMMENT '最小空闲连接数',
  `max_wait_conn_num` varchar(255) DEFAULT NULL COMMENT '最大等待时间 [ 单位:毫秒 ]',
  `sql_check` text COMMENT 'SQL验证查询',
  `getconn_check_flag` int(16) DEFAULT NULL COMMENT '获取连接是否校验，1：是  ，0：否',
  `return_check_flag` int(16) DEFAULT NULL COMMENT '归还连接是否校验，1：是  ，0：否',
  `start_idle_check_flag` int(16) DEFAULT NULL COMMENT '开启空闲回收期校验，1：是  ，0：否',
  `idle_conn_dormant_time` int(16) DEFAULT NULL COMMENT '空闲连接回收器休眠时间  [ 单位:毫秒 ]',
  `idle_conn_check_num` int(16) DEFAULT NULL COMMENT '空闲连接回收检查数',
  `keep_idle_min_time` int(16) DEFAULT NULL COMMENT '保持空闲最小时间值 [ 单位：秒]',
  `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  `module_code` varchar(255) DEFAULT NULL COMMENT '模块编码',
  `editable` tinyint(2) DEFAULT '0' COMMENT '是否可编辑，0 不可编辑 1 可编辑',
  `remark` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB  DEFAULT CHARSET=utf8 COMMENT='数据源配置表';

DROP TABLE IF EXISTS `big_screen_dataset`;
CREATE TABLE `big_screen_dataset` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '主键',
  `name` varchar(255) CHARACTER SET utf8 DEFAULT NULL COMMENT '名称',
  `type_id` bigint(32) DEFAULT NULL COMMENT '种类ID',
  `remark` text CHARACTER SET utf8 COMMENT '描述',
  `dataset_type` varchar(64) CHARACTER SET utf8 NOT NULL COMMENT '数据集类型（自定义数据集 custom、模型数据集model、原始数据集original、API数据集api、JSON数据集 json）',
  `dataset_rel_id` bigint(32) DEFAULT NULL COMMENT '数据集关联ID',
  `module_code` varchar(255) COLLATE utf8_general_mysql500_ci DEFAULT NULL COMMENT '模块编码',
  `editable` tinyint(2) NOT NULL DEFAULT '0' COMMENT '是否可编辑，0 不可编辑 1 可编辑',
  `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  `data` text COLLATE utf8_general_mysql500_ci COMMENT '用于存储数据集配置的字段',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB   DEFAULT CHARSET=utf8 COLLATE=utf8_general_mysql500_ci COMMENT='数据集表';

DROP TABLE IF EXISTS `big_screen_datasets_custom`;
CREATE TABLE `big_screen_datasets_custom` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '数据集ID',
  `code` varchar(64) NOT NULL COMMENT '数据集编码',
  `curing_type` varchar(32) DEFAULT NULL COMMENT '结果固化形式，1、表 ； 2、视图',
  `source_id` varchar(64) DEFAULT NULL COMMENT '数据源id',
  `process_type` int(16) NOT NULL COMMENT '数据集加工类型。1、可视化数据加工 ；2、SQL数据加工；3、代码编辑器',
  `field_json` text COMMENT '数据集字段json',
  `sql_process` text COMMENT 'Sql数据处理',
  `code_process` longtext COMMENT '代码数据处理',
  `param_config` text COMMENT '参数配置json',
  `field_desc` text COMMENT '字段描述json',
  `cache_field` longtext COMMENT '缓存字段',
  `script` text COMMENT '结果转换脚本',
  `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='自助数据集表';

DROP TABLE IF EXISTS `big_screen_datasets_original`;
CREATE TABLE `big_screen_datasets_original` (
  `id` bigint(32) NOT NULL AUTO_INCREMENT COMMENT '数据集ID',
  `table_name` varchar(255) DEFAULT NULL COMMENT '表名',
  `source_id` bigint(32) DEFAULT NULL COMMENT '关联数据源ID',
  `field_json` text COMMENT '数据集字段json',
  `field_desc` text COMMENT '字段描述',
  `field_info` text COMMENT '所选字段',
  `repeat_status` tinyint(2) NOT NULL DEFAULT '0',
  `cache_field` longtext COMMENT '缓存字段',
  `update_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
  `create_date` timestamp                        NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  `del_flag` tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB   DEFAULT CHARSET=utf8 COMMENT='原始数据集表';