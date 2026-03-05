import { getApiUrl, API_ENDPOINTS } from '../config/api.js';

/**
 * SSE 服务封装
 */
class SSEService {
    constructor() {
        this.eventSource = null;
        this.clientId = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 2000;
    }

    /**
     * 连接到 SSE 服务器
     */
    connect(onMessage, onError, onConnected) {
        const url = getApiUrl(API_ENDPOINTS.SSE_STREAM);

        this.eventSource = new EventSource(url);

        this.eventSource.onopen = () => {
            this.reconnectAttempts = 0;
        };

        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // 保存客户端 ID
                if (data.type === 'connected' && data.clientId) {
                    this.clientId = data.clientId;
                    if (onConnected) {
                        onConnected(data);
                    }
                }

                if (onMessage) {
                    onMessage(data);
                }
            } catch (error) {
                console.error('解析消息失败:', error);
            }
        };

        this.eventSource.onerror = (error) => {
            if (this.eventSource.readyState === EventSource.CLOSED) {
                if (this.reconnectAttempts < this.maxReconnectAttempts) {
                    this.reconnectAttempts++;

                    setTimeout(() => {
                        this.connect(onMessage, onError, onConnected);
                    }, this.reconnectDelay * this.reconnectAttempts);
                }
            }

            if (onError) {
                onError(error);
            }
        };
    }

    /**
     * 发送广播消息
     */
    async broadcast(message) {
        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.SSE_BROADCAST), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('发送消息失败');
            }

            return await response.json();
        } catch (error) {
            console.error('广播消息失败:', error);
            throw error;
        }
    }

    /**
     * 发送定向消息
     */
    async sendToClient(clientId, message) {
        try {
            const response = await fetch(getApiUrl(`${API_ENDPOINTS.SSE_SEND}/${clientId}`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message }),
            });

            if (!response.ok) {
                throw new Error('发送消息失败');
            }

            return await response.json();
        } catch (error) {
            console.error('发送定向消息失败:', error);
            throw error;
        }
    }

    /**
     * 获取在线客户端列表
     */
    async getClients() {
        try {
            const response = await fetch(getApiUrl(API_ENDPOINTS.SSE_CLIENTS));

            if (!response.ok) {
                throw new Error('获取客户端列表失败');
            }

            return await response.json();
        } catch (error) {
            console.error('获取客户端列表失败:', error);
            throw error;
        }
    }

    /**
     * 断开连接
     */
    disconnect() {
        if (this.eventSource) {
            this.eventSource.close();
            this.eventSource = null;
            this.clientId = null;
        }
    }

    /**
     * 获取当前客户端 ID
     */
    getClientId() {
        return this.clientId;
    }

    /**
     * 检查是否已连接
     */
    isConnected() {
        return this.eventSource && this.eventSource.readyState === EventSource.OPEN;
    }
}

export default new SSEService();
