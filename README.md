# SSE Stream Server

一个基于 Node.js + Express + TypeScript 的 Server-Sent Events (SSE) 流服务器项目，采用前后端分离架构。

## 快速导航

- 👉 [快速开始指南](./GETTING_STARTED.md) - 新手入门必读
- 📖 [完整文档](#目录) - 详细技术文档

## 目录

- [功能特性](#功能特性)
- [技术栈](#技术栈)
- [项目结构](#项目结构)
- [快速开始](#快速开始)
- [API 文档](#api-文档)
- [使用示例](#使用示例)
- [测试](#测试)
- [开发指南](#开发指南)
- [License](#license)

## 功能特性

- ✅ **实时通信** - 基于 SSE 的服务器推送技术
- ✅ **连接管理** - 自动管理客户端连接生命周期
- ✅ **消息广播** - 支持向所有客户端广播消息
- ✅ **定向推送** - 支持向指定客户端发送消息
- ✅ **心跳保活** - 30秒心跳机制保持连接稳定
- ✅ **类型安全** - 完整的 TypeScript 类型支持
- ✅ **跨域支持** - 内置 CORS 中间件
- ✅ **前后分离** - 清晰的前后端架构设计

## 技术栈

### 后端
- **运行时**: Node.js
- **框架**: Express
- **语言**: TypeScript
- **中间件**: CORS

### 前端（预留）
- 任意前端框架（React、Vue、Angular）
- 原生 EventSource API

## 项目结构

```
sse-stream-server/
├── server/                      # 后端服务器
│   ├── src/
│   │   ├── index.ts            # 应用入口
│   │   ├── config.ts           # 配置管理
│   │   ├── routes/
│   │   │   └── sse.ts          # SSE 路由定义
│   │   └── services/
│   │       └── SSEService.ts   # SSE 核心服务
│   ├── package.json            # Server 依赖配置
│   ├── tsconfig.json           # TypeScript 配置
│   ├── vitest.config.ts        # 测试配置
│   ├── .prettierrc.json        # 代码格式化配置
│   ├── .eslintrc.json          # 代码检查配置
│   └── .env.example            # 环境变量示例
├── client/                      # 前端项目（预留）
│   └── README.md               # 客户端使用指南
├── .vscode/                     # VSCode 配置
│   ├── settings.json           # 编辑器设置
│   └── extensions.json         # 推荐扩展
├── package.json                # Monorepo 根配置
├── .editorconfig               # 跨编辑器配置
├── .gitignore                  # Git 忽略文件
├── CLAUDE.md                   # 开发者指南
└── README.md                   # 项目文档
```

### 核心模块说明

| 模块 | 文件路径 | 功能描述 |
|------|---------|---------|
| 应用入口 | `server/src/index.ts` | Express 应用初始化、中间件配置 |
| 配置管理 | `server/src/config.ts` | 环境变量和应用配置 |
| SSE 路由 | `server/src/routes/sse.ts` | SSE 相关的路由定义 |
| SSE 服务 | `server/src/services/SSEService.ts` | 客户端管理、消息推送核心逻辑 |

### Monorepo 架构

项目采用 npm workspaces 管理多个子包：

- **根目录**：统一的脚本入口，可直接执行所有命令
- **server**：后端服务器独立包
- **client**：前端项目独立包（预留）

**优势**：
- 统一依赖管理
- 共享开发工具配置
- 简化命令执行（无需 cd 切换目录）
- 便于前后端协同开发

## 快速开始

### 环境要求

- Node.js >= 14.x
- npm >= 6.x

### 安装和运行

#### 方式一：根目录执行（推荐）

在项目根目录可以直接执行所有命令：

```bash
# 安装所有依赖
npm install

# 复制环境变量配置
cp server/.env.example server/.env

# 开发模式运行（支持热重载）
npm run dev

# 构建 TypeScript
npm run build

# 生产模式运行
npm start

# 代码检查
npm run lint

# ESLint 自动修复
npm run lint:fix

# 代码格式化
npm run format

# 检查代码格式
npm run format:check

# 运行测试
npm test

# 监听模式运行测试
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage

# 打开测试 UI 界面
npm run test:ui
```

#### 方式二：进入子目录执行

```bash
# 进入后端目录
cd server

# 安装依赖
npm install

# 其他命令与方式一相同
npm run dev
npm test
npm run format
# ...
```

服务器默认在 `http://localhost:3000` 启动。

#### 2. 前端客户端

前端目录已预留，您可以使用任何前端框架或原生 HTML。

详细的客户端示例代码请参考 [`client/README.md`](./client/README.md)。

## API 文档

### 端点列表

| 方法 | 端点 | 描述 |
|------|------|------|
| GET | `/api/sse/stream` | 建立 SSE 连接，接收服务器推送 |
| POST | `/api/sse/broadcast` | 向所有连接的客户端广播消息 |
| POST | `/api/sse/send/:clientId` | 向指定客户端发送消息 |
| GET | `/api/sse/clients` | 获取当前所有连接的客户端列表 |
| GET | `/health` | 健康检查端点 |

### 详细说明

#### 1. 建立 SSE 连接

```http
GET /api/sse/stream
```

**响应头**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

**响应示例**
```
data: {"type":"connected","clientId":"client-123456","timestamp":1234567890}

: heartbeat

data: {"type":"message","data":{"message":"Hello"}}
```

#### 2. 广播消息

```http
POST /api/sse/broadcast
Content-Type: application/json

{
  "message": "Hello, World!"
}
```

**响应**
```json
{
  "success": true,
  "message": "Message broadcast to all clients"
}
```

#### 3. 发送定向消息

```http
POST /api/sse/send/:clientId
Content-Type: application/json

{
  "message": "Private message"
}
```

#### 4. 获取客户端列表

```http
GET /api/sse/clients
```

**响应**
```json
{
  "clients": [
    {
      "id": "client-123456",
      "connectedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

## 使用示例

### 使用 curl 测试

```bash
# 1. 建立 SSE 连接（终端1）
curl -N http://localhost:3000/api/sse/stream

# 2. 发送广播消息（终端2）
curl -X POST http://localhost:3000/api/sse/broadcast \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, World!"}'

# 3. 查看连接的客户端
curl http://localhost:3000/api/sse/clients

# 4. 发送定向消息
curl -X POST http://localhost:3000/api/sse/send/client-123456 \
  -H "Content-Type: application/json" \
  -d '{"message": "Private message"}'
```

### 使用 JavaScript 客户端

```javascript
// 建立 SSE 连接
const eventSource = new EventSource('http://localhost:3000/api/sse/stream');

// 监听消息
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};

// 监听连接打开
eventSource.onopen = () => {
  console.log('SSE 连接已建立');
};

// 监听错误
eventSource.onerror = (error) => {
  console.error('SSE 连接错误:', error);
  eventSource.close();
};
```

## 测试

项目使用 [Vitest](https://vitest.dev/) 作为测试框架，提供快速、现代化的测试体验。

### 测试命令

```bash
# 运行所有测试
npm test

# 监听模式（推荐开发时使用）
npm run test:watch

# 生成测试覆盖率报告
npm run test:coverage

# 打开可视化测试界面
npm run test:ui
```

### 测试结构

```
server/src/
├── services/
│   ├── SSEService.ts        # 源码
│   └── SSEService.test.ts   # 单元测试
└── routes/
    ├── sse.ts               # 源码
    └── sse.test.ts          # 集成测试
```

### 测试覆盖

- **单元测试**: SSEService 类的所有核心功能
  - 客户端添加/移除
  - 消息发送/广播
  - 心跳机制
  - 错误处理

- **集成测试**: SSE 路由的 HTTP 请求
  - SSE 流连接
  - 广播端点
  - 定向消息端点
  - 客户端列表端点

## 开发指南

### 代码风格

项目使用统一的代码风格配置：

- **缩进**: 4 个空格（TypeScript/JavaScript）
- **格式化工具**: Prettier
- **代码检查**: ESLint
- **保存时自动格式化**: 已配置 VSCode

**格式化命令**：
```bash
# 格式化所有代码
npm run format

# 检查格式
npm run format:check

# 自动修复 lint 问题
npm run lint:fix
```

详见 [代码风格指南](./server/CODE_STYLE.md)

### 项目文档

- [后端开发文档](./server/README.md) - 后端 API 和服务详细说明
- [前端开发文档](./client/README.md) - 客户端集成指南
- [代码风格指南](./server/CODE_STYLE.md) - 代码规范和格式化配置
- [测试文档](./server/TEST.md) - 测试框架和最佳实践
- [Claude Code 指南](./CLAUDE.md) - 面向 AI 辅助开发的项目指南

### 环境配置

在 `server/.env` 文件中配置：

```env
PORT=3000                    # 服务器端口
NODE_ENV=development         # 运行环境
CORS_ORIGIN=*               # CORS 允许的源
```

### 关键技术点

1. **客户端管理**: 每个连接分配唯一 ID，使用 Map 存储连接状态
2. **消息格式**: SSE 标准格式 `data: ${JSON.stringify(data)}\n\n`
3. **心跳机制**: 使用注释格式 `: heartbeat\n\n` 保持连接
4. **连接清理**: 监听 `req.on('close')` 事件自动清理断开的连接

## License

MIT
