# 部署指南

本文档说明如何在不同环境下部署 SSE Stream Server 项目。

## 目录

- [环境配置](#环境配置)
- [开发环境](#开发环境)
- [生产环境部署](#生产环境部署)
- [Docker 部署](#docker-部署)
- [Nginx 配置](#nginx-配置)
- [常见部署场景](#常见部署场景)

## 环境配置

### 后端环境变量

复制 `server/.env.example` 为 `server/.env`:

```env
PORT=5000
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

### 前端环境变量

项目包含三个环境配置文件：

**1. `.env.development` (开发环境)**
```env
VITE_API_BASE_URL=http://localhost:5000
```

**2. `.env.production` (生产环境)**
```env
# 留空则使用相对路径（前后端同域名部署）
VITE_API_BASE_URL=
```

**3. `.env.local` (本地覆盖，不提交到 Git)**
```env
# 本地开发时的自定义配置
VITE_API_BASE_URL=http://192.168.1.100:5000
```

## 开发环境

### 本地开发

```bash
# 同时运行前后端
npm run dev:all

# 或分别运行
npm run dev          # 后端: http://localhost:5000
npm run dev:client   # 前端: http://localhost:5173
```

### 局域网访问

Vite 已配置 `host: true`，可通过局域网 IP 访问：

```bash
npm run dev:client
# 访问 http://192.168.x.x:5173
```

## 生产环境部署

### 场景一：前后端同域名部署（推荐）

**架构**：Nginx → 前端静态文件 + 后端 API 代理

#### 1. 构建项目

```bash
# 构建后端
npm run build:server

# 构建前端（使用相对路径）
npm run build:client
```

#### 2. 启动后端

```bash
cd server
npm start
# 或使用 PM2
pm2 start dist/index.js --name sse-server
```

#### 3. Nginx 配置

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;

        # 缓存策略
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;

        # SSE 相关配置
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;
        chunked_transfer_encoding off;

        # 其他头部
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # 超时配置（SSE 需要长连接）
        proxy_read_timeout 86400s;
        proxy_send_timeout 86400s;
    }

    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:5000;
        access_log off;
    }
}
```

**优势**：
- ✅ 无需 CORS 配置
- ✅ 统一域名，易于管理
- ✅ 前端使用相对路径，无需配置后端地址

### 场景二：前后端分离部署

**架构**：前端托管服务（Vercel/Netlify） + 独立后端服务器

#### 1. 构建前端

修改 `client/.env.production`:

```env
VITE_API_BASE_URL=https://api.your-domain.com
```

构建：

```bash
npm run build:client
```

#### 2. 部署前端

将 `client/dist/` 目录部署到：
- Vercel
- Netlify
- GitHub Pages
- 其他静态托管服务

#### 3. 部署后端

确保后端服务器配置 CORS：

```typescript
// server/src/index.ts
app.use(cors({
    origin: 'https://your-frontend-domain.com',
    credentials: true,
}));
```

**注意事项**：
- ⚠️ 需要配置 CORS
- ⚠️ 需要独立管理两个服务
- ⚠️ 需要两个域名/子域名

### 场景三：子域名部署

**架构**：
- 前端: `https://app.your-domain.com`
- 后端: `https://api.your-domain.com`

#### Nginx 配置

**前端配置** (`app.your-domain.com`):

```nginx
server {
    listen 80;
    server_name app.your-domain.com;

    location / {
        root /path/to/client/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

**后端配置** (`api.your-domain.com`):

```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;

        # SSE 配置
        proxy_set_header Connection '';
        proxy_buffering off;
        proxy_cache off;

        # 长连接超时
        proxy_read_timeout 86400s;
    }
}
```

**前端环境变量**:

```env
# client/.env.production
VITE_API_BASE_URL=https://api.your-domain.com
```

## Docker 部署

### 后端 Dockerfile

```dockerfile
# server/Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### 前端 Dockerfile

```dockerfile
# client/Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Docker Compose

```yaml
version: '3.8'

services:
  backend:
    build: ./server
    ports:
      - "3000:5000"
    environment:
      - NODE_ENV=production
      - PORT=5000
    restart: unless-stopped

  frontend:
    build: ./client
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped
```

运行：

```bash
docker-compose up -d
```

## PM2 部署

### 后端 PM2 配置

创建 `ecosystem.config.js`:

```javascript
module.exports = {
    apps: [{
        name: 'sse-server',
        script: './server/dist/index.js',
        instances: 1,
        exec_mode: 'cluster',
        env: {
            NODE_ENV: 'production',
            PORT: 3000,
        },
        error_file: './logs/err.log',
        out_file: './logs/out.log',
        log_date_format: 'YYYY-MM-DD HH:mm:ss',
    }],
};
```

启动：

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## HTTPS 配置

### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### Nginx HTTPS 配置

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    # SSL 优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 其他配置...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 常见部署场景

### 1. 阿里云/腾讯云服务器

```bash
# 1. 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 2. 安装 Nginx
sudo apt-get install nginx

# 3. 克隆代码
git clone <repository-url>
cd sse-stream-server

# 4. 安装依赖
npm install

# 5. 构建项目
npm run build

# 6. 配置 Nginx（参考上面的配置）
sudo nano /etc/nginx/sites-available/default

# 7. 启动服务
npm start
# 或使用 PM2
npm install -g pm2
pm2 start server/dist/index.js
```

### 2. Vercel 部署（仅前端）

在项目根目录创建 `vercel.json`:

```json
{
  "buildCommand": "npm run build:client",
  "outputDirectory": "client/dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-url.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 3. Railway/Render 部署

这些平台支持自动部署，只需连接 GitHub 仓库并配置环境变量即可。

## 性能优化

### 1. 启用 Gzip

```nginx
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
gzip_min_length 1000;
```

### 2. 静态资源缓存

```nginx
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### 3. 使用 CDN

将前端静态资源部署到 CDN，加速全球访问。

## 监控和日志

### 使用 PM2 监控

```bash
pm2 monit
pm2 logs
```

### Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/access.log

# 错误日志
tail -f /var/log/nginx/error.log
```

## 故障排查

### SSE 连接失败

1. 检查 Nginx 配置是否包含 SSE 相关设置
2. 确认 `proxy_buffering off`
3. 检查防火墙端口是否开放

### 跨域问题

1. 确认后端 CORS 配置
2. 检查前端 API 地址配置
3. 查看浏览器控制台错误信息

### 构建失败

1. 确认 Node.js 版本 >= 14
2. 删除 `node_modules` 重新安装
3. 检查环境变量配置

## 安全建议

1. ✅ 使用 HTTPS
2. ✅ 配置防火墙规则
3. ✅ 定期更新依赖
4. ✅ 设置合理的 CORS 策略
5. ✅ 使用环境变量管理敏感信息
6. ✅ 启用请求限流
7. ✅ 定期备份数据

## 参考资源

- [Nginx 官方文档](https://nginx.org/en/docs/)
- [PM2 文档](https://pm2.keymetrics.io/)
- [Let's Encrypt](https://letsencrypt.org/)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html)
