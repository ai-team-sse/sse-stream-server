import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Response } from 'express';
import { SSEService } from './SSEService';

describe('SSEService', () => {
    let sseService: SSEService;
    let mockResponse: Partial<Response>;

    beforeEach(() => {
        sseService = new SSEService();
        mockResponse = {
            write: vi.fn(),
        };
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    describe('addClient', () => {
        it('应该成功添加客户端', () => {
            sseService.addClient('client-1', mockResponse as Response);

            expect(sseService.getClientCount()).toBe(1);
            expect(sseService.getClients()).toContain('client-1');
        });

        it('添加客户端后应该启动心跳', () => {
            sseService.addClient('client-1', mockResponse as Response);

            // 快进30秒
            vi.advanceTimersByTime(30000);

            expect(mockResponse.write).toHaveBeenCalledWith(': heartbeat\n\n');
        });

        it('应该支持添加多个客户端', () => {
            const mockResponse2: Partial<Response> = { write: vi.fn() };

            sseService.addClient('client-1', mockResponse as Response);
            sseService.addClient('client-2', mockResponse2 as Response);

            expect(sseService.getClientCount()).toBe(2);
            expect(sseService.getClients()).toEqual(['client-1', 'client-2']);
        });
    });

    describe('removeClient', () => {
        it('应该成功移除客户端', () => {
            sseService.addClient('client-1', mockResponse as Response);
            expect(sseService.getClientCount()).toBe(1);

            sseService.removeClient('client-1');

            expect(sseService.getClientCount()).toBe(0);
            expect(sseService.getClients()).not.toContain('client-1');
        });

        it('移除客户端后心跳应该停止', () => {
            sseService.addClient('client-1', mockResponse as Response);
            sseService.removeClient('client-1');

            // 快进30秒
            vi.advanceTimersByTime(30000);

            // 心跳不应该被调用（客户端已被移除）
            expect(mockResponse.write).not.toHaveBeenCalledWith(': heartbeat\n\n');
        });

        it('移除不存在的客户端不应该报错', () => {
            expect(() => {
                sseService.removeClient('non-existent');
            }).not.toThrow();
        });
    });

    describe('sendToClient', () => {
        it('应该成功向指定客户端发送消息', () => {
            sseService.addClient('client-1', mockResponse as Response);

            const result = sseService.sendToClient('client-1', { message: 'Hello' });

            expect(result).toBe(true);
            expect(mockResponse.write).toHaveBeenCalledWith('data: {"message":"Hello"}\n\n');
        });

        it('向不存在的客户端发送消息应该返回 false', () => {
            const result = sseService.sendToClient('non-existent', { message: 'Hello' });

            expect(result).toBe(false);
        });

        it('发送失败时应该移除客户端', () => {
            mockResponse.write = vi.fn().mockImplementation(() => {
                throw new Error('Write failed');
            });

            sseService.addClient('client-1', mockResponse as Response);

            const result = sseService.sendToClient('client-1', { message: 'Hello' });

            expect(result).toBe(false);
            expect(sseService.getClientCount()).toBe(0);
        });
    });

    describe('broadcast', () => {
        it('应该向所有客户端广播消息', () => {
            const mockResponse2: Partial<Response> = { write: vi.fn() };
            const mockResponse3: Partial<Response> = { write: vi.fn() };

            sseService.addClient('client-1', mockResponse as Response);
            sseService.addClient('client-2', mockResponse2 as Response);
            sseService.addClient('client-3', mockResponse3 as Response);

            const successCount = sseService.broadcast({ message: 'Broadcast' });

            expect(successCount).toBe(3);
            expect(mockResponse.write).toHaveBeenCalledWith('data: {"message":"Broadcast"}\n\n');
            expect(mockResponse2.write).toHaveBeenCalledWith('data: {"message":"Broadcast"}\n\n');
            expect(mockResponse3.write).toHaveBeenCalledWith('data: {"message":"Broadcast"}\n\n');
        });

        it('广播时部分客户端失败应该继续处理其他客户端', () => {
            const mockResponse2: Partial<Response> = {
                write: vi.fn().mockImplementation(() => {
                    throw new Error('Write failed');
                }),
            };
            const mockResponse3: Partial<Response> = { write: vi.fn() };

            sseService.addClient('client-1', mockResponse as Response);
            sseService.addClient('client-2', mockResponse2 as Response);
            sseService.addClient('client-3', mockResponse3 as Response);

            const successCount = sseService.broadcast({ message: 'Broadcast' });

            expect(successCount).toBe(2);
            expect(sseService.getClientCount()).toBe(2);
            expect(sseService.getClients()).not.toContain('client-2');
        });

        it('没有客户端时广播应该返回 0', () => {
            const successCount = sseService.broadcast({ message: 'Broadcast' });

            expect(successCount).toBe(0);
        });
    });

    describe('getClients', () => {
        it('应该返回所有客户端ID', () => {
            sseService.addClient('client-1', mockResponse as Response);
            sseService.addClient('client-2', { write: vi.fn() } as unknown as Response);

            const clients = sseService.getClients();

            expect(clients).toHaveLength(2);
            expect(clients).toContain('client-1');
            expect(clients).toContain('client-2');
        });

        it('没有客户端时应该返回空数组', () => {
            const clients = sseService.getClients();

            expect(clients).toEqual([]);
        });
    });

    describe('getClientCount', () => {
        it('应该返回正确的客户端数量', () => {
            expect(sseService.getClientCount()).toBe(0);

            sseService.addClient('client-1', mockResponse as Response);
            expect(sseService.getClientCount()).toBe(1);

            sseService.addClient('client-2', { write: vi.fn() } as unknown as Response);
            expect(sseService.getClientCount()).toBe(2);

            sseService.removeClient('client-1');
            expect(sseService.getClientCount()).toBe(1);
        });
    });

    describe('heartbeat', () => {
        it('应该每30秒发送一次心跳', () => {
            sseService.addClient('client-1', mockResponse as Response);

            // 快进29秒，不应该发送心跳
            vi.advanceTimersByTime(29000);
            expect(mockResponse.write).not.toHaveBeenCalledWith(': heartbeat\n\n');

            // 再快进1秒，应该发送第一次心跳
            vi.advanceTimersByTime(1000);
            expect(mockResponse.write).toHaveBeenCalledTimes(1);
            expect(mockResponse.write).toHaveBeenCalledWith(': heartbeat\n\n');

            // 再快进30秒，应该发送第二次心跳
            vi.advanceTimersByTime(30000);
            expect(mockResponse.write).toHaveBeenCalledTimes(2);
        });

        it('心跳失败时应该移除客户端并停止心跳', () => {
            let callCount = 0;
            mockResponse.write = vi.fn().mockImplementation(() => {
                callCount++;
                if (callCount > 1) {
                    throw new Error('Write failed');
                }
            });

            sseService.addClient('client-1', mockResponse as Response);

            // 第一次心跳成功
            vi.advanceTimersByTime(30000);
            expect(sseService.getClientCount()).toBe(1);

            // 第二次心跳失败，客户端应该被移除
            vi.advanceTimersByTime(30000);
            expect(sseService.getClientCount()).toBe(0);

            // 后续不应该再尝试发送心跳
            vi.advanceTimersByTime(30000);
            expect(mockResponse.write).toHaveBeenCalledTimes(2);
        });
    });
});
