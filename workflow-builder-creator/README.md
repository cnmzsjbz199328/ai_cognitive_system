# Workflow Builder Creator

一个现代化的前端可视化工作流构建器，支持节点拖拽、连接、动画流动、主题切换与自适应布局。

## 技术栈

- 原生 JavaScript (ES6+)
- SVG 可视化
- CSS3 主题与响应式
- 无依赖，开箱即用

## 目录结构

```
workflow-builder-creator/
├── src/
│   ├── css/           # 样式文件
│   ├── data/          # 示例数据
│   ├── js/            # 主功能代码
│   └── ...            
├── index.html         # 入口页面
├── README.md
└── ...
```

## 快速开始

1. **克隆项目**
   ```bash
   git clone <your-repo-url>
   cd workflow-builder-creator
   ```

2. **本地开发**
   - 直接用 VSCode Live Server 或 `python -m http.server` 启动本地服务
   - 访问 `http://localhost:8000` 或 `http://127.0.0.1:5500/index.html`

3. **构建与部署**
   - 本项目为纯前端静态项目，`src/` 目录无需编译，直接部署即可。
   - 推荐将整个项目目录部署到静态服务器（如 GitHub Pages、Vercel、Netlify）。

## 主要功能

- 节点拖拽、框选、多选、删除
- 节点连接、连接动画、粒子流动
- 支持批量导入/导出 JSON
- 节点 label 自动换行与字号自适应
- 主题切换（暗色、有网格亮色、无网格亮色）
- 支持 PNG 导出
- 高性能按需渲染，低资源消耗

## 主题与自适应

- 支持三种主题：暗色、有网格亮色、无网格亮色
- 节点 label 支持中英文自动换行与字号自适应，保证美观与可读性

## 贡献指南

1. Fork 本仓库并新建分支
2. 保持高内聚、低耦合，遵循现代 JS 语法
3. 提交 PR 前请确保无 ESLint 错误
4. 推荐使用 Jest/Supertest 进行单元测试

## CI/CD

本项目推荐使用 GitHub Actions 实现自动化测试与部署。

### 自动部署到 GitHub Pages

1. 在项目根目录下创建 `.github/workflows/deploy.yml`，内容如下：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy static site to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./
          publish_branch: gh-pages
```

2. 在 GitHub 仓库设置中，启用 GitHub Pages，选择 `gh-pages` 分支作为发布源。

### 为什么要单独选择 `gh-pages` 分支？

- `gh-pages` 分支专门用于存放构建后的静态资源（如 HTML、CSS、JS），与主分支（源代码、开发文件）分离。
- 这样可以保证主分支只包含开发相关内容，`gh-pages` 只包含最终部署内容，互不干扰。
- GitHub Pages 服务会自动将 `gh-pages` 分支的内容作为网站根目录进行发布。
- 便于持续集成自动化部署，安全且高效。

---

如需进一步自定义 CI/CD 流程或遇到具体问题，欢迎随时提问！

## 🏁 Strategic Alignment

### How does this fit into the broader strategy?

基于AI认知系统项目的成功经验，我们计划构建一个通用的在线工作流图表创建工具，以提升团队协作效率和流程可视化能力。这将帮助用户更好地理解和优化复杂的业务流程。

## 💭 Problem Definition

### What problem or job are we going after?

作为需要创建和管理复杂工作流的专业用户：

* 当我需要设计一个新的业务流程时
* 我希望能够通过直观的拖拽操作快速创建流程图
* 这样我就能专注于流程逻辑而不是工具使用

**Who faces this problem, and how important is it to them?**

目标用户包括产品经理、业务分析师、系统架构师和项目经理，他们需要频繁创建和分享流程图来沟通复杂的业务逻辑。

## 📝 Solution Definition

### Core Features

1. **智能节点创建**：拖拽添加不同类型的工作流节点
2. **动态连接系统**：通过拖拽建立节点间的连接关系
3. **实时编辑**：修改节点属性、连接样式等
4. **数据持久化**：保存工作流为文件，支持导入导出
5. **流程动画**：可视化展示数据流向和执行过程

### Technical Architecture

- **前端**: 现代JavaScript (ES6+), SVG, CSS3
- **架构**: 模块化ES6架构，事件驱动设计
- **状态管理**: 集中式状态管理系统
- **渲染**: SVG分层渲染引擎

## 📊 Current Status

- ✅ **Phase 1**: 项目架构搭建 (已完成)
- 🔄 **Phase 4**: 交互体验增强 (进行中)
- ⚪ **Phase 5**: 编辑界面开发 (下一步)

**代码量**: 约2860行核心代码  
**完成度**: 15-20%

## 🎯 Success Metrics

- 用户能在5分钟内创建基本工作流
- 支持50+节点的复杂流程图
- 流畅的60fps动画性能
- 跨设备响应式体验

## 🚀 Quick Start

```bash
# 打开项目
open index.html

# 或使用本地服务器
python -m http.server 8000
```

### Project Structure
```
workflow-builder-creator/
├── index.html              # 主页面
├── src/                    # 源代码
│   ├── js/                 # JavaScript模块
│   │   ├── main.js         # 主入口
│   │   ├── config.js       # 配置管理
│   │   ├── state.js        # 状态管理
│   │   ├── renderer.js     # 渲染引擎
│   │   └── interactions/   # 交互管理
│   ├── css/                # 样式文件
│   └── data/               # 数据文件
└── docs/                   # 文档
```

---

**项目启动**: 2024年  
**预计完成**: 8-12周  
**Jira项目**: [workflow-builder-creator (PRIOR)](https://group-ict.atlassian.net/jira/software/projects/PRIOR) 