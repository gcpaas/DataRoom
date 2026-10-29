-- DataRoom Plus 数据库表结构
-- PostgreSQL

-- ----------------------------
-- 数据源表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_data_source
(
    id               VARCHAR(50)  NOT NULL,
    name             VARCHAR(255) NOT NULL,
    code             VARCHAR(100) DEFAULT NULL,
    data_source_type VARCHAR(50)  NOT NULL,
    data_source      TEXT         DEFAULT NULL,
    create_date      TIMESTAMP    DEFAULT NULL,
    create_user      VARCHAR(50)  DEFAULT NULL,
    update_date      TIMESTAMP    DEFAULT NULL,
    update_user      VARCHAR(50)  DEFAULT NULL,
    tenant_code      VARCHAR(50)  DEFAULT NULL,
    del_flag         VARCHAR(1)   DEFAULT '0',
    PRIMARY KEY (id),
    CONSTRAINT uk_code UNIQUE (code)
);
COMMENT ON TABLE dr_data_source IS '数据源表';
COMMENT ON COLUMN dr_data_source.id IS '主键';
COMMENT ON COLUMN dr_data_source.name IS '名称';
COMMENT ON COLUMN dr_data_source.code IS '编码';
COMMENT ON COLUMN dr_data_source.data_source_type IS '数据源类型';
COMMENT ON COLUMN dr_data_source.data_source IS '数据源配置';
COMMENT ON COLUMN dr_data_source.create_date IS '创建时间';
COMMENT ON COLUMN dr_data_source.create_user IS '创建人';
COMMENT ON COLUMN dr_data_source.update_date IS '更新时间';
COMMENT ON COLUMN dr_data_source.update_user IS '更新人';
COMMENT ON COLUMN dr_data_source.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_data_source.del_flag IS '删除标识(0：正常，1：删除)';

-- ----------------------------
-- 数据集表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_dataset
(
    id               VARCHAR(50)  NOT NULL,
    data_source_code VARCHAR(100) DEFAULT NULL,
    name             VARCHAR(255) DEFAULT NULL,
    code             VARCHAR(100) DEFAULT NULL,
    dataset_type     VARCHAR(50)  DEFAULT NULL,
    parent_code      VARCHAR(100) DEFAULT NULL,
    dataset          TEXT         DEFAULT NULL,
    input_list       TEXT         DEFAULT NULL,
    output_list      TEXT         DEFAULT NULL,
    create_date      TIMESTAMP    DEFAULT NULL,
    create_user      VARCHAR(50)  DEFAULT NULL,
    update_date      TIMESTAMP    DEFAULT NULL,
    update_user      VARCHAR(50)  DEFAULT NULL,
    tenant_code      VARCHAR(50)  DEFAULT NULL,
    del_flag         VARCHAR(1)   DEFAULT '0',
    PRIMARY KEY (id),
    CONSTRAINT uk_dataset_code UNIQUE (code)
);
COMMENT ON TABLE dr_dataset IS '数据集表';
COMMENT ON COLUMN dr_dataset.id IS '主键';
COMMENT ON COLUMN dr_dataset.data_source_code IS '数据源编码';
COMMENT ON COLUMN dr_dataset.name IS '名称';
COMMENT ON COLUMN dr_dataset.code IS '编码';
COMMENT ON COLUMN dr_dataset.dataset_type IS '数据集类型';
COMMENT ON COLUMN dr_dataset.parent_code IS '所属目录编码';
COMMENT ON COLUMN dr_dataset.dataset IS '数据集配置';
COMMENT ON COLUMN dr_dataset.input_list IS '入参列表';
COMMENT ON COLUMN dr_dataset.output_list IS '出参列表';
COMMENT ON COLUMN dr_dataset.create_date IS '创建时间';
COMMENT ON COLUMN dr_dataset.create_user IS '创建人';
COMMENT ON COLUMN dr_dataset.update_date IS '更新时间';
COMMENT ON COLUMN dr_dataset.update_user IS '更新人';
COMMENT ON COLUMN dr_dataset.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_dataset.del_flag IS '删除标识(0：正常，1：删除)';
CREATE INDEX IF NOT EXISTS idx_dataset_parent_code ON dr_dataset(parent_code);

