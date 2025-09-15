# Gemini 代码助手上下文

## 1. 项目概述

这是一个使用 Electron 构建的桌面应用程序。用户界面是一个由 Next.js 和 React 驱动的 Web 应用。根据 `electron-builder` 的配置，项目名称为 “AI 服务管理器”。

## 2. 技术栈

- **核心框架**: Electron, Next.js (使用 App Router)
- **语言**: TypeScript
- **UI 框架**: React
- **UI 组件**: shadcn/ui
- **样式**: Tailwind CSS
- **图标**: lucide-react
- **应用打包**: electron-builder
- **发布自动化**: semantic-release

## 3. 关键命令

- **开发**: `npm run electron-dev`
  - 这是主要的开发命令。它会同时启动 Next.js 开发服务器和 Electron 应用程序。

- **构建前端**: `npm run build`
  - 为生产环境构建 Next.js 应用，并将其放置在 `out/` 目录中。该命令还会运行 `fix-electron-paths.js` 以确保其与 Electron 的兼容性。

- **打包应用**: `npm run dist`
  - 将应用程序打包以便分发（例如，为 macOS 创建 `.dmg` 文件或为 Windows 创建 `.exe` 文件），并输出到 `dist/` 目录。

- **代码检查**: `npm run lint`
  - 运行 Next.js 的 linter 来检查代码质量和潜在错误。

## 4. 项目结构

- `electron/`: 包含所有 Electron 的特定代码，包括主进程入口点 (`main.js`) 和预加载脚本。
- `app/`: Next.js 应用程序的源代码，使用 App Router 结构。
- `components/ui/`: 来自 shadcn/ui 库的可复用 UI 组件。
- `public/`: 存放图片、图标等静态资源。
- `out/`: `next build` 命令的输出目录。
- `dist/`: 由 `electron-builder` 生成的已打包应用的输出目录。