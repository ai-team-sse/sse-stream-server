# 配置指南

本文档详细说明项目的各种配置选项。

## 环境变量配置

### 后端配置 (server/.env)

```env
# 服务器端口
PORT=3000

# 运行环境 (development | production)
NODE_ENV=production

# CORS 允许的源
# 开发环境: * 或 http://localhost:5173
# 生产环境: https://your-domain.com
CORS_ORIGIN=*
```

### 前端配置

#### 开发环境 (client/.env.development)

```env
# 后端 API 地址
VITE_API_BASE_URL=http://localhost:5000
```

**使用场景**：
- 本地开发
- 通过 Vite 代理访问后端

#### 生产环境 (client/.env.production)

```env
# 留空使用相对路径（前后端同域名）
VITE_API_BASE_URL=

# 或指定完整后端地址（前后端分离）
# VITE_API_BASE_URL=https://api.your-domain.com
```

**使用场景**：
- 前后端同域名部署：留空
- 前后端分离部署：填写完整后端 URL

#### 本地自定义 (client/.env.local)

```env
# 连接到局域网其他设备
VITE_API_BASE_URL=http://192.168.1.100:3000

# 或连接到远程测试服务器
# VITE_API_BASE_URL=https://test.your-domain.com
```

**特点**：
- 不会提交到 Git
- 优先级最高，会覆盖其他配置
- 适合个人开发环境自定义

## 域名配置场景

### 场景 1: 本地开发

**配置**：
```env
# client/.env.development
VITE_API_BASE_URL=http://localhost:5000

# server/.env
PORT=5000
CORS_ORIGIN=http://localhost:5173
```

**访问**：
- 前端: http://localhost:5173
- 后端: http://localhost:5000

### 场景 2: 局域网开发

**配置**：
```env
# client/.env.local
VITE_API_BASE_URL=http://192.168.1.100:5000

# server/.env
PORT=5000
CORS_ORIGIN=http://192.168.1.100:5173
```

**访问**：
- 前端: http://192.168.1.100:5173
- 后端: http://192.168.1.100:5000

### 场景 3: 前后端同域名部署

**架构**：`your-domain.com` → Nginx → 前端静态 + 后端 API

**配置**：
```env
# client/.env.production
VITE_API_BASE_URL=

# server/.env
PORT=5000
CORS_ORIGIN=https://your-domain.com
```

**Nginx 配置**：
```nginx
location / {
    # 前端静态文件
    root /path/to/client/dist;
}

location /api/ {
    # 代理到后端
    proxy_pass http://127.0.0.1:5000;
}
```

**访问**：
- https://your-domain.com → 前端
- https://your-domain.com/api → 后端

**优势**：
- ✅ 无需 CORS
- ✅ 统一域名管理
- ✅ 配置简单

### 场景 4: 前后端分离部署

**架构**：前端 CDN + 独立后端服务器

**配置**：
```env
# client/.env.production
VITE_API_BASE_URL=https://api.your-domain.com

# server/.env
PORT=5000
CORS_ORIGIN=https://app.your-domain.com
```

**访问**：
- 前端: https://app.your-domain.com
- 后端: https://api.your-domain.com

**优势**：
- ✅ 前端可部署到 CDN
- ✅ 前后端独立扩展
- ⚠️ 需要配置 CORS

### 场景 5: 子域名部署

**架构**：主域名 + API 子域名

**配置**：
```env
# client/.env.production
VITE_API_BASE_URL=https://api.your-domain.com

# server/.env
PORT=5000
CORS_ORIGIN=https://your-domain.com
```

**访问**：
- 前端: https://your-domain.com
- 后端: https://api.your-domain.com

## API 配置模块

前端的 `src/config/api.js` 统一管理 API 配置：

```javascript
import { getApiUrl, API_ENDPOINTS } from './config/api.js';

// 使用预定义的端点
const streamUrl = getApiUrl(API_ENDPOINTS.SSE_STREAM);

// 动态拼接路径
const clientUrl = getApiUrl(`${API_ENDPOINTS.SSE_SEND}/${clientId}`);
```

**端点常量**：
```javascript
export const API_ENDPOINTS = {
    SSE_STREAM: '/api/sse/stream',
    SSE_BROADCAST: '/api/sse/broadcast',
    SSE_SEND: '/api/sse/send',
    SSE_CLIENTS: '/api/sse/clients',
    HEALTH: '/health',
};
```

## Vite 配置

### 开发服务器

