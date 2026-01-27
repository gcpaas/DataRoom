-- DataRoom Plus 数据库表结构
-- MySQL 8.0+

-- ----------------------------
-- 数据源表
-- ----------------------------
DROP TABLE IF EXISTS `dr_data_source`;
CREATE TABLE `dr_data_source`
(
    `id`               VARCHAR(50)  NOT NULL COMMENT '主键',
    `name`             VARCHAR(255) NOT NULL COMMENT '名称',
    `code`             VARCHAR(100) DEFAULT NULL COMMENT '编码',
    `data_source_type` VARCHAR(50)  NOT NULL COMMENT '数据源类型',
    `data_source`      TEXT         DEFAULT NULL COMMENT '数据源配置',
    `create_date`      DATETIME     DEFAULT NULL COMMENT '创建时间',
    `create_user`      VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    `update_date`      DATETIME     DEFAULT NULL COMMENT '更新时间',
    `update_user`      VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    `tenant_code`      VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    `del_flag`         VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据源表';

-- ----------------------------
-- 数据集表
-- ----------------------------
DROP TABLE IF EXISTS `dr_dataset`;
CREATE TABLE `dr_dataset`
(
    `id`               VARCHAR(50) NOT NULL COMMENT '主键',
    `data_source_code` VARCHAR(100) DEFAULT NULL COMMENT '数据源编码',
    `name`             VARCHAR(255) DEFAULT NULL COMMENT '名称',
    `code`             VARCHAR(100) DEFAULT NULL COMMENT '编码',
    `dataset_type`     VARCHAR(50)  DEFAULT NULL COMMENT '数据集类型',
    `parent_code`      VARCHAR(100) DEFAULT NULL COMMENT '所属目录编码',
    `dataset`          TEXT         DEFAULT NULL COMMENT '数据集配置',
    `input_list`       TEXT         DEFAULT NULL COMMENT '入参列表',
    `output_list`      TEXT         DEFAULT NULL COMMENT '出参列表',
    `create_date`      DATETIME     DEFAULT NULL COMMENT '创建时间',
    `create_user`      VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    `update_date`      DATETIME     DEFAULT NULL COMMENT '更新时间',
    `update_user`      VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    `tenant_code`      VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    `del_flag`         VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`),
    KEY                `idx_parent_code` (`parent_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据集表';

-- ----------------------------
-- 地图表
-- ----------------------------
DROP TABLE IF EXISTS `dr_map`;
CREATE TABLE `dr_map`
(
    `id`                VARCHAR(50) NOT NULL COMMENT '主键',
    `name`              VARCHAR(255) DEFAULT NULL COMMENT '地图名称',
    `code`              VARCHAR(100) DEFAULT NULL COMMENT '编码',
    `parent_code`       VARCHAR(100) DEFAULT NULL COMMENT '父级地图编码',
    `level`             INT          DEFAULT NULL COMMENT '地图级别 0-世界 1-国家 2-省 3-市 4-区县',
    `geo_json`          LONGTEXT     DEFAULT NULL COMMENT 'geo地图数据json',
    `uploaded_geo_json` INT          DEFAULT NULL COMMENT '是否已上传geoJson 0-否 1-是',
    `create_date`       DATETIME     DEFAULT NULL COMMENT '创建时间',
    `create_user`       VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    `update_date`       DATETIME     DEFAULT NULL COMMENT '更新时间',
    `update_user`       VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    `tenant_code`       VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    `del_flag`          VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`),
    KEY                 `idx_parent_code` (`parent_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='地图表';

-- ----------------------------
-- 页面表
-- ----------------------------
DROP TABLE IF EXISTS `dr_page`;
CREATE TABLE `dr_page`
(
    `id`          VARCHAR(50) NOT NULL COMMENT '主键',
    `name`        VARCHAR(255) DEFAULT NULL COMMENT '页面名称',
    `code`        VARCHAR(100) DEFAULT NULL COMMENT '页面编码',
    `page_type`   VARCHAR(50)  DEFAULT 'page' COMMENT '页面类型',
    `parent_code` VARCHAR(100) DEFAULT 'root' COMMENT '所属目录编码',
    `remark`      VARCHAR(500) DEFAULT NULL COMMENT '页面描述',
    `thumbnail`   VARCHAR(500) DEFAULT NULL COMMENT '封面地址',
    `page_status` VARCHAR(50)  DEFAULT 'design' COMMENT '页面状态',
    `create_date` DATETIME     DEFAULT NULL COMMENT '创建时间',
    `create_user` VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    `update_date` DATETIME     DEFAULT NULL COMMENT '更新时间',
    `update_user` VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    `tenant_code` VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    `del_flag`    VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (`id`),
    UNIQUE KEY `uk_code` (`code`),
    KEY           `idx_page_type` (`page_type`),
    KEY           `idx_parent_code` (`parent_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='页面表';

-- ----------------------------
-- 中转态页面表（历史记录、快照）
-- ----------------------------
DROP TABLE IF EXISTS `dr_page_stage`;
CREATE TABLE `dr_page_stage`
(
    `id`          VARCHAR(50) NOT NULL COMMENT '主键',
    `page_code`   VARCHAR(100) DEFAULT NULL COMMENT '页面编码',
    `remark`      VARCHAR(500) DEFAULT NULL COMMENT '说明',
    `page_status` VARCHAR(50)  DEFAULT 'design' COMMENT '页面状态',
    `page_type`   VARCHAR(50)  DEFAULT NULL COMMENT '页面类型',
    `page_config` TEXT         DEFAULT NULL COMMENT '页面配置',
    `create_date` DATETIME     DEFAULT NULL COMMENT '创建时间',
    `create_user` VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    `update_date` DATETIME     DEFAULT NULL COMMENT '更新时间',
    `update_user` VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    `tenant_code` VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    `del_flag`    VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (`id`),
    KEY           `idx_page_code` (`page_code`),
    KEY           `idx_page_status` (`page_status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='中转态页面表';

-- ----------------------------
-- 资源表
-- ----------------------------
DROP TABLE IF EXISTS `dr_resource`;
CREATE TABLE `dr_resource`
(
    `id`            VARCHAR(50) NOT NULL COMMENT '主键',
    `name`          VARCHAR(255) DEFAULT NULL COMMENT '名称',
    `original_name` VARCHAR(255) DEFAULT NULL COMMENT '原始名称',
    `resource_type` VARCHAR(50)  DEFAULT NULL COMMENT '资源类型',
    `parent_code`   VARCHAR(100) DEFAULT NULL COMMENT '上级目录',
    `path`          VARCHAR(500) DEFAULT NULL COMMENT '存储的路径',
    `url`           VARCHAR(500) DEFAULT NULL COMMENT '访问地址',
    `thumbnail`     VARCHAR(500) DEFAULT NULL COMMENT '缩略图、封面地址',
    `size`          INT          DEFAULT NULL COMMENT '文件大小（单位：KB）',
    `remark`        VARCHAR(500) DEFAULT NULL COMMENT '描述',
    `create_date`   DATETIME     DEFAULT NULL COMMENT '创建时间',
    `create_user`   VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    `update_date`   DATETIME     DEFAULT NULL COMMENT '更新时间',
    `update_user`   VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    `tenant_code`   VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    `del_flag`      VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (`id`),
    KEY             `idx_parent_code` (`parent_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='资源表';
