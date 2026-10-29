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