-- ----------------------------
-- 地图表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_map
(
    id                VARCHAR(50)  NOT NULL,
    name              VARCHAR(255) DEFAULT NULL,
    code              VARCHAR(100) DEFAULT NULL,
    parent_code       VARCHAR(100) DEFAULT NULL,
    level             INTEGER      DEFAULT NULL,
    geo_json          TEXT         DEFAULT NULL,
    uploaded_geo_json INTEGER      DEFAULT NULL,
    create_date       TIMESTAMP    DEFAULT NULL,
    create_user       VARCHAR(50)  DEFAULT NULL,
    update_date       TIMESTAMP    DEFAULT NULL,
    update_user       VARCHAR(50)  DEFAULT NULL,
    tenant_code       VARCHAR(50)  DEFAULT NULL,
    del_flag          VARCHAR(1)   DEFAULT '0',
    PRIMARY KEY (id),
    CONSTRAINT uk_map_code UNIQUE (code)
);
COMMENT ON TABLE dr_map IS '地图表';
COMMENT ON COLUMN dr_map.id IS '主键';
COMMENT ON COLUMN dr_map.name IS '地图名称';
COMMENT ON COLUMN dr_map.code IS '编码';
COMMENT ON COLUMN dr_map.parent_code IS '父级地图编码';
COMMENT ON COLUMN dr_map.level IS '地图级别 0-世界 1-国家 2-省 3-市 4-区县';
COMMENT ON COLUMN dr_map.geo_json IS 'geo地图数据json';
COMMENT ON COLUMN dr_map.uploaded_geo_json IS '是否已上传geoJson 0-否 1-是';
COMMENT ON COLUMN dr_map.create_date IS '创建时间';
COMMENT ON COLUMN dr_map.create_user IS '创建人';
COMMENT ON COLUMN dr_map.update_date IS '更新时间';
COMMENT ON COLUMN dr_map.update_user IS '更新人';
COMMENT ON COLUMN dr_map.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_map.del_flag IS '删除标识(0：正常，1：删除)';
CREATE INDEX IF NOT EXISTS idx_map_parent_code ON dr_map(parent_code);

-- ----------------------------
-- 页面表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_page
(
    id          VARCHAR(50)  NOT NULL,
    name        VARCHAR(255) DEFAULT NULL,
    code        VARCHAR(100) DEFAULT NULL,
    page_type   VARCHAR(50)  DEFAULT 'page',
    parent_code VARCHAR(100) DEFAULT 'root',
    remark      VARCHAR(500) DEFAULT NULL,
    thumbnail   VARCHAR(500) DEFAULT NULL,
    page_status VARCHAR(50)  DEFAULT 'design',
    create_date TIMESTAMP    DEFAULT NULL,
    create_user VARCHAR(50)  DEFAULT NULL,
    update_date TIMESTAMP    DEFAULT NULL,
    update_user VARCHAR(50)  DEFAULT NULL,
    tenant_code VARCHAR(50)  DEFAULT NULL,
    del_flag    VARCHAR(1)   DEFAULT '0',
    PRIMARY KEY (id),
    CONSTRAINT uk_page_code UNIQUE (code)
);
COMMENT ON TABLE dr_page IS '页面表';
COMMENT ON COLUMN dr_page.id IS '主键';
COMMENT ON COLUMN dr_page.name IS '页面名称';
COMMENT ON COLUMN dr_page.code IS '页面编码';
COMMENT ON COLUMN dr_page.page_type IS '页面类型';
COMMENT ON COLUMN dr_page.parent_code IS '所属目录编码';
COMMENT ON COLUMN dr_page.remark IS '页面描述';
COMMENT ON COLUMN dr_page.thumbnail IS '封面地址';
COMMENT ON COLUMN dr_page.page_status IS '页面状态';
COMMENT ON COLUMN dr_page.create_date IS '创建时间';
COMMENT ON COLUMN dr_page.create_user IS '创建人';
COMMENT ON COLUMN dr_page.update_date IS '更新时间';
COMMENT ON COLUMN dr_page.update_user IS '更新人';
COMMENT ON COLUMN dr_page.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_page.del_flag IS '删除标识(0：正常，1：删除)';
CREATE INDEX IF NOT EXISTS idx_page_type ON dr_page(page_type);
CREATE INDEX IF NOT EXISTS idx_page_parent_code ON dr_page(parent_code);

