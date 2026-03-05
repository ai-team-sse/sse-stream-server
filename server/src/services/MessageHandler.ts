/**
 * 消息处理器
 * 根据用户输入生成 Markdown 格式的回复
 */

export interface MessageResponse {
    content: string; // Markdown 格式的内容
    type: 'markdown';
}

export class MessageHandler {
    /**
     * 处理用户消息，返回 Markdown 格式的回复
     */
    static process(userMessage: string): MessageResponse {
        const msg = userMessage.toLowerCase().trim();

        // 场景匹配
        if (this.isGreeting(msg)) {
            return this.handleGreeting();
        }

        if (this.isTimeQuery(msg)) {
            return this.handleTimeQuery();
        }

        if (this.isListRequest(msg)) {
            return this.handleList();
        }

        if (this.isCodeRequest(msg)) {
            return this.handleCode(msg);
        }

        if (this.isTableRequest(msg)) {
            return this.handleTable();
        }

        if (this.isImageRequest(msg)) {
            return this.handleImage(msg);
        }

        if (this.isHelpRequest(msg)) {
            return this.handleHelp();
        }

        // 默认回复
        return this.handleDefault(userMessage);
    }

    // ============ 场景识别 ============

    private static isGreeting(msg: string): boolean {
        return /你好|hello|hi|嗨/.test(msg);
    }

    private static isTimeQuery(msg: string): boolean {
        return /时间|几点|日期/.test(msg);
    }

    private static isListRequest(msg: string): boolean {
        return /列表|list|清单|推荐/.test(msg);
    }

    private static isCodeRequest(msg: string): boolean {
        return /代码|code|示例|example/.test(msg);
    }

    private static isTableRequest(msg: string): boolean {
        return /表格|table|对比|比较/.test(msg);
    }

    private static isImageRequest(msg: string): boolean {
        return /图片|image|图|照片|风景|城市|科技|动物|美食/.test(msg);
    }

    private static isHelpRequest(msg: string): boolean {
        return /帮助|help|\?|功能/.test(msg);
    }

    // ============ 场景处理 ============

    private static handleGreeting(): MessageResponse {
        const greetings = [
            '你好！👋 很高兴见到你！',
            'Hello! 😊 有什么我可以帮助你的吗？',
            '嗨！欢迎来到这里！✨',
        ];
        return {
            content: greetings[Math.floor(Math.random() * greetings.length)],
            type: 'markdown',
        };
    }

