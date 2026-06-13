---
description: "刷新编码代理上下文文件中由 Spec Kit 管理的区块"
---

# 更新编码代理上下文

刷新当前集成所使用的编码代理上下文/指令文件中的 Spec Kit 托管区块（例如 `CLAUDE.md`、`.github/copilot-instructions.md`、`AGENTS.md`）。

## 行为

脚本会读取 `.specify/extensions/agent-context/agent-context-config.yml` 中的
agent-context 扩展配置，以确定：

- `context_file`：需要管理的编码代理上下文文件路径。
- `context_markers.start` / `.end`：托管区块的开始/结束标记。若配置缺失，则默认使用
  `<!-- SPECKIT START -->` 和 `<!-- SPECKIT END -->`。

随后脚本会创建、替换或追加该托管区块，使其在能够发现最新计划文件路径时，指向对应的计划
文件（`specs/<feature>/plan.md`）。

如果 `context_file` 为空，或无法定位该文件，则命令会报告“无事可做”并成功退出。

## 执行方式

- **Bash**: `.specify/extensions/agent-context/scripts/bash/update-agent-context.sh [plan_path]`
- **PowerShell**: `.specify/extensions/agent-context/scripts/powershell/update-agent-context.ps1 [plan_path]`

当未提供 `plan_path` 时，脚本会自动检测最近修改的 `specs/*/plan.md`。
