# SSE Stream Client (前端)

前端项目目录，用于连接 SSE Stream Server。

## 说明

这是前端项目的预留目录。您可以使用任何前端框架来实现客户端：

- React
- Vue
- Angular
- 原生 HTML/JavaScript

## SSE 客户端示例代码

### 原生 JavaScript

```javascript
// 连接 SSE 服务器
const eventSource = new EventSource('http://localhost:3000/api/sse/stream');

// 监听消息
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('收到消息:', data);
};

// 监听连接打开
eventSource.onopen = () => {
  console.log('SSE 连接已建立');
};

// 监听错误
eventSource.onerror = (error) => {
  console.error('SSE 连接错误:', error);
};

// 关闭连接
// eventSource.close();
```

### React 示例

```jsx
import { useEffect, useState } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3000/api/sse/stream');

    eventSource.onopen = () => {
      setConnected(true);
      console.log('已连接到 SSE 服务器');
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setMessages(prev => [...prev, data]);
    };

    eventSource.onerror = () => {
      setConnected(false);
      console.error('SSE 连接错误');
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div>
      <h1>SSE Stream Client</h1>
      <p>连接状态: {connected ? '已连接' : '未连接'}</p>
      <div>
        <h2>消息列表</h2>
        {messages.map((msg, index) => (
          <div key={index}>
            {JSON.stringify(msg)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
```

### Vue 3 示例

```vue
<template>
  <div>
    <h1>SSE Stream Client</h1>
    <p>连接状态: {{ connected ? '已连接' : '未连接' }}</p>
    <div>
      <h2>消息列表</h2>
      <div v-for="(msg, index) in messages" :key="index">
        {{ msg }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const messages = ref([]);
const connected = ref(false);
let eventSource = null;

onMounted(() => {
  eventSource = new EventSource('http://localhost:3000/api/sse/stream');

  eventSource.onopen = () => {
    connected.value = true;
    console.log('已连接到 SSE 服务器');
  };

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    messages.value.push(data);
  };

  eventSource.onerror = () => {
    connected.value = false;
    console.error('SSE 连接错误');
  };
});

onUnmounted(() => {
  if (eventSource) {
    eventSource.close();
  }
});
</script>
```

## 发送消息到服务器

```javascript
// 广播消息
async function broadcast(message) {
  await fetch('http://localhost:3000/api/sse/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });
}

// 使用
broadcast('Hello, everyone!');
```

## 快速开始

根据您选择的前端框架，在此目录下初始化项目：

### React
```bash
npm create vite@latest . -- --template react-ts
```

### Vue
```bash
npm create vite@latest . -- --template vue-ts
```

### 原生 HTML
在 `src` 目录下创建 `index.html` 并使用上面的示例代码。
