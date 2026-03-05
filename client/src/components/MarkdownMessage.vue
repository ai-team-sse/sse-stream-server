<template>
    <div class="markdown-content" v-html="renderedContent"></div>
</template>

<script setup>
import { computed } from 'vue';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import python from 'highlight.js/lib/languages/python';
import typescript from 'highlight.js/lib/languages/typescript';
import 'highlight.js/styles/github-dark.css';

// 注册语言
hljs.registerLanguage('javascript', javascript);
hljs.registerLanguage('python', python);
hljs.registerLanguage('typescript', typescript);

const props = defineProps({
    content: {
        type: String,
        required: true,
    },
});

// 配置 marked
marked.setOptions({
    highlight: function (code, lang) {
        if (lang && hljs.getLanguage(lang)) {
            try {
                return hljs.highlight(code, { language: lang }).value;
            } catch (err) {
                console.error('代码高亮失败:', err);
            }
        }
        return code;
    },
    breaks: true,
    gfm: true,
});

const renderedContent = computed(() => {
    try {
        return marked.parse(props.content);
    } catch (error) {
        console.error('Markdown 解析失败:', error);
        return props.content;
    }
});
</script>

<style scoped>
.markdown-content {
    line-height: 1.6;
    flex: 1;
}

/* 标题样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
    margin-top: 16px;
    margin-bottom: 8px;
    font-weight: 600;
}

.markdown-content :deep(h1) {
    font-size: 1.5em;
    border-bottom: 2px solid #e0e0e0;
    padding-bottom: 8px;
}

.markdown-content :deep(h2) {
    font-size: 1.3em;
    border-bottom: 1px solid #e0e0e0;
    padding-bottom: 6px;
}

.markdown-content :deep(h3) {
    font-size: 1.1em;
}

/* 段落 */
.markdown-content :deep(p) {
    margin: 8px 0;
}

/* 列表 */
.markdown-content :deep(ul),
.markdown-content :deep(ol) {
    margin: 8px 0;
    padding-left: 24px;
}

.markdown-content :deep(li) {
    margin: 4px 0;
}

/* 引用 */
.markdown-content :deep(blockquote) {
    margin: 12px 0;
    padding: 8px 16px;
    border-left: 4px solid #667eea;
    background: rgba(102, 126, 234, 0.05);
    color: #555;
}

/* 代码块 */
.markdown-content :deep(pre) {
    margin: 12px 0;
    padding: 12px;
    background: #282c34;
    border-radius: 8px;
    overflow-x: auto;
}

.markdown-content :deep(code) {
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.9em;
}

/* 行内代码 */
.markdown-content :deep(p code),
.markdown-content :deep(li code) {
    background: rgba(0, 0, 0, 0.05);
    padding: 2px 6px;
    border-radius: 4px;
    color: #d63384;
}

/* 表格 */
.markdown-content :deep(table) {
    margin: 12px 0;
    border-collapse: collapse;
    width: 100%;
    font-size: 0.9em;
}

.markdown-content :deep(th),
.markdown-content :deep(td) {
    border: 1px solid #e0e0e0;
    padding: 8px 12px;
    text-align: left;
}

.markdown-content :deep(th) {
    background: rgba(102, 126, 234, 0.1);
    font-weight: 600;
}

.markdown-content :deep(tr:nth-child(even)) {
    background: rgba(0, 0, 0, 0.02);
}

/* 图片 */
.markdown-content :deep(img) {
    max-width: 100%;
    height: auto;
    border-radius: 8px;
    margin: 8px 0;
}

/* 分隔线 */
.markdown-content :deep(hr) {
    margin: 16px 0;
    border: none;
    border-top: 2px solid #e0e0e0;
}

/* 链接 */
.markdown-content :deep(a) {
    color: #667eea;
    text-decoration: none;
}

.markdown-content :deep(a:hover) {
    text-decoration: underline;
}

/* 加粗和斜体 */
.markdown-content :deep(strong) {
    font-weight: 600;
    color: #333;
}

.markdown-content :deep(em) {
    font-style: italic;
}
</style>
