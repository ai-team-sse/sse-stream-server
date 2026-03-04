# SSE Stream Server (后端)

基于 Node.js + Express + TypeScript 的 Server-Sent Events (SSE) 流服务器。

## 功能特性

- ✅ SSE 实时消息推送
- ✅ 客户端连接管理
- ✅ 消息广播功能
- ✅ 定向消息发送
- ✅ 心跳保活机制
- ✅ TypeScript 类型支持
- ✅ CORS 跨域支持

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

服务器将在 http://localhost:3000 启动

### 构建生产版本

```bash
npm run build
npm start
```

## API 端点

### 1. SSE 流连接

```
GET /api/sse/stream
```

客户端通过此端点建立 SSE 连接，接收服务器推送的实时消息。

### 2. 广播消息

```
POST /api/sse/broadcast
Content-Type: application/json

{
  "message": "要广播的消息"
}
```

向所有连接的客户端广播消息。

### 3. 发送消息给特定客户端

```
POST /api/sse/send/:clientId
Content-Type: application/json

{
  "message": "要发送的消息"
}
```

### 4. 获取客户端列表

```
GET /api/sse/clients
```

返回当前所有连接的客户端列表。

### 5. 健康检查

```
GET /health
```

## 项目结构

```
server/
├── src/
│   ├── index.ts              # 应用入口
│   ├── config.ts             # 配置文件
│   ├── routes/
│   │   └── sse.ts            # SSE 路由
│   └── services/
│       └── SSEService.ts     # SSE 服务核心逻辑
├── package.json
├── tsconfig.json
└── .eslintrc.json
```

## 测试 SSE 连接

使用 curl 测试：

```bash
# 连接 SSE 流
curl -N http://localhost:3000/api/sse/stream

# 发送广播消息
curl -X POST http://localhost:3000/api/sse/broadcast \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, World!"}'
```

## 环境变量

复制 `.env.example` 到 `.env` 并根据需要修改：

```bash
cp .env.example .env
```

## 开发命令

- `npm run dev` - 开发模式（热重载）
- `npm run build` - 构建 TypeScript
- `npm start` - 运行生产版本
- `npm run lint` - 代码检查
- `npm test` - 运行测试
