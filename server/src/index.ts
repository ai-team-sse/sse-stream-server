import express, { Request, Response } from 'express';
import cors from 'cors';
import { sseRouter } from './routes/sse';
import { config } from './config';

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 路由
app.use('/api/sse', sseRouter);

// 健康检查
app.get('/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(config.port, () => {
    console.log(`SSE Stream Server 运行在 http://localhost:${config.port}`);
    console.log(`健康检查: http://localhost:${config.port}/health`);
    console.log(`SSE 端点: http://localhost:${config.port}/api/sse/stream`);
});
