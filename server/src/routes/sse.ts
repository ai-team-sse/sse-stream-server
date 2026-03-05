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
 * 处理消息并生成回复
 */
function processMessage(userMessage: string): string {
    const msg = userMessage.toLowerCase().trim();

    // 简单的规则匹配回复
    if (msg.includes('你好') || msg.includes('hello') || msg.includes('hi')) {
        return '你好！很高兴见到你！😊';
    }

    if (msg.includes('时间')) {
        const now = new Date();
        return `现在时间是: ${now.toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}`;
    }

    if (msg.includes('天气')) {
        return '抱歉，我暂时无法查询天气信息。但今天看起来是个不错的日子！🌤️';
    }

    if (msg.includes('帮助') || msg === '?') {
        return '我可以回答关于时间的问题，也可以和你聊天。试试说"你好"或"现在几点"吧！';
    }

    // 默认回复
    const responses = [
        `收到你的消息："${userMessage}"`,
        `我听到了："${userMessage}"，有什么我可以帮助你的吗？`,
        `"${userMessage}" - 这是个有趣的话题！`,
        `关于"${userMessage}"，让我想想...🤔`,
    ];

    return responses[Math.floor(Math.random() * responses.length)];
}

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

    // 1. 广播用户消息
    sseService.broadcast({
        type: 'broadcast',
        message,
        sender: 'user',
        timestamp: new Date().toISOString(),
    });

    // 2. 生成服务器回复
    const reply = processMessage(message);

    // 3. 广播服务器回复（稍微延迟，模拟思考）
    setTimeout(() => {
        sseService.broadcast({
            type: 'broadcast',
            message: reply,
            sender: 'server',
            timestamp: new Date().toISOString(),
        });
    }, 500);

    res.json({
        success: true,
        message: '消息已发送',
        clientCount: sseService.getClientCount(),
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
