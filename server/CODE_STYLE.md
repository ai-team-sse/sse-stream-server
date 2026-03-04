# 代码风格指南

本项目使用统一的代码风格配置，确保代码库的一致性和可维护性。

## 核心配置

### 缩进规则
- **TypeScript/JavaScript**: 4 个空格
- **JSON**: 2 个空格
- **YAML**: 2 个空格

### 格式化工具

项目使用 [Prettier](https://prettier.io/) 作为代码格式化工具，结合 [ESLint](https://eslint.org/) 进行代码质量检查。

## 配置文件

### Prettier 配置 (`.prettierrc.json`)

```json
{
    "semi": true,                    // 使用分号
    "trailingComma": "es5",         // ES5 尾随逗号
    "singleQuote": true,            // 使用单引号
    "printWidth": 100,              // 行宽 100 字符
    "tabWidth": 4,                  // 4 个空格缩进
    "useTabs": false,               // 使用空格而非 Tab
    "arrowParens": "always",        // 箭头函数参数总是加括号
    "bracketSpacing": true,         // 对象字面量括号间加空格
    "endOfLine": "lf"               // 使用 LF 换行符
}
```

### EditorConfig 配置 (`.editorconfig`)

```ini
[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true
indent_style = space
indent_size = 4

[*.{json,yml,yaml}]
indent_size = 2
```

### ESLint 配置 (`.eslintrc.json`)

集成 Prettier 规则，自动修复格式问题。

## 格式化命令

### 手动格式化

```bash
# 格式化所有文件
npm run format

# 检查格式（不修改文件）
npm run format:check

# ESLint 自动修复
npm run lint:fix
```

### 自动格式化

#### VSCode 配置

项目已配置 VSCode 设置 (`.vscode/settings.json`)，实现保存时自动格式化：

```json
{
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.tabSize": 4,
    "editor.codeActionsOnSave": {
        "source.fixAll.eslint": "explicit"
    }
}
```

**推荐安装的 VSCode 扩展**：
- [Prettier - Code formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode)
- [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
- [EditorConfig for VS Code](https://marketplace.visualstudio.com/items?itemName=EditorConfig.EditorConfig)
- [Vitest](https://marketplace.visualstudio.com/items?itemName=vitest.explorer)

## 代码风格规则

### TypeScript/JavaScript

#### 引号
使用单引号而非双引号：
```typescript
// ✅ 正确
const message = 'Hello, World!';

// ❌ 错误
const message = "Hello, World!";
```

#### 分号
始终使用分号：
```typescript
// ✅ 正确
const x = 1;
const y = 2;

// ❌ 错误
const x = 1
const y = 2
```

#### 缩进
使用 4 个空格缩进：
```typescript
// ✅ 正确
function example() {
    if (true) {
        console.log('4 spaces');
    }
}

// ❌ 错误（2 个空格）
function example() {
  if (true) {
    console.log('2 spaces');
  }
}
```

#### 箭头函数参数
始终为箭头函数参数添加括号：
```typescript
// ✅ 正确
const increment = (x) => x + 1;

// ❌ 错误
const increment = x => x + 1;
```

#### 尾随逗号
在多行数组/对象中使用 ES5 风格的尾随逗号：
```typescript
// ✅ 正确
const obj = {
    foo: 'bar',
    baz: 'qux',
};

// ❌ 错误
const obj = {
    foo: 'bar',
    baz: 'qux'
};
```

#### 行宽
最大行宽 100 字符，超过时自动换行：
```typescript
// ✅ 正确（自动换行）
const longString =
    'This is a very long string that exceeds 100 characters and will be wrapped';

// ❌ 错误（超过 100 字符）
const longString = 'This is a very long string that exceeds 100 characters but is not wrapped';
```

### 命名规范

#### 变量和函数
使用 camelCase：
```typescript
const userName = 'John';
function getUserData() {}
```

#### 类和接口
使用 PascalCase：
```typescript
class UserService {}
interface UserData {}
```

#### 常量
使用 UPPER_SNAKE_CASE：
```typescript
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

#### 私有成员
使用下划线前缀（可选）：
```typescript
class Example {
    private _privateMethod() {}
}
```

### TypeScript 特定规则

#### 类型注解
对于函数参数和返回值，建议添加类型注解：
```typescript
// ✅ 推荐
function add(a: number, b: number): number {
    return a + b;
}

// ⚠️ 可以（推断类型）
function add(a: number, b: number) {
    return a + b;
}
```

#### 接口 vs 类型别名
优先使用 interface：
```typescript
// ✅ 推荐
interface User {
    id: string;
    name: string;
}

// ⚠️ 可以
type User = {
    id: string;
    name: string;
};
```

#### 未使用的变量
使用下划线前缀标记未使用的参数：
```typescript
// ✅ 正确
app.get('/api/data', (_req, res) => {
    res.json({ data: [] });
});
```

## Git Hooks（可选）

可以配置 Git Hooks 在提交前自动格式化代码：

```bash
# 安装 husky 和 lint-staged
npm install -D husky lint-staged

# 初始化 husky
npx husky install

# 添加 pre-commit hook
npx husky add .husky/pre-commit "npx lint-staged"
```

在 `package.json` 中添加配置：
```json
{
  "lint-staged": {
    "*.{ts,js}": [
      "prettier --write",
      "eslint --fix"
    ],
    "*.{json,md}": [
      "prettier --write"
    ]
  }
}
```

## 常见问题

### 为什么选择 4 个空格？
- 提供更好的代码可读性
- 在深层嵌套时更容易区分层级
- 符合 TypeScript 官方推荐

### 如何在不同编辑器中使用？
项目包含 `.editorconfig` 文件，大多数现代编辑器都支持自动读取该配置。

### 格式化冲突怎么办？
1. 确保安装了所有必需的扩展
2. 重启编辑器
3. 手动运行 `npm run format` 修复所有文件
4. 检查 `.prettierrc.json` 和 `.eslintrc.json` 配置是否正确

### CI/CD 中如何检查格式？
在 CI 管道中添加格式检查步骤：
```yaml
- name: Check code format
  run: npm run format:check

- name: Lint code
  run: npm run lint
```

## 总结

- ✅ 保存时自动格式化
- ✅ 统一的 4 空格缩进
- ✅ 配合 ESLint 自动修复问题
- ✅ 支持多种编辑器
- ✅ CI/CD 友好

遵循这些规则可以确保代码库的一致性和团队协作的顺畅。
