# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Node.js + Express + TypeScript 的 Server-Sent Events (SSE) 流服务器项目，采用前后端分离架构。

## 项目结构

```
sse-stream-server/
├── server/              # 后端服务器
│   ├── src/
│   │   ├── index.ts           # 应用入口
│   │   ├── config.ts          # 配置管理
│   │   ├── routes/
│   │   │   └── sse.ts         # SSE 路由定义
│   │   └── services/
│   │       └── SSEService.ts  # SSE 核心服务逻辑
│   ├── package.json
│   └── tsconfig.json
└── client/              # 前端项目（预留）
    └── src/
```

## 后端开发

### 安装和运行

```bash
cd server
npm install          # 安装依赖
npm run dev         # 开发模式运行（热重载）
npm run build       # 构建 TypeScript
npm start           # 运行生产版本
npm run lint        # 代码检查
```

### 核心架构

**SSEService 类** (`server/src/services/SSEService.ts`)
- 管理所有 SSE 客户端连接
- 提供消息广播和定向发送功能
- 实现心跳保活机制（每30秒）
- 使用 Map 存储客户端连接状态

**路由层** (`server/src/routes/sse.ts`)
- `GET /api/sse/stream` - SSE 流连接端点
- `POST /api/sse/broadcast` - 广播消息给所有客户端
- `POST /api/sse/send/:clientId` - 发送消息给特定客户端
- `GET /api/sse/clients` - 获取当前连接的客户端列表

**SSE 响应头配置**
```typescript
res.setHeader('Content-Type', 'text/event-stream');
res.setHeader('Cache-Control', 'no-cache');
res.setHeader('Connection', 'keep-alive');
res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲
```

### 关键技术点

1. **客户端管理**: 每个连接的客户端分配唯一 ID，存储在 Map 中
2. **消息格式**: 使用 `data: ${JSON.stringify(data)}\n\n` 格式发送
3. **心跳机制**: 使用注释格式 `: heartbeat\n\n` 保持连接
4. **连接清理**: 监听 `req.on('close')` 事件清理断开的客户端

## 前端开发

前端目录 (`client/`) 预留，可以使用任何框架：
- React / Vue / Angular
- 原生 HTML/JavaScript

参考 `client/README.md` 中的 SSE 客户端示例代码。

## 环境配置

复制 `server/.env.example` 到 `server/.env`:
- `PORT` - 服务器端口（默认 5000）
- `NODE_ENV` - 运行环境
- `CORS_ORIGIN` - CORS 允许的源

## 测试 SSE 功能

```bash
# 连接 SSE 流
curl -N http://localhost:5000/api/sse/stream

# 发送广播消息（需要新开终端）
curl -X POST http://localhost:5000/api/sse/broadcast \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, World!"}'
```
