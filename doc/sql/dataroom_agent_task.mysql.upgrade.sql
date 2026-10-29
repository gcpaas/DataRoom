-- Agent对话任务增量升级脚本，适用于MySQL 8.0+，可重复执行。
-- 执行前必须先备份 dr_agent_task 的结构和全部数据；本升级会永久删除 page_code/page_name/page_type 三列页面摘要。
-- 保留任务行、其他字段及 transcript 对话记录原文；不从 transcript 回填摘要，不删表、不清空数据。
-- MySQL DDL 可能隐式提交；失败或需要回滚时停止写入，并从备份恢复结构和数据，不能依赖事务回滚。
CREATE TABLE IF NOT EXISTS dr_agent_task (
    id VARCHAR(50) NOT NULL COMMENT '主键',
    thread_id VARCHAR(100) NOT NULL COMMENT 'AG-UI线程ID',
    title VARCHAR(100) NOT NULL COMMENT '任务标题',
    transcript LONGTEXT DEFAULT NULL COMMENT '对话记录JSON',
    create_date DATETIME DEFAULT NULL COMMENT '创建时间',
    create_user VARCHAR(50) DEFAULT NULL COMMENT '创建人',
    update_date DATETIME DEFAULT NULL COMMENT '更新时间',
    update_user VARCHAR(50) DEFAULT NULL COMMENT '更新人',
    tenant_code VARCHAR(50) DEFAULT NULL COMMENT '租户编码',
    del_flag VARCHAR(1) DEFAULT '0' COMMENT '删除标识(0：正常，1：删除)',
    PRIMARY KEY (id),
    CONSTRAINT uk_agent_task_thread UNIQUE (thread_id),
    INDEX idx_agent_task_user (create_user, del_flag)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='Agent对话任务表';

-- 仅针对当前数据库的固定列白名单生成 DDL，避免拼接外部输入；不存在的列跳过。
SET @dr_agent_task_drop_sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'dr_agent_task'
          AND column_name = 'page_code'
    ),
    'ALTER TABLE `dr_agent_task` DROP COLUMN `page_code`',
    'SELECT 1'
);
PREPARE dr_agent_task_drop_page_code FROM @dr_agent_task_drop_sql;
EXECUTE dr_agent_task_drop_page_code;
DEALLOCATE PREPARE dr_agent_task_drop_page_code;

SET @dr_agent_task_drop_sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'dr_agent_task'
          AND column_name = 'page_name'
    ),
    'ALTER TABLE `dr_agent_task` DROP COLUMN `page_name`',
    'SELECT 1'
);
PREPARE dr_agent_task_drop_page_name FROM @dr_agent_task_drop_sql;
EXECUTE dr_agent_task_drop_page_name;
DEALLOCATE PREPARE dr_agent_task_drop_page_name;

SET @dr_agent_task_drop_sql = IF(
    EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = DATABASE()
          AND table_name = 'dr_agent_task'
          AND column_name = 'page_type'
    ),
    'ALTER TABLE `dr_agent_task` DROP COLUMN `page_type`',
    'SELECT 1'
);
PREPARE dr_agent_task_drop_page_type FROM @dr_agent_task_drop_sql;
EXECUTE dr_agent_task_drop_page_type;
DEALLOCATE PREPARE dr_agent_task_drop_page_type;
