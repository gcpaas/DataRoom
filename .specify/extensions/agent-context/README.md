# 编码代理上下文扩展

这个内置扩展负责为当前激活的集成管理**编码代理上下文/指令文件**（例如 `CLAUDE.md`、`.github/copilot-instructions.md`、`AGENTS.md`、`GEMINI.md` 等）。

它负责维护由可配置起止标记包围的托管区块生命周期（默认标记：
`<!-- SPECKIT START -->` / `<!-- SPECKIT END -->`）。

## 为什么拆成扩展？

并不是每个 Spec Kit 用户都希望 Spec Kit 直接写入编码代理上下文文件。将这部分行为拆成独
立扩展后，用户可以：

- **完全退出**：通过 `specify extension disable agent-context` 禁用扩展，此后 Spec Kit
  将不再创建或修改代理上下文文件。
- **自定义标记**：编辑 `.specify/extensions/agent-context/agent-context-config.yml`
  即可修改标记；Python 层和内置脚本都会使用同一份 `context_markers` 配置。
- **按需刷新**：通过 `/speckit.agent-context.update` 主动刷新，或通过 `extension.yml`
  中声明的 hooks（`after_specify`、`after_plan`）自动刷新。

## 命令

| 命令 | 说明 |
|------|------|
| `speckit.agent-context.update` | 使用当前计划路径刷新代理上下文文件中的托管区块。 |

## 配置

所有配置均通过扩展自身的配置文件完成：
`.specify/extensions/agent-context/agent-context-config.yml`

```yaml
# 本扩展要管理的编码代理上下文文件路径
context_file: CLAUDE.md

# Spec Kit 托管区块的起止标记
context_markers:
  start: "<!-- SPECKIT START -->"
  end: "<!-- SPECKIT END -->"
```

- `context_file`：项目内相对路径，指向编码代理上下文文件；通常由 `specify init` 和
  `specify integration install` 写入。
- `context_markers.start` / `.end`：托管区块的起止标记；如需自定义标记，可直接编辑。

## 运行要求

内置更新脚本依赖 **Python 3** 和 **PyYAML** 来处理 YAML 读取与内容 upsert（在支持时，
PowerShell 也可使用 `ConvertFrom-Yaml`）。

通常 `specify` CLI 自带 PyYAML，并会通过同一个 `python3` 解释器使用它。若 hook 报错：
*"PyYAML is required … not available in the current Python environment"*，说明系统
`python3` 与安装 Spec Kit 时所用解释器不同。可通过以下命令修复：

```bash
pip install pyyaml
# 或安装到 Spec Kit 实际使用的解释器：
/path/to/speckit-python -m pip install pyyaml
```

## 禁用

```bash
specify extension disable agent-context
```

禁用后，Spec Kit 会跳过上下文文件的创建、更新和删除（相关门禁位于
`upsert_context_section()` 和 `remove_context_section()` 内）。
