-- DataRoom Plus 数据库表结构
-- PostgreSQL

CREATE TABLE IF NOT EXISTS dr_operation_log
(
    id                    VARCHAR(50) PRIMARY KEY,
    trace_id              VARCHAR(128),
    operator_id           VARCHAR(64),
    operator_name         VARCHAR(128),
    operator_role         VARCHAR(255),
    target_type           VARCHAR(64),
    target_id             VARCHAR(128),
    target_name           VARCHAR(255),
    action_type           VARCHAR(64),
    action_desc           VARCHAR(255),
    business_type         VARCHAR(128),
    business_name         VARCHAR(255),
    business_desc         VARCHAR(255),
    request_uri           VARCHAR(512),
    request_method        VARCHAR(16),
    client_ip             VARCHAR(64),
    user_agent            VARCHAR(512),
    content_type          VARCHAR(128),
    query_params          TEXT,
    request_body          TEXT,
    request_param_summary TEXT,
    result_status         VARCHAR(32),
    response_code         INTEGER,
    response_message      VARCHAR(512),
    exception_type        VARCHAR(255),
    exception_stack       TEXT,
    request_time          TIMESTAMP,
    duration_ms           BIGINT,
    handler_duration_ms   BIGINT,
    create_date           TIMESTAMP,
    create_user           VARCHAR(50),
    update_date           TIMESTAMP,
    update_user           VARCHAR(50),
    tenant_code           VARCHAR(50),
    del_flag              VARCHAR(1) DEFAULT '0'
);

CREATE INDEX IF NOT EXISTS idx_operation_log_request_time ON dr_operation_log (request_time);
CREATE INDEX IF NOT EXISTS idx_operation_log_target_type ON dr_operation_log (target_type);
