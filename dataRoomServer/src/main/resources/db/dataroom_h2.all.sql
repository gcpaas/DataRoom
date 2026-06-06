-- DataRoom Plus 数据库表结构
-- H2 Database

-- ----------------------------
-- 数据源表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_data_source
(
    id               VARCHAR(50)  NOT NULL COMMENT '主键',
    name             VARCHAR(255) NOT NULL COMMENT '名称',
    code             VARCHAR(100) DEFAULT NULL COMMENT '编码',
    data_source_type VARCHAR(50)  NOT NULL COMMENT '数据源类型',
    data_source      TEXT         DEFAULT NULL COMMENT '数据源配置',
    create_date      TIMESTAMP    DEFAULT NULL COMMENT '创建时间',
    create_user      VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    update_date      TIMESTAMP    DEFAULT NULL COMMENT '更新时间',
    update_user      VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    tenant_code      VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    del_flag         VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (id),
    CONSTRAINT uk_code UNIQUE (code)
);

-- ----------------------------
-- 数据集表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_dataset
(
    id               VARCHAR(50) NOT NULL COMMENT '主键',
    data_source_code VARCHAR(100) DEFAULT NULL COMMENT '数据源编码',
    name             VARCHAR(255) DEFAULT NULL COMMENT '名称',
    code             VARCHAR(100) DEFAULT NULL COMMENT '编码',
    dataset_type     VARCHAR(50)  DEFAULT NULL COMMENT '数据集类型',
    parent_code      VARCHAR(100) DEFAULT NULL COMMENT '所属目录编码',
    dataset          TEXT         DEFAULT NULL COMMENT '数据集配置',
    input_list       TEXT         DEFAULT NULL COMMENT '入参列表',
    output_list      TEXT         DEFAULT NULL COMMENT '出参列表',
    create_date      TIMESTAMP    DEFAULT NULL COMMENT '创建时间',
    create_user      VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    update_date      TIMESTAMP    DEFAULT NULL COMMENT '更新时间',
    update_user      VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    tenant_code      VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    del_flag         VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (id),
    CONSTRAINT uk_dataset_code UNIQUE (code)
);
CREATE INDEX IF NOT EXISTS idx_dataset_parent_code ON dr_dataset(parent_code);

-- ----------------------------
-- 地图表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_map
(
    id                VARCHAR(50) NOT NULL COMMENT '主键',
    name              VARCHAR(255) DEFAULT NULL COMMENT '地图名称',
    code              VARCHAR(100) DEFAULT NULL COMMENT '编码',
    parent_code       VARCHAR(100) DEFAULT NULL COMMENT '父级地图编码',
    level             INT          DEFAULT NULL COMMENT '地图级别 0-世界 1-国家 2-省 3-市 4-区县',
    geo_json          CLOB         DEFAULT NULL COMMENT 'geo地图数据json',
    uploaded_geo_json INT          DEFAULT NULL COMMENT '是否已上传geoJson 0-否 1-是',
    create_date       TIMESTAMP    DEFAULT NULL COMMENT '创建时间',
    create_user       VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    update_date       TIMESTAMP    DEFAULT NULL COMMENT '更新时间',
    update_user       VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    tenant_code       VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    del_flag          VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (id),
    CONSTRAINT uk_map_code UNIQUE (code)
);
CREATE INDEX IF NOT EXISTS idx_map_parent_code ON dr_map(parent_code);

-- ----------------------------
-- 页面表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_page
(
    id          VARCHAR(50) NOT NULL COMMENT '主键',
    name        VARCHAR(255) DEFAULT NULL COMMENT '页面名称',
    code        VARCHAR(100) DEFAULT NULL COMMENT '页面编码',
    page_type   VARCHAR(50)  DEFAULT 'page' COMMENT '页面类型',
    parent_code VARCHAR(100) DEFAULT 'root' COMMENT '所属目录编码',
    remark      VARCHAR(500) DEFAULT NULL COMMENT '页面描述',
    thumbnail   VARCHAR(500) DEFAULT NULL COMMENT '封面地址',
    page_status VARCHAR(50)  DEFAULT 'design' COMMENT '页面状态',
    create_date TIMESTAMP    DEFAULT NULL COMMENT '创建时间',
    create_user VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    update_date TIMESTAMP    DEFAULT NULL COMMENT '更新时间',
    update_user VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    tenant_code VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    del_flag    VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (id),
    CONSTRAINT uk_page_code UNIQUE (code)
);
CREATE INDEX IF NOT EXISTS idx_page_type ON dr_page(page_type);
CREATE INDEX IF NOT EXISTS idx_page_parent_code ON dr_page(parent_code);

