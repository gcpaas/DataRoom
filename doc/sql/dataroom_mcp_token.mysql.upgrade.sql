-- 个人MCP令牌增量升级脚本，适用于MySQL 8.0+，可重复执行。
-- 执行前备份数据库；不修改既有业务表，不导入明文令牌。
-- DATETIME支持2038年之后的自定义有效期。
CREATE TABLE IF NOT EXISTS dr_mcp_token (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    tenant_code VARCHAR(64),
    name VARCHAR(100) NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    token_prefix VARCHAR(14) NOT NULL,
    expire_time DATETIME NOT NULL,
    create_date DATETIME NOT NULL,
    del_flag CHAR(1) NOT NULL DEFAULT '0',
    CONSTRAINT uk_mcp_token_hash UNIQUE (token_hash),
    INDEX idx_mcp_token_owner (user_id, tenant_code, del_flag)
);
