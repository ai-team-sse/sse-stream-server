# 故障排查指南

本文档帮助你诊断和解决 SSE Stream Server 项目的常见问题。

## 消息显示问题

### 问题：发送消息后看不到显示

**可能原因和解决方法**：

#### 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签：

```javascript
// 应该看到类似的日志
收到消息: {type: "connected", clientId: "client-xxx", message: "连接成功"}
发送消息: Hello
发送结果: {success: true, message: "消息已广播", clientCount: 1}
收到消息: {type: "broadcast", message: "Hello", timestamp: "..."}
```

**如果没有日志**：
- 检查 SSE 连接是否建立
- 查看 Network 标签，筛选 EventStream 类型
- 确认后端服务正在运行

#### 2. 检查 SSE 连接

在 Network 标签中：
1. 筛选类型为 `EventStream`
2. 找到 `/api/sse/stream` 请求
3. 查看状态应该是 `200` 或 `pending`
4. 点击查看 EventStream 标签，应该能看到消息流

**如果连接失败**：
- 状态码 `404`: 后端未运行或路由错误
- 状态码 `502/503`: 代理配置错误
- 状态码 `CORS error`: 跨域配置问题

#### 3. 检查消息格式

后端发送的消息格式应该是：

```json
{
  "type": "broadcast",
  "message": "你的消息内容",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

**前端处理逻辑**：
- `type === 'connected'` → 显示为系统消息
- `type === 'broadcast'` → 显示为广播消息（紫色）
- `type === 'direct'` → 显示为私信（橙色）
- 其他类型 → 显示为信息消息（绿色）

#### 4. 测试后端 API

使用 curl 测试后端是否正常：

```bash
# 终端1：建立 SSE 连接
curl -N http://localhost:5000/api/sse/stream

# 应该看到：
# data: {"type":"connected","clientId":"client-xxx","message":"连接成功"}

# 终端2：发送广播
curl -X POST http://localhost:5000/api/sse/broadcast \
  -H "Content-Type: application/json" \
  -d '{"message": "Test message"}'

# 终端1 应该收到：
# data: {"type":"broadcast","message":"Test message","timestamp":"..."}
```

**如果 curl 测试正常，前端不正常**：
- 可能是前端代码问题
- 检查 API 配置是否正确
- 查看浏览器控制台错误

#### 5. 清除缓存并重试

```bash
# 停止服务
Ctrl+C

# 清理并重新安装依赖
rm -rf node_modules package-lock.json
npm install

# 重新启动
npm run dev:all
```

## 连接问题

### 问题：无法连接到服务器

#### 1. 后端未启动

```bash
# 检查后端是否运行
curl http://localhost:5000/health

# 如果失败，启动后端
npm run dev
```

#### 2. 端口被占用

```bash
# 检查端口占用
lsof -i :5000

# 如果被占用，修改端口
# 编辑 server/.env
PORT=5001

# 编辑 client/.env.development
VITE_API_BASE_URL=http://localhost:5001
```

#### 3. 防火墙阻止

```bash
# macOS
sudo lsof -i -P | grep LISTEN | grep 5000

# Linux
sudo ufw allow 5000
```

### 问题：连接后立即断开

#### 1. 检查心跳机制

后端每 30 秒发送心跳，确保连接保持：

```typescript
// server/src/services/SSEService.ts
// 心跳间隔：30000ms (30秒)
```

**如果心跳失败**：
- 检查网络稳定性
- 查看后端日志

#### 2. 代理超时配置

开发环境使用 Vite 代理，检查配置：

```javascript
// client/vite.config.js
proxy: {
    '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        ws: true, // 确保启用 WebSocket 支持
    },
}
```

生产环境 Nginx 配置：

```nginx
location /api/ {
    proxy_pass http://127.0.0.1:5000;

    # SSE 长连接配置
    proxy_read_timeout 86400s;
    proxy_send_timeout 86400s;
    proxy_buffering off;
    proxy_cache off;
}
```

## CORS 问题

### 问题：跨域请求被阻止

#### 检查后端 CORS 配置

```bash
# server/.env
CORS_ORIGIN=http://localhost:5173

# 或允许所有来源（仅开发环境）
CORS_ORIGIN=*
```

#### 前后端分离部署

```env
# 前端域名: https://app.example.com
# 后端配置
CORS_ORIGIN=https://app.example.com

