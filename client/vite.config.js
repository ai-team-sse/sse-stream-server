import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig(({ mode }) => {
    // 加载环境变量
    const env = loadEnv(mode, process.cwd(), '');

    return {
        plugins: [vue()],
        server: {
            port: 5173,
            host: true, // 允许外部访问
            proxy: {
                '/api': {
                    target: env.VITE_API_BASE_URL || 'http://localhost:5000',
                    changeOrigin: true,
                    ws: true, // 支持 WebSocket
                    configure: (proxy, _options) => {
                        proxy.on('error', (err, _req, _res) => {
                            console.log('proxy error', err);
                        });
                        proxy.on('proxyReq', (proxyReq, req, _res) => {
                            console.log('Sending Request to the Target:', req.method, req.url);
                        });
                        proxy.on('proxyRes', (proxyRes, req, _res) => {
                            console.log(
                                'Received Response from the Target:',
                                proxyRes.statusCode,
                                req.url
                            );
                        });
                    },
                },
            },
        },
        preview: {
            port: 4173,
            host: true,
        },
    };
});
