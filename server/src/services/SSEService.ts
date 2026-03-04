import { Response } from 'express';

interface SSEClient {
    id: string;
    response: Response;
    connectedAt: Date;
}

/**
 * SSE 服务类
 * 管理所有 SSE 客户端连接并提供消息推送功能
 */
export class SSEService {
    private clients: Map<string, SSEClient> = new Map();

    /**
     * 添加新客户端
     */
    addClient(clientId: string, response: Response): void {
        this.clients.set(clientId, {
            id: clientId,
            response,
            connectedAt: new Date(),
        });

        // 启动心跳
        this.startHeartbeat(clientId);
    }

    /**
     * 移除客户端
     */
    removeClient(clientId: string): void {
        this.clients.delete(clientId);
    }

    /**
     * 向特定客户端发送消息
     */
    sendToClient(clientId: string, data: unknown): boolean {
        const client = this.clients.get(clientId);
        if (!client) {
            return false;
        }

        try {
            client.response.write(`data: ${JSON.stringify(data)}\n\n`);
            return true;
        } catch (error) {
            console.error(`发送消息到客户端 ${clientId} 失败:`, error);
            this.removeClient(clientId);
            return false;
        }
    }

    /**
     * 广播消息给所有客户端
     */
    broadcast(data: unknown): number {
        let successCount = 0;

        for (const [clientId, client] of this.clients.entries()) {
            try {
                client.response.write(`data: ${JSON.stringify(data)}\n\n`);
                successCount++;
            } catch (error) {
                console.error(`广播到客户端 ${clientId} 失败:`, error);
                this.removeClient(clientId);
            }
        }

        return successCount;
    }

    /**
     * 获取所有客户端ID列表
     */
    getClients(): string[] {
        return Array.from(this.clients.keys());
    }

    /**
     * 获取当前连接的客户端数量
     */
    getClientCount(): number {
        return this.clients.size;
    }

    /**
     * 启动心跳机制，保持连接活跃
     */
    private startHeartbeat(clientId: string): void {
        const interval = setInterval(() => {
            const client = this.clients.get(clientId);
            if (!client) {
                clearInterval(interval);
                return;
            }

            try {
                // 发送心跳消息
                client.response.write(`: heartbeat\n\n`);
            } catch (error) {
                console.error(`心跳发送失败 ${clientId}:`, error);
                clearInterval(interval);
                this.removeClient(clientId);
            }
        }, 30000); // 每30秒发送一次心跳
    }
}