# 支持多个域名
CORS_ORIGIN=https://app.example.com,https://www.example.com
```

## 消息接收延迟

### 正常延迟范围

SSE 是服务器推送技术，存在轻微延迟是正常的：
- 局域网: < 100ms
- 互联网: 100-500ms
- 跨国: 500ms-2s

### 检查网络延迟

```bash
# 测试后端响应时间
curl -o /dev/null -s -w "Time: %{time_total}s\n" http://localhost:5000/health
```

### 优化建议

1. 使用 CDN 加速前端资源
2. 后端部署在用户附近的服务器
3. 使用 HTTP/2
4. 启用 Gzip 压缩

## 调试技巧

### 1. 启用详细日志

前端已内置日志：

```javascript
// 所有 SSE 消息会自动打印
收到消息: {...}
发送消息: {...}
发送结果: {...}
```

### 2. 使用 Vite 代理日志

Vite 配置中已启用代理日志：

```javascript
configure: (proxy) => {
    proxy.on('proxyReq', (proxyReq, req) => {
        console.log('Sending Request:', req.method, req.url);
    });
    proxy.on('proxyRes', (proxyRes, req) => {
        console.log('Received Response:', proxyRes.statusCode, req.url);
    });
}
```

### 3. 测试工具

**浏览器开发者工具**：
- Console：查看日志
- Network：查看请求
- Application：查看 Storage

**命令行工具**：
```bash
# curl - 测试 HTTP 请求
curl -N http://localhost:5000/api/sse/stream

# httpie - 更友好的 HTTP 客户端
http --stream GET http://localhost:5000/api/sse/stream

# websocat - WebSocket 客户端
# （SSE 不是 WebSocket，但可用于类似测试）
```

### 4. 多终端测试

打开多个浏览器标签或不同浏览器：
1. 发送消息
2. 观察所有标签是否都收到
3. 检查在线人数是否正确

## 性能问题

### 问题：消息发送缓慢

#### 1. 检查连接数

```bash
# 查看当前连接数
curl http://localhost:5000/api/sse/clients

# 输出
{"count": 10, "clients": [...]}
```

#### 2. 后端性能

单个 Node.js 进程理论上可支持 10000+ 并发连接，但实际取决于：
- 服务器配置
- 网络带宽
- 消息频率

#### 3. 前端性能

大量消息会影响前端渲染：
- 限制显示消息数量
- 使用虚拟滚动
- 定期清理旧消息

### 问题：内存占用过高

#### 后端优化

```typescript
// 定期清理断开的连接
// 限制最大连接数
// 实现消息队列
```

#### 前端优化

```javascript
// 限制消息数组大小
if (messages.value.length > 100) {
    messages.value.shift(); // 移除最旧的消息
}
```

## 部署问题

### 问题：生产环境无法访问

#### 1. 检查环境变量

```bash
# 后端
echo $PORT
echo $NODE_ENV
echo $CORS_ORIGIN

# 前端构建时的环境变量
# 查看 .env.production
```

#### 2. 检查 Nginx 配置

```bash
# 测试配置
sudo nginx -t

# 重新加载
sudo nginx -s reload

# 查看错误日志
sudo tail -f /var/log/nginx/error.log
```

#### 3. 检查防火墙

```bash
# 开放端口
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000
```

## 常见错误信息

### ERR_CONNECTION_REFUSED

**原因**：后端服务未启动

**解决**：
```bash
npm run dev
# 或
npm start
```

### CORS policy error

**原因**：跨域配置错误

**解决**：
```env
# server/.env
CORS_ORIGIN=http://localhost:5173
```

### 502 Bad Gateway

**原因**：Nginx 无法连接到后端

**解决**：
1. 检查后端是否运行
2. 检查 Nginx proxy_pass 配置
3. 查看后端日志

### EventSource failed

**原因**：SSE 连接失败

**解决**：
1. 检查 URL 是否正确
2. 查看 Network 标签详细错误
3. 测试后端 API

## 获取帮助

### 提供以下信息

1. **环境信息**：
   - Node.js 版本
   - 操作系统
   - 浏览器版本

2. **错误信息**：
   - 浏览器控制台错误
   - 后端日志
   - Network 请求详情

3. **复现步骤**：
   - 如何触发问题
   - 是否稳定复现

### 联系方式

- GitHub Issues
- 项目文档
- 社区论坛

## 预防性检查清单

部署前检查：

- [ ] 后端健康检查正常
- [ ] 前端能连接到后端
- [ ] 消息收发正常
- [ ] 多客户端测试通过
- [ ] CORS 配置正确
- [ ] 环境变量设置正确
- [ ] 日志正常输出
- [ ] 性能测试通过
- [ ] 安全配置完成
- [ ] 备份和恢复方案就绪
