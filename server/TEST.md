# 测试文档

本项目使用 [Vitest](https://vitest.dev/) 作为测试框架。

## 为什么选择 Vitest？

- ⚡️ **极速**: 基于 Vite，速度比 Jest 快 10 倍以上
- 🔧 **零配置**: 开箱即用的 TypeScript/ESM 支持
- 🎯 **兼容性**: 兼容 Jest 的 API，学习成本低
- 🖼 **UI 界面**: 内置美观的测试 UI
- 📊 **覆盖率**: 内置代码覆盖率支持

## 快速开始

```bash
# 运行所有测试
npm test

# 监听模式（文件变化时自动运行）
npm run test:watch

# 生成覆盖率报告
npm run test:coverage

# 打开可视化测试界面
npm run test:ui
```

## 测试结构

### 单元测试

位置: `src/services/SSEService.test.ts`

测试 `SSEService` 类的核心功能：

- **客户端管理**
  - ✅ 添加客户端
  - ✅ 移除客户端
  - ✅ 获取客户端列表
  - ✅ 获取客户端数量

- **消息发送**
  - ✅ 向指定客户端发送消息
  - ✅ 广播消息给所有客户端
  - ✅ 处理发送失败的情况

- **心跳机制**
  - ✅ 定时发送心跳消息
  - ✅ 心跳失败时清理客户端
  - ✅ 客户端移除后停止心跳

### 集成测试

位置: `src/routes/sse.test.ts`

测试 SSE HTTP 路由：

- **SSE 流连接** (`GET /api/sse/stream`)
  - ✅ 返回正确的 SSE 响应头
  - ✅ 发送初始连接消息

- **广播端点** (`POST /api/sse/broadcast`)
  - ✅ 成功广播消息
  - ✅ 验证消息不能为空

- **定向消息端点** (`POST /api/sse/send/:clientId`)
  - ✅ 客户端不存在时返回 404
  - ✅ 验证消息不能为空

- **客户端列表端点** (`GET /api/sse/clients`)
  - ✅ 返回客户端列表
  - ✅ 数量与列表一致

- **完整流程测试**
  - ✅ 建立连接 → 广播消息 → 客户端接收
  - ✅ 建立连接 → 定向消息 → 客户端接收

## 编写测试

### 基本示例

```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('MyService', () => {
  beforeEach(() => {
    // 每个测试前的准备工作
  });

  it('should do something', () => {
    // 测试代码
    expect(true).toBe(true);
  });
});
```

### Mock 示例

```typescript
import { vi } from 'vitest';

// Mock 函数
const mockFn = vi.fn();

// Mock 对象
const mockResponse = {
  write: vi.fn(),
};

// Mock 定时器
vi.useFakeTimers();
vi.advanceTimersByTime(30000);
vi.useRealTimers();
```

### 异步测试

```typescript
// 使用 async/await
it('async test', async () => {
  const result = await asyncFunction();
  expect(result).toBe(expected);
});

// 使用 done 回调
it('callback test', (done) => {
  someAsyncOperation(() => {
    expect(true).toBe(true);
    done();
  });
});
```

## 测试覆盖率

运行 `npm run test:coverage` 后，会生成详细的覆盖率报告：

```
Test Files  2 passed (2)
     Tests  29 passed (29)
  Start at  XX:XX:XX
  Duration  XXXms

 COVERAGE  v3.2.4

File                    | % Stmts | % Branch | % Funcs | % Lines
--------------------|---------|----------|---------|--------
services/SSEService.ts |   100   |   100    |   100   |   100
routes/sse.ts          |   100   |   100    |   100   |   100
```

覆盖率报告会保存在 `coverage/` 目录下，可以通过浏览器打开 `coverage/index.html` 查看详细的可视化报告。

## 最佳实践

1. **测试命名**: 使用描述性的测试名称
   ```typescript
   it('should return 404 when client does not exist', () => {});
   ```

2. **独立性**: 每个测试应该相互独立，不依赖其他测试的状态

3. **清理**: 使用 `beforeEach`/`afterEach` 清理测试状态
   ```typescript
   afterEach(() => {
     vi.restoreAllMocks();
   });
   ```

4. **覆盖边界情况**: 测试正常情况、边界情况和错误情况
   - ✅ 正常输入
   - ✅ 空值/null/undefined
   - ✅ 错误情况
   - ✅ 边界值

5. **保持简单**: 每个测试只验证一个功能点

## CI/CD 集成

在 CI/CD 管道中运行测试：

```yaml
# GitHub Actions 示例
- name: Run tests
  run: npm test

- name: Generate coverage
  run: npm run test:coverage

- name: Upload coverage
  uses: codecov/codecov-action@v3
```

## 调试测试

### 使用 VSCode

1. 在测试文件中设置断点
2. 使用 "Debug Test" 按钮（Vitest 扩展）
3. 或在 VSCode 调试面板运行

### 命令行调试

```bash
# 运行特定测试文件
npm test src/services/SSEService.test.ts

# 运行包含特定名称的测试
npm test -- --grep "broadcast"

# 显示更多输出
npm test -- --reporter=verbose
```

## 常见问题

### 测试超时

如果测试涉及 SSE 连接等长时间操作，增加超时时间：

```typescript
it('long running test', async () => {
  // test code
}, 30000); // 30秒超时
```

### Mock 没有生效

确保在测试开始前正确设置 mock：

```typescript
beforeEach(() => {
  vi.clearAllMocks();
  // 重新设置 mock
});
```

### 测试泄漏

确保正确清理资源：

```typescript
afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});
```

## 更多资源

- [Vitest 官方文档](https://vitest.dev/)
- [Vitest API 参考](https://vitest.dev/api/)
- [测试最佳实践](https://github.com/goldbergyoni/javascript-testing-best-practices)
