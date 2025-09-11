# URL Layout Manager

一个基于 Next.js 14 的 AI 服务聚合管理工具，允许用户在不同的布局视图中访问和管理多个 AI 服务的网页界面。

## 🚀 功能特性

- **多布局支持**: 单窗口、双窗口、三窗口、四窗口布局模式
- **AI 服务集成**: 支持 ChatGPT、Claude、Kimi、通义千问、文心一言等多个 AI 服务
- **响应式设计**: 适配移动端和桌面端
- **主题系统**: 支持暗模式切换
- **桌面应用**: 基于 Electron 的跨平台桌面应用

## 🛠️ 技术栈

- **前端框架**: Next.js 14 (App Router) + 静态导出
- **桌面应用**: Electron 38+
- **样式**: Tailwind CSS v4 + shadcn/ui 组件库
- **状态管理**: React hooks
- **图标**: Lucide React
- **字体**: Geist font family
- **主题**: Next Themes
- **打包**: electron-builder

## 📦 安装和运行

### Web 开发

```bash
# 安装依赖
npm install

# 开发服务器
npm run dev

# 构建项目
npm run build

# 生产环境启动
npm start

# 代码检查
npm run lint
```

### Electron 桌面应用

```bash
# Electron 开发模式（自动启动 Next.js 开发服务器和 Electron）
npm run electron-dev

# 仅启动 Electron（需要先手动启动开发服务器）
npm run electron-dev-simple

# 构建并运行 Electron 应用（生产模式）
npm run build-electron

# 打包桌面应用
npm run dist              # 当前平台
npm run dist-mac          # macOS
npm run dist-win          # Windows  
npm run dist-linux        # Linux
```

## 📁 项目结构

```
├── app/                    # Next.js App Router
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx           # 主页面
├── components/            # React 组件
│   ├── ui/               # shadcn/ui 组件
│   └── theme-provider.tsx # 主题提供者
├── hooks/                 # 自定义 Hooks
│   ├── use-mobile.ts     # 移动端检测
│   ├── use-toast.ts      # Toast 通知
│   └── use-electron.ts   # Electron 环境检测
├── lib/                   # 工具函数
│   └── utils.ts          # 工具函数
├── electron/              # Electron 相关文件
│   ├── main.js           # 主进程
│   └── preload.js        # 预加载脚本
└── public/                # 静态资源
```

## 🎯 核心功能

### 布局管理系统
- 支持 4 种布局模式：单窗口、双窗口、三窗口、四窗口
- 动态 iframe 容器管理
- 响应式布局适配

### AI 服务集成
- 服务配置包含：id、名称、URL、图标、颜色、描述
- 支持多个主流 AI 服务
- iframe 嵌入管理

## 📝 开发指南

### 添加新的 AI 服务
1. 在 `app/page.tsx` 的 `aiServices` 数组中添加服务配置
2. 确保服务 URL 支持 iframe 嵌入
3. 选择合适的 Lucide 图标和颜色主题

### 修改布局样式
- 全局样式在 `app/globals.css`
- 组件样式使用 Tailwind CSS 类
- 主题变量定义在 CSS 变量中

### 添加新的 UI 组件
- 使用 shadcn/ui CLI 添加：`npx shadcn@latest add [component-name]`
- 组件会自动安装到 `components/ui/` 目录

## ⚠️ 注意事项

- iframe 内容受到同源策略限制，某些网站可能无法正常嵌入
- 开发时注意处理 iframe 加载错误和网络超时
- 某些 AI 服务网站可能阻止在 Electron 中加载
- 需要为 Electron 应用添加图标文件：`public/icon.png`

## 🔧 配置说明

### Next.js 配置
- 禁用 ESLint 构建检查
- 禁用 TypeScript 构建错误
- 图片优化设置为 unoptimized

### TypeScript 配置
- 严格模式启用
- 路径映射：`@/*` -> `./*`
- 包含 Next.js 插件

## 📄 许可证

MIT License