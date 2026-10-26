-- 个人MCP令牌增量升级脚本，适用于PostgreSQL和H2，可重复执行。
-- MySQL请使用 dataroom_mcp_token.mysql.upgrade.sql，避免TIMESTAMP的2038年限制。
-- 执行前备份数据库；本脚本不会修改既有业务表或导入任何明文令牌。
CREATE TABLE IF NOT EXISTS dr_mcp_token (
    id VARCHAR(64) NOT NULL PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    tenant_code VARCHAR(64),
    name VARCHAR(100) NOT NULL,
    token_hash VARCHAR(64) NOT NULL,
    token_prefix VARCHAR(14) NOT NULL,
    expire_time TIMESTAMP NOT NULL,
    create_date TIMESTAMP NOT NULL,
    del_flag CHAR(1) NOT NULL DEFAULT '0',
    CONSTRAINT uk_mcp_token_hash UNIQUE (token_hash)
);
