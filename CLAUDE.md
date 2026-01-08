# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

ccNexus 是一个 Claude Code & Codex CLI 智能端点轮换代理，基于 Go + Wails v2 构建的跨平台桌面应用。支持多端点自动故障转移、API 格式转换（Claude ↔ OpenAI ↔ Gemini）、实时统计监控和 WebDAV 云同步。

## 开发环境

**必需工具：**
- Go 1.22+
- Node.js 18+
- Wails CLI v2: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

**检查环境：** `wails doctor`

## 常用命令

所有 wails 命令需在 `cmd/desktop/` 目录下执行：

```bash
# 前端依赖安装
cd cmd/desktop/frontend && npm install && cd ..

# 开发模式（支持热重载）
wails dev

# 构建当前平台
wails build

# 跨平台构建
wails build -platform windows/amd64
wails build -platform darwin/amd64
wails build -platform darwin/arm64
wails build -platform linux/amd64
```

构建产物位于 `cmd/desktop/build/bin/` 目录。

## 代码架构

### 双入口设计

```
cmd/
├── desktop/           # 桌面 GUI 应用 (Wails)
│   ├── main.go       # 应用入口
│   ├── app.go        # App struct, 生命周期, Go-JS 绑定方法
│   └── frontend/     # 前端源码 (Vanilla JS + Vite)
└── server/           # 纯后端 HTTP 服务 (可 Docker 部署)
    ├── main.go       # 服务器入口
    └── webui/api/    # REST API handlers
```

### 核心模块 (internal/)

| 模块 | 职责 |
|------|------|
| `proxy/` | HTTP 代理核心：请求处理、流式响应、统计收集 |
| `transformer/` | API 格式转换器，见下方详细说明 |
| `service/` | 业务服务层：端点管理、设置、统计、备份、WebDAV |
| `storage/` | SQLite 数据存储层，接口定义在 interface.go |
| `session/` | 会话管理：Claude Code 和 Codex CLI 会话处理 |
| `updater/` | 自动更新系统：版本检查、下载、平台特定应用 |
| `webdav/` | WebDAV 客户端：多设备配置同步 |
| `tokencount/` | Token 计数估算器，含图片处理 |
| `tray/` | 系统托盘实现（平台特定：windows/darwin/other） |

### 转换器架构 (internal/transformer/)

```
transformer/
├── transformer.go    # 转换器接口定义
├── registry.go       # 转换器注册中心
├── types.go          # 通用类型定义
├── cc/               # Claude Code 转换器
│   ├── claude.go     # Claude API 原生
│   ├── openai.go     # OpenAI Chat API
│   ├── openai2.go    # OpenAI Response API
│   └── gemini.go     # Gemini API
├── cx/               # Codex CLI 转换器
│   ├── chat/         # Chat API 格式
│   └── responses/    # Responses API 格式
└── convert/          # 格式互转逻辑
    ├── claude_openai.go
    ├── claude_openai2.go
    ├── claude_gemini.go
    └── ...
```

**添加新转换器：** 实现 `transformer.Transformer` 接口，在 `registry.go` 中注册。

### 前端架构 (cmd/desktop/frontend/src/)

```
src/
├── main.js           # 应用主入口
├── modules/          # 功能模块（15+个独立模块）
│   ├── ui.js         # UI 初始化和管理
│   ├── endpoints.js  # 端点管理
│   ├── settings.js   # 设置面板
│   ├── stats.js      # 统计显示
│   └── ...
├── i18n/             # 国际化 (zh-CN, en)
├── themes/           # 11种主题 CSS
├── effects/          # 季节/节日视觉效果
└── utils/            # 工具函数
```

**Go-JS 绑定：** Wails 自动生成的绑定位于 `frontend/wailsjs/go/main/App.js`

## 数据存储

- 数据库路径：`~/.ccNexus/ccnexus.db` (SQLite)
- 配置、端点、统计数据均存储在 SQLite 中
- 备份支持：本地、S3、WebDAV

## 关键设计模式

1. **服务层模式**：`internal/service/` 下每个服务专注单一职责
2. **适配器模式**：`storage/adapter.go` 统一数据访问接口
3. **策略模式**：转换器通过 registry 动态选择
4. **平台适配**：`_windows.go` / `_darwin.go` / `_unix.go` 后缀文件

## API 端口

- 默认代理端口：`3000`
- 前端开发服务器：`34115`（在 wails.json 和 vite.config.js 中配置）