-- ----------------------------
-- 页面分享表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_page_share
(
    id           VARCHAR(50)  NOT NULL,
    page_code    VARCHAR(100) DEFAULT NULL,
    page_type    VARCHAR(50)  DEFAULT 'page',
    token        VARCHAR(200) DEFAULT NULL,
    enabled      BOOLEAN      DEFAULT TRUE,
    expire_time  TIMESTAMP    DEFAULT NULL,
    ip_whitelist TEXT         DEFAULT NULL,
    create_date  TIMESTAMP    DEFAULT NULL,
    create_user  VARCHAR(50)  DEFAULT NULL,
    update_date  TIMESTAMP    DEFAULT NULL,
    update_user  VARCHAR(50)  DEFAULT NULL,
    tenant_code  VARCHAR(50)  DEFAULT NULL,
    del_flag     VARCHAR(1)   DEFAULT '0',
    PRIMARY KEY (id),
    CONSTRAINT uk_page_share_page_code UNIQUE (page_code)
);
COMMENT ON TABLE dr_page_share IS '页面分享表';
COMMENT ON COLUMN dr_page_share.id IS '主键';
COMMENT ON COLUMN dr_page_share.page_code IS '页面编码';
COMMENT ON COLUMN dr_page_share.page_type IS '页面类型';
COMMENT ON COLUMN dr_page_share.token IS '分享token';
COMMENT ON COLUMN dr_page_share.enabled IS '是否启用';
COMMENT ON COLUMN dr_page_share.expire_time IS '过期时间';
COMMENT ON COLUMN dr_page_share.ip_whitelist IS 'IP白名单';
COMMENT ON COLUMN dr_page_share.create_date IS '创建时间';
COMMENT ON COLUMN dr_page_share.create_user IS '创建人';
COMMENT ON COLUMN dr_page_share.update_date IS '更新时间';
COMMENT ON COLUMN dr_page_share.update_user IS '更新人';
COMMENT ON COLUMN dr_page_share.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_page_share.del_flag IS '删除标识(0：正常，1：删除)';
CREATE INDEX IF NOT EXISTS idx_page_share_token ON dr_page_share(token);

-- ----------------------------
-- 中转态页面表（历史记录、快照）
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_page_stage
(
    id          VARCHAR(50)  NOT NULL,
    page_code   VARCHAR(100) DEFAULT NULL,
    remark      VARCHAR(500) DEFAULT NULL,
    page_status VARCHAR(50)  DEFAULT 'design',
    page_type   VARCHAR(50)  DEFAULT NULL,
    page_config TEXT         DEFAULT NULL,
    create_date TIMESTAMP    DEFAULT NULL,
    create_user VARCHAR(50)  DEFAULT NULL,
    update_date TIMESTAMP    DEFAULT NULL,
    update_user VARCHAR(50)  DEFAULT NULL,
    tenant_code VARCHAR(50)  DEFAULT NULL,
    del_flag    VARCHAR(1)   DEFAULT '0',
    PRIMARY KEY (id)
);
COMMENT ON TABLE dr_page_stage IS '中转态页面表';
COMMENT ON COLUMN dr_page_stage.id IS '主键';
COMMENT ON COLUMN dr_page_stage.page_code IS '页面编码';
COMMENT ON COLUMN dr_page_stage.remark IS '说明';
COMMENT ON COLUMN dr_page_stage.page_status IS '页面状态';
COMMENT ON COLUMN dr_page_stage.page_type IS '页面类型';
COMMENT ON COLUMN dr_page_stage.page_config IS '页面配置';
COMMENT ON COLUMN dr_page_stage.create_date IS '创建时间';
COMMENT ON COLUMN dr_page_stage.create_user IS '创建人';
COMMENT ON COLUMN dr_page_stage.update_date IS '更新时间';
COMMENT ON COLUMN dr_page_stage.update_user IS '更新人';
COMMENT ON COLUMN dr_page_stage.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_page_stage.del_flag IS '删除标识(0：正常，1：删除)';
CREATE INDEX IF NOT EXISTS idx_page_stage_code ON dr_page_stage(page_code);
CREATE INDEX IF NOT EXISTS idx_page_stage_status ON dr_page_stage(page_status);

