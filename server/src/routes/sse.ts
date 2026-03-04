import { Router, Request, Response } from 'express';
import { SSEService } from '../services/SSEService';

export const sseRouter = Router();
const sseService = new SSEService();

/**
 * SSE 流端点
 * 客户端连接后会持续接收服务器推送的消息
 */
sseRouter.get('/stream', (req: Request, res: Response) => {
    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // 禁用 Nginx 缓冲

    const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log(`新客户端连接: ${clientId}`);

    // 发送初始连接消息
    res.write(`data: ${JSON.stringify({ type: 'connected', clientId, message: '连接成功' })}\n\n`);

    // 添加客户端到服务
    sseService.addClient(clientId, res);

    // 客户端断开连接时清理
    req.on('close', () => {
        console.log(`客户端断开连接: ${clientId}`);
        sseService.removeClient(clientId);
    });
});

/**
 * 广播消息端点
 * POST /api/sse/broadcast
 * Body: { message: string }
 */
sseRouter.post('/broadcast', (req: Request, res: Response) => {
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: '消息不能为空' });
    }

    const count = sseService.broadcast({
        type: 'broadcast',
        message,
        timestamp: new Date().toISOString(),
    });

    res.json({
        success: true,
        message: '消息已广播',
        clientCount: count,
    });
});

/**
 * 发送消息给特定客户端
 * POST /api/sse/send/:clientId
 * Body: { message: string }
 */
sseRouter.post('/send/:clientId', (req: Request, res: Response) => {
    const { clientId } = req.params;
    const { message } = req.body;

    if (!message) {
        return res.status(400).json({ error: '消息不能为空' });
    }

    const success = sseService.sendToClient(clientId, {
        type: 'direct',
        message,
        timestamp: new Date().toISOString(),
    });

    if (success) {
        res.json({ success: true, message: '消息已发送' });
    } else {
        res.status(404).json({ error: '客户端不存在' });
    }
});

/**
 * 获取当前连接的客户端列表
 */
sseRouter.get('/clients', (_req: Request, res: Response) => {
    const clients = sseService.getClients();
    res.json({
        count: clients.length,
        clients,
    });
});