    private static handleTimeQuery(): MessageResponse {
        const now = new Date();
        const dateStr = now.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long',
        });
        const timeStr = now.toLocaleTimeString('zh-CN', { hour12: false });

        return {
            content: `## ⏰ 当前时间\n\n**日期**: ${dateStr}  \n**时间**: ${timeStr}`,
            type: 'markdown',
        };
    }

    private static handleList(): MessageResponse {
        return {
            content: `## 📋 推荐列表

以下是我为你推荐的内容：

1. **学习 TypeScript**
   - 静态类型检查
   - 更好的 IDE 支持
   - 提高代码质量

2. **使用 SSE 实时通信**
   - 服务器推送
   - 自动重连
   - 简单易用

3. **Markdown 格式化**
   - 支持多种样式
   - 易于阅读
   - 通用标准

---

_试试发送 "代码" 或 "表格" 查看更多示例！_`,
            type: 'markdown',
        };
    }

    private static handleCode(msg: string): MessageResponse {
        // 根据关键词返回不同语言的代码示例
        if (/python|py/.test(msg)) {
            return {
                content: `## 🐍 Python 示例

\`\`\`python
def fibonacci(n):
    """计算斐波那契数列"""
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)

# 输出前10个数
for i in range(10):
    print(f"F({i}) = {fibonacci(i)}")
\`\`\`

这是一个经典的递归实现！`,
                type: 'markdown',
            };
        }

        if (/javascript|js|ts/.test(msg)) {
            return {
                content: `## 💛 JavaScript 示例

\`\`\`javascript
// 异步获取数据
async function fetchData(url) {
    try {
        const response = await fetch(url);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('获取失败:', error);
    }
}

// 使用
fetchData('/api/data').then(data => {
    console.log('数据:', data);
});
\`\`\`

现代 JavaScript 的异步处理！`,
                type: 'markdown',
            };
        }

        // 默认返回 TypeScript 示例
        return {
            content: `## 💙 TypeScript 示例

\`\`\`typescript
interface User {
    id: number;
    name: string;
    email: string;
}

class UserService {
    private users: User[] = [];

    addUser(user: User): void {
        this.users.push(user);
    }

    findById(id: number): User | undefined {
        return this.users.find(u => u.id === id);
    }
}

// 使用
const service = new UserService();
service.addUser({ id: 1, name: 'Tom', email: 'tom@example.com' });
\`\`\`

类型安全的代码更可靠！`,
            type: 'markdown',
        };
    }

    private static handleTable(): MessageResponse {
        return {
            content: `## 📊 技术对比表格

| 技术 | 优势 | 适用场景 | 难度 |
|------|------|----------|------|
| **SSE** | 简单易用 | 服务器推送 | ⭐⭐ |
| **WebSocket** | 双向通信 | 实时聊天 | ⭐⭐⭐ |
| **HTTP/2** | 多路复用 | Web 应用 | ⭐⭐⭐⭐ |
| **gRPC** | 高性能 | 微服务 | ⭐⭐⭐⭐⭐ |

---

**推荐**: 对于单向推送，SSE 是最简单的选择！`,
            type: 'markdown',
        };
    }

    private static handleImage(msg?: string): MessageResponse {
        // 根据关键词选择主题
        const themes = [
            {
                title: '自然风光',
                keywords: ['自然', '风景', '山'],
                images: [
                    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=500&fit=crop',
                ],
                desc: '壮丽的山川美景，感受大自然的魅力',
            },
            {
                title: '城市建筑',
                keywords: ['城市', '建筑', '都市'],
                images: [
                    'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=500&fit=crop',
                ],
                desc: '现代都市的繁华，建筑的艺术',
            },
            {
                title: '科技未来',
                keywords: ['科技', '技术', 'tech'],
                images: [
                    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&h=500&fit=crop',
                ],
                desc: '科技改变生活，探索未来世界',
            },
            {
                title: '动物世界',
                keywords: ['动物', 'animal', '猫', '狗'],
                images: [
                    'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1484406566174-9da000fda645?w=800&h=500&fit=crop',
                ],
                desc: '可爱的动物们，生命的多样性',
            },
            {
                title: '美食天地',
                keywords: ['美食', 'food', '食物'],
                images: [
                    'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop',
                    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=800&h=500&fit=crop',
                ],
                desc: '诱人的美食，味蕾的盛宴',
            },
        ];

        // 根据用户输入匹配主题
        let selectedTheme = themes[Math.floor(Math.random() * themes.length)];
        if (msg) {
            const matchedTheme = themes.find((theme) =>
                theme.keywords.some((keyword) => msg.includes(keyword))
            );
            if (matchedTheme) {
                selectedTheme = matchedTheme;
            }
        }

        const imageUrl =
            selectedTheme.images[Math.floor(Math.random() * selectedTheme.images.length)];

        return {
            content: `## 🖼️ ${selectedTheme.title}

![${selectedTheme.title}](${imageUrl})

_${selectedTheme.desc}_

---

**提示**: 试试发送 "风景"、"城市"、"科技"、"动物" 或 "美食" 看不同主题的图片！`,
            type: 'markdown',
        };
    }

    private static handleHelp(): MessageResponse {
        return {
            content: `## 🤖 帮助信息

我可以理解以下类型的消息：

### 基础功能
- 👋 **问候**: "你好"、"hello"
- ⏰ **时间**: "现在几点"、"日期"

### 内容展示
- 📋 **列表**: "推荐"、"列表"
- 💻 **代码**: "代码示例"、"JavaScript 代码"、"Python 代码"
- 📊 **表格**: "表格"、"对比"
- 🖼️ **图片**: "图片"、"风景"、"城市"、"科技"、"动物"、"美食"

### 其他
- ❓ **帮助**: "帮助"、"?"

---

_试试发送这些关键词，看看效果吧！_`,
            type: 'markdown',
        };
    }

    private static handleDefault(userMessage: string): MessageResponse {
        const responses = [
            `收到你的消息：\n\n> ${userMessage}\n\n有什么我可以帮助你的吗？试试发送 **"帮助"** 查看我能做什么！`,
            `**"${userMessage}"** - 这是个有趣的话题！🤔\n\n我还在学习中，试试发送 **"?"** 看看我现在能做什么吧！`,
            `关于 _"${userMessage}"_，让我想想...\n\n💡 **提示**: 发送 "代码"、"表格" 或 "列表" 试试不同的效果！`,
        ];

        return {
            content: responses[Math.floor(Math.random() * responses.length)],
            type: 'markdown',
        };
    }
}