-- ----------------------------
-- 资源表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_resource
(
    id            VARCHAR(50)  NOT NULL,
    name          VARCHAR(255) DEFAULT NULL,
    original_name VARCHAR(255) DEFAULT NULL,
    resource_type VARCHAR(50)  DEFAULT NULL,
    parent_code   VARCHAR(100) DEFAULT NULL,
    path          VARCHAR(500) DEFAULT NULL,
    url           VARCHAR(500) DEFAULT NULL,
    thumbnail     VARCHAR(500) DEFAULT NULL,
    size          INTEGER      DEFAULT NULL,
    remark        VARCHAR(500) DEFAULT NULL,
    config        TEXT         DEFAULT NULL,
    create_date   TIMESTAMP    DEFAULT NULL,
    create_user   VARCHAR(50)  DEFAULT NULL,
    update_date   TIMESTAMP    DEFAULT NULL,
    update_user   VARCHAR(50)  DEFAULT NULL,
    tenant_code   VARCHAR(50)  DEFAULT NULL,
    del_flag      VARCHAR(1)   DEFAULT '0',
    PRIMARY KEY (id)
);
COMMENT ON TABLE dr_resource IS '资源表';
COMMENT ON COLUMN dr_resource.id IS '主键';
COMMENT ON COLUMN dr_resource.name IS '名称';
COMMENT ON COLUMN dr_resource.original_name IS '原始名称';
COMMENT ON COLUMN dr_resource.resource_type IS '资源类型';
COMMENT ON COLUMN dr_resource.parent_code IS '上级目录';
COMMENT ON COLUMN dr_resource.path IS '存储的路径';
COMMENT ON COLUMN dr_resource.url IS '访问地址';
COMMENT ON COLUMN dr_resource.thumbnail IS '缩略图、封面地址';
COMMENT ON COLUMN dr_resource.size IS '文件大小（单位：KB）';
COMMENT ON COLUMN dr_resource.remark IS '描述';
COMMENT ON COLUMN dr_resource.config IS '模型个性化配置（JSON）';
COMMENT ON COLUMN dr_resource.create_date IS '创建时间';
COMMENT ON COLUMN dr_resource.create_user IS '创建人';
COMMENT ON COLUMN dr_resource.update_date IS '更新时间';
COMMENT ON COLUMN dr_resource.update_user IS '更新人';
COMMENT ON COLUMN dr_resource.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_resource.del_flag IS '删除标识(0：正常，1：删除)';
CREATE INDEX IF NOT EXISTS idx_resource_parent_code ON dr_resource(parent_code);

-- ----------------------------
-- 操作日志表
-- ----------------------------
-- 旧版本表不包含 operation_summary，升级时允许一次性重建；新版本表重复初始化时保留数据。
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND table_name = 'dr_operation_log'
          AND column_name = 'operation_summary'
    ) THEN
        DROP TABLE IF EXISTS dr_operation_log;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS dr_operation_log
