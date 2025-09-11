# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 14 的 AI 服务聚合管理工具（URL Layout Manager），允许用户在不同的布局视图中访问和管理多个 AI 服务的网页界面。

## 常用开发命令

### Web 开发
```bash
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

## 项目架构

### 技术栈
- **前端框架**: Next.js 14 (App Router) + 静态导出
- **桌面应用**: Electron 38+ (跨平台桌面应用)
- **样式**: Tailwind CSS v4 + shadcn/ui 组件库
- **状态管理**: React hooks (useState)
- **图标**: Lucide React
- **字体**: Geist font family
- **表单处理**: React Hook Form + Zod 验证
- **主题**: Next Themes (支持暗模式)
- **打包**: electron-builder (跨平台打包)

### 目录结构

- **`app/`**: Next.js App Router 目录
  - `globals.css` - 全局样式和 Tailwind CSS 配置
  - `layout.tsx` - 根布局组件
  - `page.tsx` - 主页面组件（AI服务管理界面）

- **`components/`**: React 组件
  - `ui/` - shadcn/ui 组件库（50+ 组件）
  - `theme-provider.tsx` - 主题提供者

- **`hooks/`**: 自定义 React Hooks
  - `use-mobile.ts` - 移动端检测
  - `use-toast.ts` - Toast 通知系统
  - `use-electron.ts` - Electron 环境检测和 API

- **`lib/`**: 工具函数
  - `utils.ts` - 工具函数（cn 类名合并等）

- **`electron/`**: Electron 桌面应用相关文件
  - `main.js` - Electron 主进程
  - `preload.js` - 预加载脚本（安全的主进程 API 暴露）

### 核心功能架构

#### 1. 布局管理系统
- 支持 4 种布局模式：单窗口、双窗口、三窗口、四窗口
- 动态 iframe 容器管理
- 响应式布局适配

#### 2. AI 服务集成
主页面定义了多个 AI 服务配置：
- 服务配置包含：id、名称、URL、图标、颜色、描述
- 支持的服务：ChatGPT、Claude、Kimi、通义千问、文心一言等

#### 3. 状态管理结构
```typescript
// 主要状态类型
type LayoutType = "single" | "double" | "triple" | "quad"

// 状态管理
- layout: 当前布局模式
- activeServices: 激活的服务列表
- windowServices: 窗口与服务的映射关系
- serviceZoom: 各服务的缩放级别
- iframeErrors: iframe 加载错误状态
```

## 配置文件说明

### Next.js 配置 (`next.config.mjs`)
- 禁用 ESLint 构建检查
- 禁用 TypeScript 构建错误
- 图片优化设置为 unoptimized

### shadcn/ui 配置 (`components.json`)
- 使用 "new-york" 风格
- 启用 RSC 和 TSX
- 路径别名配置（@/ 指向根目录）

### TypeScript 配置
- 严格模式启用
- 路径映射：`@/*` -> `./*`
- 包含 Next.js 插件

## 开发指南

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

### 状态管理最佳实践
- 使用 React hooks 进行本地状态管理
- 复杂状态逻辑考虑抽取为自定义 hooks
- iframe 交互需要处理跨域限制

## 项目特点

1. **模块化设计**: 严格的目录结构和组件分离
2. **类型安全**: 完整的 TypeScript 支持
3. **响应式设计**: 支持移动端和桌面端
4. **主题系统**: 内置暗模式支持
5. **组件库**: 基于 shadcn/ui 的现代化 UI 组件

## Electron 桌面应用特性

1. **跨平台支持**: 支持 Windows、macOS、Linux
2. **原生体验**: 
   - 自定义菜单栏和快捷键
   - 窗口控制（最小化、最大化、关闭）
   - 系统级集成
3. **安全模式**: 
   - 禁用 Node.js 集成
   - 启用上下文隔离
   - 安全的预加载脚本
4. **自动更新**: 集成 electron-updater（生产环境）

## 开发指南

### Electron 开发流程
1. **开发调试**: 使用 `npm run electron-dev` 进行开发
2. **构建测试**: 使用 `npm run build-electron` 测试生产版本
3. **打包分发**: 使用 `npm run dist-[platform]` 打包对应平台

### Electron 环境适配
- 使用 `useElectron` hook 检测运行环境
- Electron 环境下禁用了 webSecurity 以支持外部 iframe
- 预加载脚本提供安全的主进程 API 访问

## 注意事项

### 通用注意事项
- iframe 内容受到同源策略限制，某些网站可能无法正常嵌入
- 开发时注意处理 iframe 加载错误和网络超时
- Tailwind CSS v4 配置位于 PostCSS 插件中
- 项目禁用了构建时的 lint 和类型检查，部署前需要手动验证

### Electron 特定注意事项
- 某些 AI 服务网站可能阻止在 Electron 中加载（如 ChatGPT）
- 需要为应用添加图标文件：`public/icon.png`
- 打包前确保所有依赖都已正确安装
- Windows 打包需要在 Windows 环境或配置交叉编译