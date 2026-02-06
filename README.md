# GLM-OCR Studio

GLM-OCR Studio 是一个基于 [Next.js](https://nextjs.org) 构建的现代化 Web 应用，旨在为 [智谱 AI GLM-OCR](https://open.bigmodel.cn/dev/api#glm-ocr) 模型提供优雅、高效的可视化操作界面。通过它，您可以轻松上传 PDF 或图片文件，进行高精度的文档布局分析与内容提取，并实时预览解析结果。

## ✨ 核心特性

- **📄 多格式支持**: 支持 PDF、JPG、PNG 等常见文档和图片格式上传。
- **👀 实时预览**: 内置强大的文件预览器，支持图片缩放、旋转及 PDF 在线预览。
- **📝 Markdown 渲染**: 解析结果以 Markdown 格式呈现，支持富文本渲染与源码模式切换。
- **🗂️ 任务管理**: 完整的历史记录管理，支持文件名搜索、状态筛选、分页浏览及记录删除。
- **⚙️ 灵活配置**: 支持在界面动态配置 API Key，或通过环境变量设置默认 Key，保障密钥安全。
- **🌙 深色模式**: 完美适配日间/夜间模式，提供舒适的使用体验。
- **⚡ 响应式设计**: 基于 Tailwind CSS 和 Shadcn UI 构建，美观且易用。

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **组件库**: shadcn/ui, Lucide React
- **数据库**: SQLite + Prisma ORM
- **动画**: Framer Motion

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone git@github.com:hello-lx-83/GLM-OCR-Studio.git
cd GLM-OCR-Studio
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
# 或
pnpm install
```

### 3. 配置环境

复制环境变量示例文件：

```bash
cp .env.example .env
```

(可选) 在 `.env` 中填入你的智谱 API Key，或者稍后在网页设置中配置：

```env
GLM_OCR_API_KEY="your_api_key_here"
```

### 4. 数据库迁移

初始化本地 SQLite 数据库：

```bash
npx prisma migrate dev --name init
```

### 5. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000) 即可开始使用。

## 🔒 安全说明

- **API Key 存储**: 在网页端配置的 API Key 仅保存在浏览器 `localStorage` 中，不会发送到除智谱 API 以外的任何服务器。
- **文件隐私**: 上传的文件仅存储在本地服务器用于处理，删除历史记录时会同步物理删除文件。

## 🤝 贡献

欢迎提交 Issue 或 Pull Request 来改进本项目！

## 📄 许可证

MIT License
