/**
 * API 配置模块
 * 根据环境变量动态配置 API 地址
 */

// 获取 API 基础地址
export const getApiBaseUrl = () => {
    // 生产环境下，如果 VITE_API_BASE_URL 为空，则使用相对路径
    if (import.meta.env.PROD && !import.meta.env.VITE_API_BASE_URL) {
        return window.location.origin;
    }

    // 否则使用配置的地址或默认地址
    return import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
};

// API 端点配置
export const API_ENDPOINTS = {
    SSE_STREAM: '/api/sse/stream',
    SSE_BROADCAST: '/api/sse/broadcast',
    SSE_SEND: '/api/sse/send',
    SSE_CLIENTS: '/api/sse/clients',
    HEALTH: '/health',
};

// 获取完整的 API URL
export const getApiUrl = (endpoint) => {
    const baseUrl = getApiBaseUrl();

    // 开发环境使用代理，不需要拼接 baseUrl
    if (import.meta.env.DEV) {
        return endpoint;
    }

    // 生产环境需要拼接完整 URL
    return `${baseUrl}${endpoint}`;
};

// 环境信息
export const ENV_INFO = {
    mode: import.meta.env.MODE,
    isDev: import.meta.env.DEV,
    isProd: import.meta.env.PROD,
    apiBaseUrl: getApiBaseUrl(),
};

// 打印环境配置（仅开发环境）
if (import.meta.env.DEV) {
    console.log('🔧 Environment Info:', ENV_INFO);
    console.log('📡 API Base URL:', getApiBaseUrl());
}

export default {
    getApiBaseUrl,
    getApiUrl,
    API_ENDPOINTS,
    ENV_INFO,
};
