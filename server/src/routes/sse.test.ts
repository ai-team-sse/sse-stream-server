import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { sseRouter } from './sse';

describe('SSE Routes', () => {
    let app: Express;

    beforeEach(() => {
        app = express();
        app.use(express.json());
        app.use('/api/sse', sseRouter);
    });

    describe('GET /api/sse/stream', () => {
        it('应该返回正确的 SSE 响应头', (done) => {
            request(app)
                .get('/api/sse/stream')
                .then((res) => {
                    expect(res.status).toBe(200);
                    expect(res.headers['content-type']).toBe('text/event-stream');
                    expect(res.headers['cache-control']).toBe('no-cache');
                    expect(res.headers['connection']).toBe('keep-alive');
                    expect(res.headers['x-accel-buffering']).toBe('no');
                    done();
                })
                .catch(done);

            // SSE 连接会一直保持，所以在收到响应头后立即完成测试
            setTimeout(() => {
                done();
            }, 500);
        });

        it('应该发送初始连接消息', (done) => {
            const req = request(app)
                .get('/api/sse/stream')
                .buffer(false)
                .parse((res, callback) => {
                    let data = '';
                    res.on('data', (chunk) => {
                        data += chunk.toString();
                        if (data.includes('connected')) {
                            expect(data).toContain('data:');
                            expect(data).toContain('connected');
                            expect(data).toContain('client-');
                            req.abort();
                            done();
                        }
                    });
                    callback(null, Buffer.alloc(0));
                });

            setTimeout(() => {
                req.abort();
                done(new Error('测试超时'));
            }, 1000);
        });
    });

    describe('POST /api/sse/broadcast', () => {
        it('应该成功广播消息', async () => {
            const response = await request(app)
                .post('/api/sse/broadcast')
                .send({ message: 'Test broadcast' })
                .expect(200);

            expect(response.body).toEqual({
                success: true,
                message: '消息已广播',
                clientCount: expect.any(Number),
            });
        });

        it('消息为空时应该返回 400 错误', async () => {
            const response = await request(app).post('/api/sse/broadcast').send({}).expect(400);

            expect(response.body).toEqual({
                error: '消息不能为空',
            });
        });

        it('消息为空字符串时应该返回 400 错误', async () => {
            const response = await request(app)
                .post('/api/sse/broadcast')
                .send({ message: '' })
                .expect(400);

            expect(response.body).toEqual({
                error: '消息不能为空',
            });
        });
    });

    describe('POST /api/sse/send/:clientId', () => {
        it('客户端不存在时应该返回 404 错误', async () => {
            const response = await request(app)
                .post('/api/sse/send/non-existent-client')
                .send({ message: 'Test message' })
                .expect(404);

            expect(response.body).toEqual({
                error: '客户端不存在',
            });
        });

        it('消息为空时应该返回 400 错误', async () => {
            const response = await request(app)
                .post('/api/sse/send/client-123')
                .send({})
                .expect(400);

            expect(response.body).toEqual({
                error: '消息不能为空',
            });
        });

        it('消息为空字符串时应该返回 400 错误', async () => {
            const response = await request(app)
                .post('/api/sse/send/client-123')
                .send({ message: '' })
                .expect(400);

            expect(response.body).toEqual({
                error: '消息不能为空',
            });
        });
    });

    describe('GET /api/sse/clients', () => {
        it('应该返回客户端列表', async () => {
            const response = await request(app).get('/api/sse/clients').expect(200);

            expect(response.body).toHaveProperty('count');
            expect(response.body).toHaveProperty('clients');
            expect(Array.isArray(response.body.clients)).toBe(true);
            expect(typeof response.body.count).toBe('number');
        });

        it('客户端列表的数量应该与 count 一致', async () => {
            const response = await request(app).get('/api/sse/clients').expect(200);

            expect(response.body.count).toBe(response.body.clients.length);
        });
    });

    describe('Integration: Stream and Broadcast', () => {
        it('广播消息应该到达已连接的客户端', (done) => {
            let clientId = '';

            // 建立 SSE 连接
            const streamReq = request(app)
                .get('/api/sse/stream')
                .buffer(false)
                .parse((res, callback) => {
                    res.on('data', (chunk) => {
                        const text = chunk.toString();

                        // 提取客户端 ID
                        if (text.includes('connected') && !clientId) {
                            const match = text.match(/"clientId":"([^"]+)"/);
                            if (match) {
                                clientId = match[1];

                                // 发送广播消息
                                request(app)
                                    .post('/api/sse/broadcast')
                                    .send({ message: 'Integration test' })
                                    .then((broadcastRes) => {
                                        expect(broadcastRes.body.success).toBe(true);
                                        expect(broadcastRes.body.clientCount).toBeGreaterThan(0);
                                    });
                            }
                        }

                        // 验证收到广播消息
                        if (text.includes('broadcast') && text.includes('Integration test')) {
                            expect(text).toContain('Integration test');
                            done();
                        }
                    });

                    callback(null, Buffer.alloc(0));
                });

            // 设置超时
            setTimeout(() => {
                streamReq.abort();
                if (!clientId) {
                    done(new Error('测试超时'));
                }
            }, 3000);
        });
    });

    describe('Integration: Stream and Direct Message', () => {
        it('定向消息应该成功发送到指定客户端', (done) => {
            let clientId = '';

            // 建立 SSE 连接
            const streamReq = request(app)
                .get('/api/sse/stream')
                .buffer(false)
                .parse((res, callback) => {
                    res.on('data', (chunk) => {
                        const text = chunk.toString();

                        // 提取客户端 ID
                        if (text.includes('connected') && !clientId) {
                            const match = text.match(/"clientId":"([^"]+)"/);
                            if (match) {
                                clientId = match[1];

                                // 发送定向消息
                                request(app)
                                    .post(`/api/sse/send/${clientId}`)
                                    .send({ message: 'Direct message test' })
                                    .then((sendRes) => {
                                        expect(sendRes.body.success).toBe(true);
                                    });
                            }
                        }

                        // 验证收到定向消息
                        if (text.includes('direct') && text.includes('Direct message test')) {
                            expect(text).toContain('Direct message test');
                            done();
                        }
                    });

                    callback(null, Buffer.alloc(0));
                });

            // 设置超时
            setTimeout(() => {
                streamReq.abort();
                if (!clientId) {
                    done(new Error('测试超时'));
                }
            }, 3000);
        });
    });
});