-- ----------------------------
-- 中转态页面表（历史记录、快照）
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_page_stage
(
    id          VARCHAR(50) NOT NULL COMMENT '主键',
    page_code   VARCHAR(100) DEFAULT NULL COMMENT '页面编码',
    remark      VARCHAR(500) DEFAULT NULL COMMENT '说明',
    page_status VARCHAR(50)  DEFAULT 'design' COMMENT '页面状态',
    page_type   VARCHAR(50)  DEFAULT NULL COMMENT '页面类型',
    page_config TEXT         DEFAULT NULL COMMENT '页面配置',
    create_date TIMESTAMP    DEFAULT NULL COMMENT '创建时间',
    create_user VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    update_date TIMESTAMP    DEFAULT NULL COMMENT '更新时间',
    update_user VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    tenant_code VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    del_flag    VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_page_stage_code ON dr_page_stage(page_code);
CREATE INDEX IF NOT EXISTS idx_page_stage_status ON dr_page_stage(page_status);

-- ----------------------------
-- 资源表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_resource
(
    id            VARCHAR(50) NOT NULL COMMENT '主键',
    name          VARCHAR(255) DEFAULT NULL COMMENT '名称',
    original_name VARCHAR(255) DEFAULT NULL COMMENT '原始名称',
    resource_type VARCHAR(50)  DEFAULT NULL COMMENT '资源类型',
    parent_code   VARCHAR(100) DEFAULT NULL COMMENT '上级目录',
    path          VARCHAR(500) DEFAULT NULL COMMENT '存储的路径',
    url           VARCHAR(500) DEFAULT NULL COMMENT '访问地址',
    thumbnail     VARCHAR(500) DEFAULT NULL COMMENT '缩略图、封面地址',
    size          INT          DEFAULT NULL COMMENT '文件大小（单位：KB）',
    remark        VARCHAR(500) DEFAULT NULL COMMENT '描述',
    config        CLOB         DEFAULT NULL COMMENT '模型个性化配置（JSON）',
    create_date   TIMESTAMP    DEFAULT NULL COMMENT '创建时间',
    create_user   VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    update_date   TIMESTAMP    DEFAULT NULL COMMENT '更新时间',
    update_user   VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    tenant_code   VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    del_flag      VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_resource_parent_code ON dr_resource(parent_code);

-- ----------------------------
-- 操作日志表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_operation_log
(
    id                   VARCHAR(50)  NOT NULL COMMENT '主键',
    trace_id             VARCHAR(128) DEFAULT NULL COMMENT '链路标识',
    operator_id          VARCHAR(64)  DEFAULT NULL COMMENT '操作者ID',
    operator_name        VARCHAR(128) DEFAULT NULL COMMENT '操作者名称',
    operator_role        VARCHAR(255) DEFAULT NULL COMMENT '操作者角色',
    target_type          VARCHAR(64)  DEFAULT NULL COMMENT '目标类型',
    target_id            VARCHAR(128) DEFAULT NULL COMMENT '目标标识',
    target_name          VARCHAR(255) DEFAULT NULL COMMENT '目标名称',
    action_type          VARCHAR(64)  DEFAULT NULL COMMENT '动作类型',
    action_desc          VARCHAR(255) DEFAULT NULL COMMENT '动作说明',
    business_type        VARCHAR(128) DEFAULT NULL COMMENT '业务类型',
    business_name        VARCHAR(255) DEFAULT NULL COMMENT '业务名称',
    business_desc        VARCHAR(255) DEFAULT NULL COMMENT '业务说明',
    request_uri          VARCHAR(512) DEFAULT NULL COMMENT '请求地址',
    request_method       VARCHAR(16)  DEFAULT NULL COMMENT '请求方法',
    client_ip            VARCHAR(64)  DEFAULT NULL COMMENT '客户端IP',
    user_agent           VARCHAR(512) DEFAULT NULL COMMENT 'User-Agent',
    content_type         VARCHAR(128) DEFAULT NULL COMMENT '内容类型',
    query_params         CLOB         DEFAULT NULL COMMENT '查询参数',
    request_body         CLOB         DEFAULT NULL COMMENT '请求体',
    request_param_summary CLOB        DEFAULT NULL COMMENT '请求摘要',
    result_status        VARCHAR(32)  DEFAULT NULL COMMENT '执行结果',
    response_code        INT          DEFAULT NULL COMMENT '响应码',
    response_message     VARCHAR(512) DEFAULT NULL COMMENT '响应消息',
    exception_type       VARCHAR(255) DEFAULT NULL COMMENT '异常类型',
    exception_stack      CLOB         DEFAULT NULL COMMENT '异常堆栈',
    request_time         TIMESTAMP    DEFAULT NULL COMMENT '请求时间',
    duration_ms          BIGINT       DEFAULT NULL COMMENT '总耗时',
    handler_duration_ms  BIGINT       DEFAULT NULL COMMENT '处理耗时',
    create_date          TIMESTAMP    DEFAULT NULL COMMENT '创建时间',
    create_user          VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    update_date          TIMESTAMP    DEFAULT NULL COMMENT '更新时间',
    update_user          VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    tenant_code          VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    del_flag             VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (id)
);
CREATE INDEX IF NOT EXISTS idx_operation_log_request_time ON dr_operation_log(request_time);
CREATE INDEX IF NOT EXISTS idx_operation_log_target_type ON dr_operation_log(target_type);

-- ----------------------------
-- 用户表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_user
(
    id          VARCHAR(50)  NOT NULL COMMENT '主键',
    account     VARCHAR(100) NOT NULL COMMENT '账号',
    username    VARCHAR(100) NOT NULL COMMENT '用户名',
    password    VARCHAR(500) NOT NULL COMMENT '密码',
    phone       VARCHAR(20)  DEFAULT NULL COMMENT '联系电话',
    role        VARCHAR(200) DEFAULT NULL COMMENT '角色编码，多个用逗号分隔',
    status      VARCHAR(20)  DEFAULT 'NORMAL' COMMENT '状态：NORMAL-正常 LOCKED-锁定 DISABLED-禁用 PASSWORD_EXPIRED-密码过期',
    login_fail_count INT     DEFAULT 0 COMMENT '连续登录密码错误次数',
    login_locked_until TIMESTAMP DEFAULT NULL COMMENT '登录锁定截止时间',
    expire_date TIMESTAMP    DEFAULT NULL COMMENT '有效期截止时间，NULL表示永久有效',
    create_date TIMESTAMP    DEFAULT NULL COMMENT '创建时间',
    create_user VARCHAR(50)  DEFAULT NULL COMMENT '创建人',
    update_date TIMESTAMP    DEFAULT NULL COMMENT '更新时间',
    update_user VARCHAR(50)  DEFAULT NULL COMMENT '更新人',
    tenant_code VARCHAR(50)  DEFAULT NULL COMMENT '租户编码',
    del_flag    VARCHAR(1)   DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (id),
    CONSTRAINT uk_user_account UNIQUE (account)
);

-- ----------------------------
-- 用户表初始数据
-- 仅当对应 account 不存在时插入，避免重复初始化
-- ----------------------------
INSERT INTO dr_user (id, account, username, password, role, status, tenant_code, del_flag)
SELECT '1', 'admin', '管理员', 'mtl8l4fQr6laQ9qETcol8dNjAuKroZUB7KqLnHIAIrcrdft+5A16oSOTDRKJSln3FhOjHNZcchO7hQ815M2OFWfVogakKVKZb4U+dP9TZ9WMg3/i5wLCRLTZQW2cpb5zD9gFjsIQ3vDeTnR+fS12HWqgBZ+npyAS80FdAYyNsuHGzTQPn8lIAnZf5qTjd6X15H9MrEz5HtjHGOfpdcTJm9796mPNllyccjhegESrfkf7EHxG1ONCR2MdkEL2MypbQpzDhFpyOl/AGbXJLEwkGa7DVmnps96/AFYDUJdX8sqm+YjEstlC491g5ALhvkD/N7AVkyhwx4Ynjgn0Toj3vg==', 'manager,developer,sharer', 'NORMAL', 'default', '0'
WHERE NOT EXISTS (SELECT 1 FROM dr_user WHERE account = 'admin');

INSERT INTO dr_user (id, account, username, password, role, status, tenant_code, del_flag)
SELECT '2', 'developer', '开发者', 'K0LmVpWYPrDwtbaJ40v+xSRsK/g42UZRq+Et1KS8FMYTrC3fsR0n9C7HUTb0ngRLMUuN57KE2pX0vcAhWDB+/5XOiMBBmdmW1Zz5b9kP10Zcxf2aajqg0tVWB8VDkSAsVcj9q5Mdfozpn2Ms5Q61FMfIEFnN6DR67aOD9tczwAPJ/bZbu84PjqGeiKq2VevZHUOL/z1t6Zto4Ql53JliTroah7ZTsP5IiUf6lhX5Ckk2RrviB7KwmWq1CgVZ1JEcqj40ZB7IjKI6ZiPGwKVG188jgkPTXGgAfs0uLKs89OGUhxY1iL01aj7jcj/v80RoXJmWa5UJqWLGmtXfwqhqCQ==', 'developer,sharer', 'NORMAL', 'default', '0'
WHERE NOT EXISTS (SELECT 1 FROM dr_user WHERE account = 'developer');

INSERT INTO dr_user (id, account, username, password, role, status, tenant_code, del_flag)
SELECT '3', 'sharer', '分享者', 'MQhucQR4QZwvLQHmOEbWeVP5hR+oJMZTBHLKcvksa5xsaGc+X6WAhvc4qctWvXdfKyRt1tUJaC5FArc4Q74+TVPaQhhn8a4K2UWb+Mm+35xPfiO7ZfWVRu9JoEDkxqnO92o0Bw/FDTfYz9OL0xdeYDYD8PN9x9DSlTNDuGE0bpyJqv6ZlgT79vzEG/iTUJN7u6QS71kV/7yJFJ0hm1CgSBvaa9X3q+5N0eD+P7q4UFNaFqTmuytc/5/OnHUDQJq6bvEsM+mV6HIEp+LXF2hqw7GJtoFc+5VZTiKn4PVGG7DBxh9rR7GbdS+Uhdnta6QO9sGbl3rQclUk+ObgiwUTnA==', 'sharer', 'NORMAL', 'default', '0'
WHERE NOT EXISTS (SELECT 1 FROM dr_user WHERE account = 'sharer');
