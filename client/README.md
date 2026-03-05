# SSE Stream Client (前端)

基于 Vue 3 + Vite 的 SSE 聊天室客户端。

## 功能特性

- ✅ 实时 SSE 连接
- ✅ 消息广播和接收
- ✅ 在线人数统计
- ✅ 自动重连机制
- ✅ 美观的聊天界面
- ✅ 响应式设计

## 技术栈

- **Vue 3** - 渐进式 JavaScript 框架
- **Vite** - 下一代前端构建工具
- **EventSource API** - 原生 SSE 支持

## 快速开始

### 1. 安装依赖

在项目根目录或 client 目录：

```bash
npm install
```

### 2. 启动开发服务器

**方式一：仅启动前端**

```bash
npm run dev:client
```

前端将运行在 `http://localhost:5173`

**方式二：同时启动前后端**

```bash
npm run dev:all
```

这将同时启动：
- 后端服务器: `http://localhost:5000`
- 前端客户端: `http://localhost:5173`

### 3. 访问应用

打开浏览器访问 `http://localhost:5173`

## 项目结构

```
client/
├── src/
│   ├── App.vue              # 主聊天组件
│   ├── main.js              # 应用入口
│   ├── style.css            # 全局样式
│   └── services/
│       └── sseService.js    # SSE 服务封装
├── index.html               # HTML 模板
├── vite.config.js           # Vite 配置
└── package.json             # 项目配置
```

## 核心功能

### SSE 服务封装

`sseService.js` 提供了完整的 SSE 功能封装：

- `connect()` - 连接到 SSE 服务器
- `disconnect()` - 断开连接
- `broadcast(message)` - 广播消息
- `sendToClient(clientId, message)` - 发送定向消息
- `getClients()` - 获取在线客户端列表
- 自动重连机制
- 心跳检测

### 聊天界面

`App.vue` 实现了完整的聊天界面：

- 实时消息显示
- 连接状态指示
- 在线人数统计
- 消息类型分类（系统、广播、私信、错误）
- 自动滚动到最新消息
- 支持 Enter 键发送

## 域名配置

### 环境变量

项目使用环境变量管理 API 地址，支持不同环境的灵活配置。

**`.env.development` (开发环境)**
```env
VITE_API_BASE_URL=http://localhost:5000
```

**`.env.production` (生产环境)**
```env
# 留空则使用相对路径（前后端同域名部署）
VITE_API_BASE_URL=
```

**`.env.local` (本地自定义配置，不提交 Git)**
```env
# 例如：连接到局域网其他设备
VITE_API_BASE_URL=http://192.168.1.100:3000
```

### API 配置模块

`src/config/api.js` 提供了统一的 API 配置：

```javascript
import { getApiUrl, API_ENDPOINTS } from './config/api.js';

// 自动根据环境使用正确的 URL
const url = getApiUrl(API_ENDPOINTS.SSE_STREAM);
```

**工作原理**：
- 开发环境：使用 Vite 代理，无需完整 URL
- 生产环境：根据配置拼接完整 URL 或使用相对路径

### Vite 代理配置

开发服务器已配置代理，自动将 `/api` 请求转发到后端：

```javascript
// vite.config.js
proxy: {
    '/api': {
        target: env.VITE_API_BASE_URL || 'http://localhost:5000',
        changeOrigin: true,
        ws: true, // 支持 WebSocket
    },
}
```

这样前端可以直接访问 `/api/sse/stream` 而无需跨域配置。

## 使用示例

### 连接到服务器

```javascript
import sseService from './services/sseService';

sseService.connect(
    // 接收消息回调
    (data) => {
        console.log('收到消息:', data);
    },
    // 错误回调
    (error) => {
        console.error('连接错误:', error);
    },
    // 连接成功回调
    (data) => {
        console.log('连接成功, 客户端ID:', data.clientId);
    }
);
```

### 发送广播消息

```javascript
await sseService.broadcast('Hello, everyone!');
```

### 发送定向消息

```javascript
await sseService.sendToClient('client-123', 'Private message');
```

### 获取在线客户端

```javascript
const { clients, count } = await sseService.getClients();
console.log(`在线人数: ${count}`);
```

### 断开连接

```javascript
sseService.disconnect();
```

## 消息类型

客户端接收的消息类型：

| 类型 | 说明 | 示例 |
|------|------|------|
| `connected` | 连接成功 | `{ type: 'connected', clientId: 'xxx', message: '连接成功' }` |
| `broadcast` | 广播消息 | `{ type: 'broadcast', message: 'Hello', timestamp: '...' }` |
| `direct` | 定向消息 | `{ type: 'direct', message: 'Hi', timestamp: '...' }` |

## 构建生产版本

```bash
# 构建前端
npm run build:client

# 预览构建结果
npm run preview:client
```

构建产物将生成在 `client/dist/` 目录。

## 部署

### 静态托管

构建后的 `dist` 目录可以部署到任何静态托管服务：

- Vercel
- Netlify
- GitHub Pages
- Nginx

### Nginx 配置示例

```nginx
server {
    listen 80;
    server_name example.com;

    # 前端静态文件
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }

    # 代理后端 API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 开发技巧

### 调试 SSE 连接

在浏览器开发者工具中：

1. 打开 **Network** 标签
2. 筛选 **EventStream** 类型
3. 查看 SSE 消息流

### 热重载

修改代码后，Vite 会自动刷新页面，但 SSE 连接会重新建立。

### 多标签页测试

打开多个浏览器标签，可以测试多客户端聊天功能。

## 自定义配置

### 修改后端地址

**方式一：使用环境变量（推荐）**

创建 `.env.local` 文件：

```env
VITE_API_BASE_URL=http://your-backend-url:3000
```

**方式二：直接修改环境文件**

编辑 `.env.development` 或 `.env.production`：

```env
VITE_API_BASE_URL=http://your-backend-url:3000
```

### 修改端口

编辑 `vite.config.js`：

```javascript
server: {
    port: 8080, // 修改为你想要的端口
}
```

### 局域网访问

默认已启用 `host: true`，可通过局域网 IP 访问：

```bash
npm run dev
# 访问 http://192.168.x.x:5173
```

## 常见问题

### SSE 连接失败

1. 确保后端服务器正在运行
2. 检查代理配置是否正确
3. 查看浏览器控制台错误信息

### 消息接收延迟

- SSE 是单向通信，服务器推送有轻微延迟是正常的
- 检查网络连接质量

### 断开后无法重连

- 服务已内置自动重连机制（最多5次）
- 如果多次失败，刷新页面重新连接

## 扩展功能

可以基于现有代码添加：

- 用户昵称设置
- 消息历史记录
- 文件分享
- 表情符号
- 私聊功能
- 用户列表
- 消息通知

## License

MIT