```javascript
// client/vite.config.js
server: {
    port: 5173,           // 开发服务器端口
    host: true,           // 允许局域网访问
    proxy: {
        '/api': {
            target: env.VITE_API_BASE_URL || 'http://localhost:5000',
            changeOrigin: true,
            ws: true,     // 支持 WebSocket
        },
    },
}
```

### 预览服务器

```javascript
preview: {
    port: 4173,           // 预览服务器端口
    host: true,           // 允许局域网访问
}
```

## CORS 配置

### 后端 CORS 设置

```typescript
// server/src/index.ts
import cors from 'cors';

app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true,
}));
```

### 开发环境

```env
CORS_ORIGIN=*
# 或指定具体地址
# CORS_ORIGIN=http://localhost:5173
```

### 生产环境

```env
# 单个域名
CORS_ORIGIN=https://your-domain.com

# 多个域名（需要修改后端代码）
# CORS_ORIGIN=https://your-domain.com,https://app.your-domain.com
```

## 端口配置

### 默认端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端开发 | 5000 | `npm run dev` |
| 后端生产 | 5000 | `npm start` |
| 前端开发 | 5173 | `npm run dev:client` |
| 前端预览 | 4173 | `npm run preview:client` |

### 修改端口

**后端**：
```env
# server/.env
PORT=8080
```

**前端**：
```javascript
// client/vite.config.js
server: {
    port: 8080,
}
```

## 构建配置

### 后端构建

```json
// server/tsconfig.json
{
    "compilerOptions": {
        "target": "ES2020",
        "module": "commonjs",
        "outDir": "./dist",
        "rootDir": "./src"
    }
}
```

输出目录：`server/dist/`

### 前端构建

```javascript
// client/vite.config.js
build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
}
```

输出目录：`client/dist/`

## 日志配置

### 后端日志

使用 console.log 输出，可集成更专业的日志库如 Winston：

```typescript
// server/src/services/SSEService.ts
console.log(`新客户端连接: ${clientId}`);
console.log(`客户端断开连接: ${clientId}`);
```

### 前端日志

开发环境自动打印环境信息：

```javascript
// client/src/config/api.js
if (import.meta.env.DEV) {
    console.log('🔧 Environment Info:', ENV_INFO);
    console.log('📡 API Base URL:', getApiBaseUrl());
}
```

生产环境可禁用：

```javascript
if (import.meta.env.PROD) {
    console.log = () => {};
}
```

## 安全配置

### 环境变量保护

敏感信息使用环境变量，不提交到 Git：

```gitignore
.env
.env.local
.env.*.local
```

### HTTPS 配置

生产环境强制使用 HTTPS：

```nginx
# 重定向 HTTP 到 HTTPS
server {
    listen 80;
    return 301 https://$server_name$request_uri;
}
```

### Headers 安全

```nginx
add_header X-Frame-Options "SAMEORIGIN";
add_header X-Content-Type-Options "nosniff";
add_header X-XSS-Protection "1; mode=block";
```

## 配置优先级

### 前端环境变量优先级

从高到低：
1. `.env.local`
2. `.env.[mode].local`
3. `.env.[mode]`
4. `.env`

### 后端环境变量优先级

1. 系统环境变量
2. `.env` 文件
3. 代码默认值

## 配置验证

### 检查前端配置

```bash
# 开发环境
npm run dev:client
# 查看控制台输出的环境信息
```

### 检查后端配置

```bash
# 测试健康检查
curl http://localhost:5000/health

# 测试 SSE 连接
curl -N http://localhost:5000/api/sse/stream
```

## 常见配置问题

### 1. 跨域错误

**问题**：浏览器提示 CORS 错误

**解决**：
- 检查后端 `CORS_ORIGIN` 配置
- 确认前端访问地址与配置一致

### 2. 连接失败

**问题**：前端无法连接后端

**解决**：
- 检查 `VITE_API_BASE_URL` 配置
- 确认后端服务正在运行
- 查看浏览器控制台网络请求

### 3. 构建后无法访问 API

**问题**：生产环境构建后 API 404

**解决**：
- 检查 `.env.production` 配置
- 确认 Nginx 代理配置正确
- 查看网络请求的实际 URL

## 最佳实践

1. ✅ 使用环境变量管理配置
2. ✅ 不同环境使用不同的配置文件
3. ✅ 敏感信息不提交到 Git
4. ✅ 生产环境使用 HTTPS
5. ✅ 配置合理的 CORS 策略
6. ✅ 使用配置模块统一管理
7. ✅ 在文档中说明配置用途

## 参考资源

- [Vite 环境变量](https://vitejs.dev/guide/env-and-mode.html)
- [Node.js 环境变量](https://nodejs.org/api/process.html#processenv)
- [CORS 完全指南](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
