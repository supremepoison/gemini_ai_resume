# ResumeCloner

ResumeCloner 是一个面向求职场景的简历复刻与编辑工作台。它可以将已有简历图片或 PDF 转换为可编辑草稿，帮助用户在保留版式风格的同时，快速完成内容更新、模板切换与多格式导出。

## 产品概览

- 面向需要快速复用旧简历版式的求职者、顾问与职业服务团队
- 解决“简历重做成本高、排版难复刻、导出格式不统一”的问题
- 提供从文件解析、内容编辑到 PDF / Word 导出的完整工作流

## 核心能力

- 文件复刻：上传图片或 PDF，自动提取文本内容并识别版式结构
- 模板起稿：支持从内置模板开始，快速搭建一份可编辑简历
- 草稿导入：支持导入 JSON 草稿，便于版本管理和多人协作
- 实时预览：编辑与预览同屏联动，所见即所得
- 多格式导出：支持导出 PDF 与 Word，适配投递和存档场景

## 典型使用流程

1. 上传现有简历截图或 PDF。
2. 系统生成结构化草稿并匹配合适模板。
3. 在编辑器中补充经历、技能、摘要和样式参数。
4. 导出为 PDF 或 Word，用于正式投递。

## 技术栈

- React 19
- TypeScript
- Vite
- Tailwind CSS（CDN 方式）
- `html2canvas` + `jsPDF` 用于 PDF 导出
- `docx` 用于 Word 导出

## 项目结构

```text
.
├── App.tsx                         # 应用主入口与页面状态流转
├── components/
│   ├── ResumeEditor.tsx            # 简历表单编辑区
│   └── ResumePreview.tsx           # 简历预览区
├── services/
│   └── resumeAnalysisService.ts    # 简历解析与模型调用适配层
├── utils/
│   └── docxGenerator.ts            # Word 导出逻辑
├── types.ts                        # 数据结构与模板定义
├── vite.config.ts                  # 本地开发与环境变量注入
└── index.html                      # 页面入口
```

## 本地开发

### 环境要求

- Node.js 18+
- npm 9+
- 可用的大模型 API Key

### 安装依赖

```bash
npm install
```

### 环境变量

先复制示例配置：

```bash
cp .env.example .env.local
```

然后在 `.env.local` 中配置模型密钥：

```env
MODEL_API_KEY=your_model_api_key_here
```

兼容说明：

- 项目优先读取 `MODEL_API_KEY`
- 若未设置，会自动回退读取旧配置 `GEMINI_API_KEY`

### 启动开发环境

```bash
npm run dev
```

默认访问地址：

```text
http://localhost:3000
```

### 生产构建

```bash
npm run build
npm run preview
```

## 数据与导出

- JSON 草稿可用于保存编辑进度或跨环境迁移
- PDF 适合直接投递与分享
- Word 适合进一步人工微调与交付

## 当前状态

当前版本已经具备从解析、编辑到导出的完整闭环，适合作为简历重构工具的 MVP。后续可继续增强：

- 更稳定的复杂版式识别
- 多页简历适配
- 模板体系扩展
- 更精细的导出保真度控制