(
    id                    VARCHAR(50)  NOT NULL,
    trace_id              VARCHAR(128) DEFAULT NULL,
    operator_id           VARCHAR(64)  DEFAULT NULL,
    operator_name         VARCHAR(128) DEFAULT NULL,
    operator_role         VARCHAR(255) DEFAULT NULL,
    operation_summary     VARCHAR(512) DEFAULT NULL,
    operation_description VARCHAR(512) DEFAULT NULL,
    business_module       VARCHAR(255) DEFAULT NULL,
    request_uri           VARCHAR(512) DEFAULT NULL,
    request_method        VARCHAR(16)  DEFAULT NULL,
    client_ip             VARCHAR(64)  DEFAULT NULL,
    user_agent            VARCHAR(512) DEFAULT NULL,
    content_type          VARCHAR(128) DEFAULT NULL,
    query_params          TEXT         DEFAULT NULL,
    request_body          TEXT         DEFAULT NULL,
    result_status         VARCHAR(32)  DEFAULT NULL,
    response_code         INTEGER      DEFAULT NULL,
    response_message      VARCHAR(512) DEFAULT NULL,
    exception_type        VARCHAR(255) DEFAULT NULL,
    exception_stack       TEXT         DEFAULT NULL,
    request_time          TIMESTAMP    DEFAULT NULL,
    duration_ms           BIGINT       DEFAULT NULL,
    create_date           TIMESTAMP    DEFAULT NULL,
    create_user           VARCHAR(50)  DEFAULT NULL,
    update_date           TIMESTAMP    DEFAULT NULL,
    update_user           VARCHAR(50)  DEFAULT NULL,
    tenant_code           VARCHAR(50)  DEFAULT NULL,
    del_flag              VARCHAR(1)   DEFAULT '0',
    PRIMARY KEY (id)
);
COMMENT ON TABLE dr_operation_log IS '操作日志表';
COMMENT ON COLUMN dr_operation_log.id IS '主键';
COMMENT ON COLUMN dr_operation_log.trace_id IS '链路标识';
COMMENT ON COLUMN dr_operation_log.operator_id IS '操作者ID';
COMMENT ON COLUMN dr_operation_log.operator_name IS '操作者名称';
COMMENT ON COLUMN dr_operation_log.operator_role IS '操作者角色';
COMMENT ON COLUMN dr_operation_log.operation_summary IS '操作说明';
COMMENT ON COLUMN dr_operation_log.operation_description IS '操作描述';
COMMENT ON COLUMN dr_operation_log.business_module IS '业务模块';
COMMENT ON COLUMN dr_operation_log.request_uri IS '请求地址';
COMMENT ON COLUMN dr_operation_log.request_method IS '请求方法';
COMMENT ON COLUMN dr_operation_log.client_ip IS '客户端IP';
COMMENT ON COLUMN dr_operation_log.user_agent IS 'User-Agent';
COMMENT ON COLUMN dr_operation_log.content_type IS '内容类型';
COMMENT ON COLUMN dr_operation_log.query_params IS '查询参数';
COMMENT ON COLUMN dr_operation_log.request_body IS '请求体';
COMMENT ON COLUMN dr_operation_log.result_status IS '执行结果';
COMMENT ON COLUMN dr_operation_log.response_code IS '响应码';
COMMENT ON COLUMN dr_operation_log.response_message IS '响应消息';
COMMENT ON COLUMN dr_operation_log.exception_type IS '异常类型';
COMMENT ON COLUMN dr_operation_log.exception_stack IS '异常堆栈';
COMMENT ON COLUMN dr_operation_log.request_time IS '请求时间';
COMMENT ON COLUMN dr_operation_log.duration_ms IS '总耗时';
COMMENT ON COLUMN dr_operation_log.create_date IS '创建时间';
COMMENT ON COLUMN dr_operation_log.create_user IS '创建人';
COMMENT ON COLUMN dr_operation_log.update_date IS '更新时间';
COMMENT ON COLUMN dr_operation_log.update_user IS '更新人';
COMMENT ON COLUMN dr_operation_log.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_operation_log.del_flag IS '删除标识(0：正常，1：删除)';
CREATE INDEX IF NOT EXISTS idx_operation_log_request_time ON dr_operation_log(request_time);
CREATE INDEX IF NOT EXISTS idx_operation_log_business_module ON dr_operation_log(business_module);

