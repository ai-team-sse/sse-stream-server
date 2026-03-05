<template>
    <div class="chat-container">
        <div class="chat-header">
            <h1>SSE 聊天室</h1>
            <div class="status">
                <span class="status-dot" :class="{ connected: isConnected }"></span>
                <span class="status-text">
                    {{ isConnected ? `已连接 (ID: ${clientId})` : '未连接' }}
                </span>
                <span class="online-count">在线: {{ onlineCount }}</span>
            </div>
        </div>

        <div class="chat-messages" ref="messagesContainer">
            <div v-if="messages.length === 0" class="no-messages">
                暂无消息，连接后会显示在这里...
            </div>
            <div
                v-for="(msg, index) in messages"
                :key="index"
                class="message"
                :class="[msg.type, { 'message-right': msg.type === 'broadcast', 'message-left': msg.type === 'server-reply' || msg.type === 'system' }]"
            >
                <div class="message-bubble">
                    <div class="message-content">
                        <!-- 服务器回复：图标 + Markdown -->
                        <template v-if="msg.type === 'server-reply'">
                            <span class="server-icon">🤖</span>
                            <MarkdownMessage :content="msg.text" />
                        </template>
                        <!-- 用户消息：图标 + 文本 -->
                        <template v-else-if="msg.type === 'broadcast'">
                            <span class="user-icon">👤</span>
                            <span class="plain-text">{{ msg.text }}</span>
                        </template>
                        <!-- 系统消息：图标 + 文本 -->
                        <template v-else-if="msg.type === 'system'">
                            <span class="system-icon">ℹ️</span>
                            <span class="plain-text">{{ msg.text }}</span>
                        </template>
                        <!-- 其他消息 -->
                        <template v-else>
                            <span class="info-icon">✨</span>
                            <span class="plain-text">{{ msg.text }}</span>
                        </template>
                    </div>
                    <div class="message-time">{{ msg.time }}</div>
                </div>
            </div>
        </div>

        <div class="chat-input">
            <input
                v-model="inputMessage"
                @keyup.enter="sendMessage"
                placeholder="输入消息后按 Enter 发送..."
                :disabled="!isConnected"
            />
            <button @click="sendMessage" :disabled="!isConnected || !inputMessage.trim()">
                发送
            </button>
            <button
                v-if="!isConnected"
                @click="reconnect"
                class="reconnect-btn"
                title="重新连接"
            >
                🔄
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue';
import sseService from './services/sseService';
import MarkdownMessage from './components/MarkdownMessage.vue';

const messages = ref([]);
const inputMessage = ref('');
const isConnected = ref(false);
const clientId = ref('');
const onlineCount = ref(0);
const messagesContainer = ref(null);

const addMessage = (text, type = 'info') => {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

    messages.value.push({
        text,
        type,
        time,
    });

    nextTick(() => {
        scrollToBottom();
    });
};

const scrollToBottom = () => {
    if (messagesContainer.value) {
        messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
};

const sendMessage = async () => {
    if (!inputMessage.value.trim() || !isConnected.value) {
        return;
    }

    const message = inputMessage.value.trim();
    inputMessage.value = '';

    try {
        await sseService.broadcast(message);
        // 广播成功后，服务器会推送消息给所有客户端，包括自己
    } catch (error) {
        console.error('发送失败:', error);
        addMessage('发送失败: ' + error.message, 'error');
    }
};

const reconnect = () => {
    addMessage('正在重新连接...', 'system');
    window.location.reload();
};

const updateOnlineCount = async () => {
    try {
        const data = await sseService.getClients();
        onlineCount.value = data.count;
    } catch (error) {
        console.error('获取在线人数失败:', error);
    }
};

onMounted(() => {
    addMessage('正在连接到服务器...', 'system');

    sseService.connect(
        // onMessage
        (data) => {
            if (data.type === 'connected') {
                isConnected.value = true;
                clientId.value = data.clientId;
                addMessage('连接成功！', 'system');
                updateOnlineCount();
            } else if (data.type === 'broadcast') {
                // 区分用户消息和服务器回复
                const messageText = data.message || JSON.stringify(data);
                const messageType = data.sender === 'server' ? 'server-reply' : 'broadcast';
                addMessage(messageText, messageType);
                updateOnlineCount();
            } else if (data.type === 'direct') {
                // 显示私信消息
                const messageText = data.message || JSON.stringify(data);
                addMessage(`[私信] ${messageText}`, 'direct');
            } else {
                // 兜底处理：显示所有其他类型的消息
                const messageText = data.message || data.text || JSON.stringify(data);
                addMessage(messageText, 'info');
            }
        },
        // onError
        (error) => {
            console.error('连接错误:', error);
            isConnected.value = false;
            addMessage('连接错误，正在尝试重连...', 'error');
        },
        // onConnected
        (data) => {
            console.log('连接建立:', data);
            isConnected.value = true;
            clientId.value = data.clientId;
        }
    );
});

onUnmounted(() => {
    sseService.disconnect();
});
</script>

<style scoped>
.chat-container {
    width: 100%;
    max-width: 800px;
    height: 600px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.chat-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    text-align: center;
}

.chat-header h1 {
    margin: 0 0 10px 0;
    font-size: 24px;
    font-weight: 600;
}

.status {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    font-size: 14px;
    opacity: 0.9;
}

.status-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: #ff4444;
    animation: pulse 2s infinite;
}

