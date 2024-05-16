DROP TABLE IF EXISTS `big_screen_file`;
CREATE TABLE `big_screen_file`
(
    `id`             bigint(64)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `module`         varchar(255) NOT NULL DEFAULT '' COMMENT '所属分组',
    `type`           varchar(255) NOT NULL DEFAULT '' COMMENT '类型，图片：picture、视频：video、模型：model、引用：reference,其他：other',
    `original_name`  varchar(255) NOT NULL DEFAULT '' COMMENT '原文件名',
    `new_name`       varchar(255) NOT NULL DEFAULT '' COMMENT '新文件名',
    `extension`      varchar(20)  NOT NULL DEFAULT '' COMMENT '后缀名(如: txt、png、doc、java等)',
    `path`           varchar(255) NOT NULL DEFAULT '' COMMENT '路径',
    `url`            varchar(255) NOT NULL DEFAULT '' COMMENT '访问路径',
    `size`           bigint(64)   NOT NULL DEFAULT '0' COMMENT '文件大小',
    `download_count` int(11)      NOT NULL DEFAULT '0' COMMENT '下载次数',
    `user_name`      varchar(20)  NOT NULL DEFAULT '' COMMENT '上传用户',
    `hide`           tinyint(4)   NOT NULL DEFAULT 0 COMMENT '是否在资源库中隐藏，1是0否',
    `cover_url`      varchar(255) NOT NULL DEFAULT '' COMMENT '封面图片路径',
    `cover_id`       varchar(64)   NOT NULL DEFAULT '0' COMMENT '封面图片id',
    `bucket`         varchar(100) NOT NULL DEFAULT 'gc-starter' COMMENT '桶名称',
    `create_date`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `update_date`    timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_by`      bigint(64)   null     default 2 comment '创建人',
    `update_by`      bigint(64)   null     default 2 comment '更新人',
    `del_flag`       tinyint(4)   NOT NULL DEFAULT '0' COMMENT '删除标记0:保留，1:删除',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_bin COMMENT ='文件表';

DROP TABLE IF EXISTS `big_screen_page`;
CREATE TABLE `big_screen_page`
(
    `id`            bigint(64)   NOT NULL AUTO_INCREMENT,
    `name`          varchar(100) NOT NULL DEFAULT '' COMMENT '页面中文名称',
    `code`          varchar(255) NOT NULL DEFAULT '' COMMENT '页面编码，页面唯一标识符',
    `cover_picture` varchar(255) NOT NULL DEFAULT '' COMMENT '封面图片文件路径',
    `type`          varchar(100) NOT NULL DEFAULT '' COMMENT '页面类型',
    `config`        longtext COMMENT '页面配置',
    `parent_code`   varchar(255) NOT NULL DEFAULT '' COMMENT '父级目录编码',
    `order_num`     bigint(64)   NOT NULL DEFAULT '0' COMMENT '排序',
    `remark`        varchar(100) NOT NULL DEFAULT '' COMMENT '备忘',
    `update_date`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date`   timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`     bigint(64)   null     default 2 comment '创建人',
    `update_by`     bigint(64)   null     default 2 comment '更新人',
    `del_flag`      tinyint(1)   NOT NULL DEFAULT '0' COMMENT '删除标识符 1 删除 0未删',
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
    `create_by`   bigint(64)                       null     default 2 comment '创建人',
    `update_by`   bigint(64)                       null     default 2 comment '更新人',
    `del_flag`    tinyint(4)                       NOT NULL DEFAULT '0' COMMENT '删除标记0:保留，1:删除',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_bin COMMENT ='页面模板表';

DROP TABLE IF EXISTS `big_screen_type`;
CREATE TABLE `big_screen_type`
(
    `id`          bigint(64) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`        varchar(255)        DEFAULT NULL COMMENT '分类名称',
    `code`        varchar(255)        DEFAULT NULL COMMENT '分类编码',
    `type`        varchar(255)        DEFAULT NULL COMMENT '分类类型',
    `order_num`   bigint(64) NOT NULL DEFAULT '0' COMMENT '排序',
    `update_date` timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date` timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`   bigint(64) null     default 2 comment '创建人',
    `update_by`   bigint(64) null     default 2 comment '更新人',
    `del_flag`    tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8 COMMENT ='大屏、素材库、组件库分类';

DROP TABLE IF EXISTS `big_screen_biz_component`;
CREATE TABLE `big_screen_biz_component`
(
    `id`               bigint(64)   NOT NULL AUTO_INCREMENT,
    `name`             varchar(100) NOT NULL DEFAULT '' COMMENT '业务组件中文名称',
    `code`             varchar(255) NOT NULL DEFAULT '' COMMENT '业务组件编码，唯一标识符',
    `type`             varchar(255) NOT NULL DEFAULT '' COMMENT '分组',
    `biz_type`             varchar(255) NOT NULL DEFAULT '' COMMENT '组件类型 1.组件 2.模板 3.区块',
    `cover_picture`    varchar(255) NOT NULL DEFAULT '' COMMENT '封面图片文件路径',
    `vue_content`      longtext COMMENT 'vue组件内容',
    `setting_content`  longtext COMMENT '组件配置内容',
    `order_num`        bigint(64)   NOT NULL DEFAULT '0' COMMENT '排序',
    `remark`           varchar(100) NOT NULL DEFAULT '' COMMENT '备注',
    `default_data`     longtext COMMENT '默认数据json',
    `component_define` longtext COMMENT '组件定义js',
    `interaction`      text COMMENT '交互配置',
    `design_type`      int(11)      NOT NULL DEFAULT 1 COMMENT '设计方式 1.低代码开发 2.在线开发',
    `scope`            varchar(255)      NOT NULL DEFAULT 1 COMMENT '可用范围 1：大屏 2：PC仪表盘 3：移动仪表盘',
    `page_code`        varchar(255) NOT NULL DEFAULT '' COMMENT '低代码开发时，关联的自定义页面编码(因为这时候，数据保存在page表)',
    `update_date`      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date`      timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`        bigint(64)   null     default 2 comment '创建人',
    `update_by`        bigint(64)   null     default 2 comment '更新人',
    `del_flag`         tinyint(2)   NOT NULL DEFAULT '0' COMMENT '删除标识',

    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8 COMMENT ='业务组件表';

DROP TABLE IF EXISTS `ds_category_tree`;
CREATE TABLE `ds_category_tree`
(
    `id`          bigint(64)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `ids`         text COMMENT 'id序列',
    `name`        varchar(255)          DEFAULT NULL COMMENT '名称',
    `parent_id`   bigint(64)            DEFAULT NULL COMMENT '父级ID',
    `type`        varchar(255) NOT NULL,
    `update_date` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`   bigint(64)   null     default 2 comment '创建人',
    `update_by`   bigint(64)   null     default 2 comment '更新人',
    `del_flag`    tinyint(2)   NOT NULL DEFAULT '0' COMMENT '删除标识',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8 COMMENT ='数据集分类树';


DROP TABLE IF EXISTS `ds_datasource`;
CREATE TABLE `ds_datasource`
(
    `id`                bigint(20) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `source_name`       varchar(255)        DEFAULT NULL COMMENT '数据源名称',
    `source_type`       varchar(255)        DEFAULT NULL COMMENT '数据源类型',
    `driver_class_name` varchar(255)        DEFAULT NULL COMMENT '连接驱动',
    `url`               varchar(255)        DEFAULT NULL COMMENT '连接url',
    `host`              varchar(255)        DEFAULT NULL COMMENT '主机',
    `port`              int(16)             DEFAULT NULL COMMENT '端口',
    `username`          varchar(255)        DEFAULT NULL COMMENT '用户名',
    `password`          text COMMENT '密码',
    `table_name`        varchar(255)        DEFAULT NULL COMMENT '表名',
    `editable`          tinyint(2)          DEFAULT '0' COMMENT '是否可编辑，0 不可编辑 1 可编辑',
    `remark`            varchar(255)        DEFAULT NULL,
    `update_date`       timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date`       timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`         bigint(64) null     default 2 comment '创建人',
    `update_by`         bigint(64) null     default 2 comment '更新人',
    `del_flag`          tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8 COMMENT ='数据源配置表';

DROP TABLE IF EXISTS `ds_dataset`;
CREATE TABLE `ds_dataset`
(
    `id`           bigint(32)                     NOT NULL AUTO_INCREMENT COMMENT '主键',
    `name`         varchar(255) CHARACTER SET utf8         DEFAULT NULL COMMENT '名称',
    `code`         varchar(255) CHARACTER SET utf8         DEFAULT NULL COMMENT '编码',
    `type_id`      varchar(255)                            DEFAULT NULL COMMENT '种类ID',
    `remark`       text CHARACTER SET utf8 COMMENT '描述',
    `dataset_type` varchar(64) CHARACTER SET utf8 NOT NULL COMMENT '数据集类型（自定义数据集 custom、模型数据集model、原始数据集original、API数据集api、JSON数据集 json）',
    `editable`     tinyint(2)                     NOT NULL DEFAULT '0' COMMENT '是否可编辑，0 不可编辑 1 可编辑',
    `source_id`    bigint(32)                              DEFAULT NULL COMMENT '数据源ID',
    `cache`        tinyint(1)                              DEFAULT 0 NOT NULL COMMENT '是否对执行结构缓存 0 不缓存 1 缓存',
    `config`       longtext COMMENT '数据集配置',
    `update_date`  timestamp                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date`  timestamp                      NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`    bigint(64)                     null     default 2 comment '创建人',
    `update_by`    bigint(64)                     null     default 2 comment '更新人',
    `del_flag`     tinyint(2)                     NOT NULL DEFAULT '0' COMMENT '删除标识',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_general_mysql500_ci COMMENT ='数据集表';

DROP TABLE IF EXISTS `ds_label`;
CREATE TABLE `ds_label`
(
    `id`          bigint(32) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `label_name`  varchar(255)        DEFAULT NULL COMMENT '标签名称',
    `label_type`  varchar(255)        DEFAULT NULL COMMENT '标签类型',
    `label_desc`  varchar(255)        DEFAULT NULL COMMENT '标签描述',
    `update_date` timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date` timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`   bigint(64) null     default 2 comment '创建人',
    `update_by`   bigint(64) null     default 2 comment '更新人',
    `del_flag`    tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_general_mysql500_ci COMMENT ='标签';

DROP TABLE IF EXISTS `ds_dataset_label`;
CREATE TABLE `ds_dataset_label`
(
    `id`         bigint(32) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `dataset_id` bigint(32) DEFAULT NULL COMMENT '数据集ID',
    `label_id`   bigint(32) DEFAULT NULL COMMENT '标签ID',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8
  COLLATE = utf8_general_mysql500_ci COMMENT ='数据集与标签关联表';

DROP TABLE IF EXISTS `big_screen_map`;
CREATE TABLE `big_screen_map`
(
    `id`                bigint(32) NOT NULL AUTO_INCREMENT COMMENT '主键',
    `parent_id`         varchar(255)        DEFAULT NULL COMMENT '父级地图id',
    `map_code`          varchar(255)        DEFAULT NULL COMMENT '地图编码',
    `name`              varchar(255)        DEFAULT NULL COMMENT '地图名称',
    `geo_json`          longtext            DEFAULT NULL COMMENT '地图geoJson',
    `level`             tinyint(2) NOT NULL DEFAULT 0 COMMENT '地图级别 0-世界 1-国家 2-省 3-市 4-区县',
    `uploaded_geo_json` tinyint(2) NOT NULL DEFAULT 0 COMMENT '是否已上传geoJson 0-否 1-是',
    `update_date`       timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '更新时间',
    `create_date`       timestamp  NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `create_by`         bigint(64) null     default 2 comment '创建人',
    `update_by`         bigint(64) null     default 2 comment '更新人',
    `del_flag`          tinyint(2) NOT NULL DEFAULT '0' COMMENT '删除标识',
    PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8 COMMENT ='地图数据维护表';

DROP TABLE IF EXISTS `big_screen_page_preview`;
CREATE TABLE `big_screen_page_preview`
(
    `id`          bigint(32)   NOT NULL AUTO_INCREMENT COMMENT '主键',
    `code`        varchar(255) NOT NULL DEFAULT '' COMMENT '页面编码，页面唯一标识符',
    `config`      longtext COMMENT '页面配置',
    `create_date` timestamp    NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    `type`        varchar(255) NOT NULL DEFAULT '' COMMENT '类型，bigScreen：大屏，dashboard：仪表盘，component：业务组件',
    PRIMARY KEY (`id`)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4 COMMENT ='页面预览缓存表，每日定时删除';