-- ----------------------------
-- 用户表
-- ----------------------------
CREATE TABLE IF NOT EXISTS dr_user
(
    id                 VARCHAR(50)  NOT NULL,
    account            VARCHAR(100) NOT NULL,
    username           VARCHAR(100) NOT NULL,
    password           VARCHAR(500) NOT NULL,
    phone              VARCHAR(20)  DEFAULT NULL,
    role               VARCHAR(200) DEFAULT NULL,
    status             VARCHAR(20)  DEFAULT 'NORMAL',
    login_fail_count   INTEGER      DEFAULT 0,
    login_locked_until TIMESTAMP    DEFAULT NULL,
    expire_date        TIMESTAMP    DEFAULT NULL,
    create_date        TIMESTAMP    DEFAULT NULL,
    create_user        VARCHAR(50)  DEFAULT NULL,
    update_date        TIMESTAMP    DEFAULT NULL,
    update_user        VARCHAR(50)  DEFAULT NULL,
    tenant_code        VARCHAR(50)  DEFAULT NULL,
    del_flag           VARCHAR(1)   DEFAULT '0',
    PRIMARY KEY (id),
    CONSTRAINT uk_user_account UNIQUE (account)
);
COMMENT ON TABLE dr_user IS '用户表';
COMMENT ON COLUMN dr_user.id IS '主键';
COMMENT ON COLUMN dr_user.account IS '账号';
COMMENT ON COLUMN dr_user.username IS '用户名';
COMMENT ON COLUMN dr_user.password IS '密码';
COMMENT ON COLUMN dr_user.phone IS '联系电话';
COMMENT ON COLUMN dr_user.role IS '角色编码，多个用逗号分隔';
COMMENT ON COLUMN dr_user.status IS '状态：NORMAL-正常 LOCKED-锁定 DISABLED-禁用 PASSWORD_EXPIRED-密码过期';
COMMENT ON COLUMN dr_user.login_fail_count IS '连续登录密码错误次数';
COMMENT ON COLUMN dr_user.login_locked_until IS '登录锁定截止时间';
COMMENT ON COLUMN dr_user.expire_date IS '有效期截止时间，NULL表示永久有效';
COMMENT ON COLUMN dr_user.create_date IS '创建时间';
COMMENT ON COLUMN dr_user.create_user IS '创建人';
COMMENT ON COLUMN dr_user.update_date IS '更新时间';
COMMENT ON COLUMN dr_user.update_user IS '更新人';
COMMENT ON COLUMN dr_user.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_user.del_flag IS '删除标识(0：正常，1：删除)';

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

-- Agent对话任务增量升级脚本，适用于PostgreSQL，可重复执行。
-- 执行前必须先备份 dr_agent_task 的结构和全部数据；本升级会永久删除 page_code/page_name/page_type 三列页面摘要。
-- 保留任务行、其他字段及 transcript 对话记录原文；不从 transcript 回填摘要，不删表、不清空数据。
-- 失败或需要回滚时停止写入，并从备份恢复结构和数据；不要假定脚本执行器已将所有 DDL 包含在同一事务中。
CREATE TABLE IF NOT EXISTS dr_agent_task (
    id VARCHAR(50) NOT NULL,
    thread_id VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    transcript TEXT DEFAULT NULL,
    create_date TIMESTAMP DEFAULT NULL,
    create_user VARCHAR(50) DEFAULT NULL,
    update_date TIMESTAMP DEFAULT NULL,
    update_user VARCHAR(50) DEFAULT NULL,
    tenant_code VARCHAR(50) DEFAULT NULL,
    del_flag VARCHAR(1) DEFAULT '0',
    PRIMARY KEY (id),
    CONSTRAINT uk_agent_task_thread UNIQUE (thread_id)
);
CREATE INDEX IF NOT EXISTS idx_agent_task_user ON dr_agent_task(create_user, del_flag);

COMMENT ON TABLE dr_agent_task IS 'Agent对话任务表';
COMMENT ON COLUMN dr_agent_task.id IS '主键';
COMMENT ON COLUMN dr_agent_task.thread_id IS 'AG-UI线程ID';
COMMENT ON COLUMN dr_agent_task.title IS '任务标题';
COMMENT ON COLUMN dr_agent_task.transcript IS '对话记录JSON';
COMMENT ON COLUMN dr_agent_task.create_date IS '创建时间';
COMMENT ON COLUMN dr_agent_task.create_user IS '创建人';
COMMENT ON COLUMN dr_agent_task.update_date IS '更新时间';
COMMENT ON COLUMN dr_agent_task.update_user IS '更新人';
COMMENT ON COLUMN dr_agent_task.tenant_code IS '租户编码';
COMMENT ON COLUMN dr_agent_task.del_flag IS '删除标识(0：正常，1：删除)';

-- 旧库升级：逐列幂等删除，支持部分列已缺失及重复执行。
ALTER TABLE dr_agent_task DROP COLUMN IF EXISTS page_code;
ALTER TABLE dr_agent_task DROP COLUMN IF EXISTS page_name;
ALTER TABLE dr_agent_task DROP COLUMN IF EXISTS page_type;
