<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ResumeCloner AI

一个基于 Google Gemini AI 的简历克隆与生成工具。
A resume cloning and generation tool powered by Google Gemini AI.

## 本地运行指南 (Local Setup Guide)

### 前提条件 (Prerequisites)
- [Node.js](https://nodejs.org/) (建议版本 v18+)
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 快速开始 (Steps)

1. **安装依赖 (Install dependencies)**
   ```bash
   npm install
   ```

2. **配置环境变量 (Configure Environment Variables)**
   在项目根目录下找到 `.env.local` 文件，将您的 Gemini API Key 填入：
   ```env
   GEMINI_API_KEY=你的_API_KEY_在这里
   ```

3. **启动应用 (Run the app)**
   ```bash
   npm run dev
   ```
   启动后，在浏览器中访问 `http://localhost:3000`。

## 主要功能 (Features)
- **Clone from File**: 上传图片或 PDF 简历，AI 自动提取内容。
- **Start with Template**: 选择专业设计的模板开始编写。
- **Import Draft**: 支持导入 JSON 格式的简历草稿。

---
View your app in AI Studio: [https://ai.studio/apps/drive/1cxtWWkSWD_vDhWeXek329jkX8c5NgWv-](https://ai.studio/apps/drive/1cxtWWkSWD_vDhWeXek329jkX8c5NgWv-)
