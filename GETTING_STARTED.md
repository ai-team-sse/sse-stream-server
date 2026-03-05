# 快速开始指南

本指南帮助你快速启动和运行 SSE Stream Server 项目。

## 前置要求

- Node.js >= 14.x
- npm >= 6.x

## 安装

### 1. 克隆项目

```bash
git clone <repository-url>
cd sse-stream-server
```

### 2. 安装依赖

在根目录执行：

```bash
npm install
```

这将自动安装所有子包（server、client）的依赖。

### 3. 配置环境变量

```bash
cp server/.env.example server/.env
```

编辑 `server/.env` 文件，根据需要修改配置：

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

## 运行项目

### 开发模式

#### 方式一：同时运行前后端（推荐）

在根目录执行：

```bash
npm run dev:all
```

这将同时启动：
- 后端服务器: `http://localhost:5000`
- 前端客户端: `http://localhost:5173`

#### 方式二：单独运行后端

```bash
npm run dev
```

服务器将在 `http://localhost:5000` 启动，支持热重载。

#### 方式三：单独运行前端

```bash
npm run dev:client
```

前端将在 `http://localhost:5173` 启动。

### 生产模式

```bash
# 构建项目
npm run build

# 启动服务
npm start
```

## 验证安装

### 方式一：使用前端界面（推荐）

1. 运行 `npm run dev:all` 启动前后端
2. 打开浏览器访问 `http://localhost:5173`
3. 看到"已连接"状态后，在输入框输入消息
4. 打开多个浏览器标签测试多人聊天

### 方式二：使用 curl 测试

#### 1. 健康检查

```bash
curl http://localhost:5000/health
```

预期输出：
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

#### 2. 测试 SSE 连接

在一个终端窗口中：

```bash
curl -N http://localhost:5000/api/sse/stream
```

你应该看到初始连接消息：
```
data: {"type":"connected","clientId":"client-xxx","message":"连接成功"}
```

#### 3. 发送广播消息

在另一个终端窗口中：

```bash
curl -X POST http://localhost:5000/api/sse/broadcast \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, World!"}'
```

第一个终端应该收到广播消息。

## 运行测试

```bash
# 运行所有测试
npm test

# 监听模式（开发时推荐）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 打开测试 UI
npm run test:ui
```

## 代码格式化

项目已配置自动格式化，保存文件时会自动格式化。

手动格式化命令：

```bash
# 格式化所有代码
npm run format

# 检查格式
npm run format:check

# 自动修复 lint 问题
npm run lint:fix
```

## 常用命令速查

| 命令 | 说明 |
|------|------|
| `npm run dev` | 开发模式运行 |
| `npm run build` | 构建项目 |
| `npm start` | 生产模式运行 |
| `npm test` | 运行测试 |
| `npm run format` | 格式化代码 |
| `npm run lint` | 代码检查 |

## 开发工具推荐

### VSCode 扩展

项目会自动推荐以下扩展：

- **Prettier** - 代码格式化
- **ESLint** - 代码检查
- **EditorConfig** - 编辑器配置
- **Vitest** - 测试工具

首次打开项目时，VSCode 会提示安装这些扩展。

### 编辑器配置

项目已配置保存时自动格式化，无需手动操作。

## 目录说明

| 目录/文件 | 说明 |
|----------|------|
| `server/` | 后端服务器代码 |
| `server/src/` | 源代码 |
| `server/dist/` | 编译输出（自动生成） |
| `client/` | 前端项目（预留） |
| `.vscode/` | VSCode 配置 |
| `package.json` | 根配置（Monorepo） |
| `server/package.json` | Server 包配置 |

## 常见问题

### 端口被占用

如果 3000 端口被占用，修改 `server/.env` 文件中的 `PORT` 配置：

```env
PORT=3001
```

### 依赖安装失败

尝试清理缓存后重新安装：

```bash
rm -rf node_modules server/node_modules
npm cache clean --force
npm install
```

### 测试失败

确保所有依赖已正确安装：

```bash
npm install
npm test
```

### 格式化不生效

1. 确保安装了 Prettier 扩展
2. 检查 VSCode 设置中的 `editor.formatOnSave` 是否为 `true`
3. 手动运行 `npm run format` 格式化所有文件

## 下一步

- 阅读 [README.md](./README.md) 了解项目详情
- 阅读 [API 文档](./README.md#api-文档) 了解接口使用
- 阅读 [代码风格指南](./server/CODE_STYLE.md) 了解编码规范
- 阅读 [测试文档](./server/TEST.md) 了解测试编写

## 获取帮助

- 查看 [项目文档](./README.md)
- 提交 [Issue](https://github.com/your-repo/issues)
- 联系项目维护者

祝你使用愉快！ 🎉