.status-dot.connected {
    background: #44ff44;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

.online-count {
    padding: 4px 12px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 12px;
}

.chat-messages {
    flex: 1;
    padding: 20px;
    overflow-y: auto;
    background: #f8f9fa;
}

.no-messages {
    text-align: center;
    color: #999;
    padding: 40px 20px;
    font-size: 14px;
}

.message {
    margin-bottom: 16px;
    display: flex;
    animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* 左对齐：服务器回复 */
.message-left {
    justify-content: flex-start;
}

/* 右对齐：用户消息 */
.message-right {
    justify-content: flex-end;
}

/* 系统消息左对齐 */
.message.system {
    justify-content: flex-start;
}

.message-bubble {
    display: flex;
    flex-direction: column;
    max-width: 70%;
}

.message-time {
    font-size: 11px;
    color: #999;
    margin-top: 4px;
}

/* 时间位置调整 */
.message-left .message-time {
    text-align: left;
}

.message-right .message-time {
    text-align: right;
}

.message.system .message-time {
    text-align: left;
}

.message-content {
    padding: 12px 16px;
    border-radius: 18px;
    display: inline-flex;
    align-items: flex-start;
    gap: 8px;
    word-wrap: break-word;
    word-break: break-word;
}

.plain-text {
    white-space: pre-wrap;
    flex: 1;
}

/* 图标样式 */
.server-icon,
.user-icon,
.system-icon,
.info-icon {
    flex-shrink: 0;
    font-size: 16px;
    line-height: 1.6;
}

.message.system .message-content {
    background: #f5f5f5;
    color: #666;
    font-size: 13px;
    padding: 8px 12px;
    border-radius: 12px;
}

.message.info .message-content {
    background: #e8f5e9;
    color: #2e7d32;
}

/* 用户消息：右边，紫色渐变 */
.message.broadcast .message-content {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 18px 18px 4px 18px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

/* 服务器回复：左边，白色背景 */
.message.server-reply .message-content {
    background: white;
    color: #333;
    border: 1px solid #e0e0e0;
    border-radius: 18px 18px 18px 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    padding: 14px 18px;
    min-width: 200px;
}


.message.direct .message-content {
    background: #fff3e0;
    color: #f57c00;
}

.message.error .message-content {
    background: #ffebee;
    color: #c62828;
}

.system-icon,
.broadcast-icon,
.server-icon {
    margin-right: 6px;
}

.chat-input {
    display: flex;
    gap: 12px;
    padding: 20px;
    background: white;
    border-top: 1px solid #e0e0e0;
}

.chat-input input {
    flex: 1;
    padding: 12px 16px;
    border: 2px solid #e0e0e0;
    border-radius: 24px;
    font-size: 14px;
    outline: none;
    transition: border-color 0.2s;
}

.chat-input input:focus {
    border-color: #667eea;
}

.chat-input input:disabled {
    background: #f5f5f5;
    cursor: not-allowed;
}

.chat-input button {
    padding: 12px 32px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 24px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.chat-input button:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.chat-input button:active:not(:disabled) {
    transform: translateY(0);
}

.chat-input button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.reconnect-btn {
    padding: 12px 20px !important;
    min-width: auto !important;
    font-size: 18px !important;
}

/* 滚动条样式 */
.chat-messages::-webkit-scrollbar {
    width: 8px;
}

.chat-messages::-webkit-scrollbar-track {
    background: #f1f1f1;
}

.chat-messages::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
    background: #555;
}
</style>
