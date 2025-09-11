# 📦 项目发布指南

这份文档详细说明了如何使用自动化发布系统创建 GitHub Releases，包括构建产物上传和自动生成 changelog。

> ⚠️ **重要提醒**: 在使用自动化发布前，必须完成 [GitHub Token 配置](#github-token-配置必需步骤) 步骤，否则发布流程会失败！

## 🚀 快速开始

### 1. 提交代码触发发布

```bash
# 添加修改
git add .

# 使用规范的 commit message 提交
git commit -m "feat: 添加新功能描述"

# 推送到主分支
git push origin main
```

### 2. 查看发布结果

- 等待 GitHub Actions 完成（约 5-10 分钟）
- 访问项目的 [Releases 页面](https://github.com/your-username/your-repo/releases)
- 查看自动生成的 Release 和 Assets

## 📝 Commit Message 规范

使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 常用类型

| 类型 | 说明 | 版本影响 |
|------|------|----------|
| `feat:` | 新功能 | 次版本升级 (0.1.0 → 0.2.0) |
| `fix:` | 修复bug | 修订号升级 (0.1.0 → 0.1.1) |
| `docs:` | 文档更新 | 无版本升级 |
| `style:` | 代码格式 | 无版本升级 |
| `refactor:` | 代码重构 | 无版本升级 |
| `test:` | 测试相关 | 无版本升级 |
| `chore:` | 构建/工具 | 无版本升级 |

### 示例

```bash
feat: 添加暗黑模式支持
fix: 修复窗口大小调整问题
docs: 更新 README 安装说明
style: 优化代码格式化
refactor: 重构状态管理逻辑
test: 添加单元测试
chore: 更新依赖包版本
```

## 🔧 本地测试发布流程

在不实际发布的情况下测试整个流程：

```bash
# 1. 安装依赖
npm install

# 2. 构建应用
npm run build

# 3. 打包 Electron 应用
npm run dist

# 4. 模拟发布流程（不会真正发布）
npm run release:dry-run
```

## 📁 发布产物说明

### 构建产物位置
- **输出目录**: `dist/`
- **包含文件**: 各平台的安装包

### 支持的安装包格式

| 平台 | 文件格式 | 说明 |
|------|----------|------|
| macOS | `.dmg` | 磁盘映像文件 |
| Windows | `.exe` | NSIS 安装程序 |
| Linux | `.AppImage` | 便携应用格式 |
| Linux | `.deb` | Debian 安装包 |

## 🔑 GitHub Token 配置（必需步骤）

在首次使用自动化发布前，必须配置 GitHub Token，否则发布流程会失败。

### 1. 创建 Personal Access Token

1. **访问 GitHub Settings**
   - 点击右上角头像 → Settings
   - 或者直接访问：https://github.com/settings/tokens

2. **创建新 Token**
   - 点击 "Developer settings" → "Personal access tokens" → "Tokens (classic)"
   - 点击 "Generate new token" → "Generate new token (classic)"

3. **配置 Token 信息**
   - **Note**: `AI-Service-Manager-Release`（或其他描述性名称）
   - **Expiration**: 建议选择 "No expiration"（或 90 天）
   - **Select scopes**: 必须勾选以下权限：
     - ✅ `repo` (Full control of private repositories)
     - ✅ `workflow` (Update GitHub Action workflows)
     - ✅ `write:packages` (Upload packages to GitHub Package Registry)

4. **生成并保存 Token**
   - 点击 "Generate token"
   - **⚠️ 重要**: 立即复制生成的 token，页面关闭后无法再次查看

### 2. 配置仓库 Secrets

1. **进入仓库设置**
   - 打开你的项目仓库页面
   - 点击 "Settings" → "Secrets and variables" → "Actions"

2. **添加 Token Secret**
   - 点击 "New repository secret"
   - **Name**: `RELEASE_TOKEN` （⚠️ 注意：不能使用 `GITHUB_` 前缀）
   - **Value**: 粘贴刚才复制的 Personal Access Token
   - 点击 "Add secret"

3. **验证配置**
   - 确保 secret 名称正确显示为 `RELEASE_TOKEN`
   - 状态应为 "Added"

### 3. Token 安全注意事项

- **妥善保管**: 不要将 Token 分享给他人或提交到代码中
- **定期更新**: 如果设置了过期时间，记得在到期前更新
- **权限最小化**: 只授予必要的权限
- **监控使用**: 定期检查 Token 的使用情况

## ⚙️ 自动化配置详解

### GitHub Actions 工作流 (`.github/workflows/release.yml`)

- **触发条件**: 推送到 `main` 分支
- **构建环境**: Ubuntu, Windows, macOS
- **权限要求**: 需要 `RELEASE_TOKEN` secret 配置
- **主要步骤**:
  1. 代码检出
  2. Node.js 环境配置
  3. 依赖安装
  4. 应用构建
  5. Electron 打包
  6. 语义化发布（需要 Token 权限）

### 语义化发布配置 (`.releaserc.json`)

- **版本策略**: 基于 commit message 自动计算
- **Changelog**: 自动生成并提交到仓库
- **GitHub Release**: 自动创建并上传构建产物

## 🎯 手动发布（备用方案）

如果自动化失败，可以手动创建 Release：

### 1. 本地构建
```bash
npm run build
npm run dist
```

### 2. 创建 Git 标签
```bash
# 创建版本标签
git tag v0.2.0

# 推送标签到远程
git push origin v0.2.0
```

### 3. 手动创建 Release

1. 访问 GitHub 仓库的 [Releases](https://github.com/your-username/your-repo/releases) 页面
2. 点击 "Draft a new release"
3. 选择刚才推送的标签
4. 填写 Release 标题和描述
5. 上传 `dist/` 目录中的安装包文件
6. 点击 "Publish release"

## 🔍 常见问题排查

### 构建失败

1. **检查 Node.js 版本**
   ```bash
   node --version  # 建议使用 v18+
   ```

2. **清理并重新安装依赖**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **检查构建日志**
   - 查看 GitHub Actions 的详细日志
   - 本地运行 `npm run build` 测试

### 发布失败

1. **权限问题**
   - 确保 GitHub Token 有写入权限
   - 检查仓库的 Actions 设置

2. **版本冲突**
   - 手动删除冲突的 Git 标签
   - 重新触发发布流程

3. **文件上传失败**
   - 检查构建产物是否存在
   - 验证文件大小和格式

## 📊 发布流程图

```
代码提交 → GitHub Actions → 构建应用 → 打包安装包 → 语义化发布 → GitHub Release
   ↓           ↓             ↓           ↓            ↓            ↓
commit msg   触发工作流     next build  electron-   计算版本号    上传Assets
规范检查     开始构建       构建web     builder     生成changelog 创建release
```

## 🔗 相关链接

- [GitHub Actions 文档](https://docs.github.com/en/actions)
- [Semantic Release 文档](https://semantic-release.gitbook.io/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Electron Builder 文档](https://www.electron.build/)

## 💡 最佳实践

1. **保持 commit message 规范**: 这是自动版本管理的基础
2. **经常提交**: 小步快跑，避免大量代码堆积
3. **测试构建**: 本地先测试通过再推送
4. **关注通知**: GitHub Actions 失败时会发送邮件通知
5. **备份重要版本**: 关键版本可以手动备份构建产物

---

**记住**: 每次推送到 `main` 分支都会触发自动发布流程，确保你的 commit message 符合规范！