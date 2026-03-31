# 项目说明文档（AI Copilot 提示词）

> 本文档供 AI 编程助手快速理解项目上下文，请在项目结构或逻辑发生重大变更时同步更新。

---

## 1. 项目概览

| 字段 | 值 |
|------|------|
| **项目名称** | 幸运转盘（我替你选择 / my-lucky-wheel） |
| **项目类型** | 纯前端静态 Web 应用 |
| **技术栈** | HTML5 + CSS3 + Vanilla JavaScript（无框架、无构建工具） |
| **部署方式** | Docker（nginx 镜像托管静态文件） |
| **语言** | 中文（zh-CN） |

### 功能简介

一个幸运转盘随机选择工具，用户可以：

- 自定义转盘项目（最多 16 个）
- 旋转转盘获取随机结果
- 设置每日使用次数限制（1~100 次）
- 查看历史选择记录（最多保存 100 条）
- 鼠标悬停转盘扇形可显示完整项目名称（Tooltip）

---

## 2. 项目结构

```
my-item-selecter/
├── src/                 # 源代码目录
│   ├── index.html       # 主页面（含所有弹窗 DOM 结构）
│   ├── styles.css       # 全局样式
│   └── script.js        # 全部业务逻辑（单文件）
├── docs/
│   └── copilot-instructions.md  # 本文档
└── run/
    ├── Dockerfile       # Docker 构建（基于 nginx:latest）
    ├── deploy.sh        # Docker 一键部署脚本
    └── README.md        # 部署说明文档
```

> ⚠️ 无 `package.json`、无构建步骤，修改后直接刷新浏览器或重新构建 Docker 即可。

---

## 3. 关键文件说明

### `src/index.html`

- 包含转盘区域（`<canvas id="wheelCanvas">`）、项目列表、配置弹窗、历史记录弹窗
- 引用同级目录下的 `styles.css` 和 `script.js`

### `src/script.js`

所有逻辑集中在此文件，主要模块：

| 模块 | 说明 |
|------|------|
| **Canvas 渲染** | `setupCanvas()` 处理高 DPI 适配，`drawWheel(rotation)` 绘制转盘 |
| **转盘旋转动画** | `startSpin()` → `requestAnimationFrame` 循环，`easeOutCubic` 缓动 |
| **项目管理** | `addItem()` / `deleteItem()` / `clearAllItems()` / `renderItemsList()` |
| **使用限制** | `canSpin()` / `incrementUsage()` / `loadLimitSettings()` / `saveLimitSettings()` |
| **历史记录** | `addHistory()` / `renderHistory()` / `clearHistory()` / `loadHistory()` |
| **Tooltip** | canvas `mousemove` 事件处理，根据旋转角度计算悬停扇形索引 |

#### 数据存储

所有数据使用 `localStorage` 持久化：

| Key | 类型 | 说明 |
|-----|------|------|
| `wheelItems` | `string[]` | 转盘项目列表 |
| `limitEnabled` | `boolean` | 是否开启每日限制 |
| `dailyLimit` | `number` | 每日限制次数 |
| `usedCount` | `number` | 当日已使用次数 |
| `lastDate` | `string` | 上次使用日期（用于判断跨天重置） |
| `wheelHistory` | `object[]` | 历史记录（含 name/date/time） |

#### 颜色方案

`colors` 数组定义了 16 种鲜艳颜色，通过 `index % colors.length` 循环使用。

#### 转盘旋转算法

1. 随机选取 `resultIndex`（目标扇形索引）
2. 计算目标角度：使 `resultIndex` 扇形对齐顶部指针（270° / 3π/2）
3. 叠加至少 5 圈旋转（`minSpins = 5`）
4. 使用 `easeOutCubic` 缓动函数实现 3 秒减速动画

### `src/styles.css`

- 渐变紫色背景（`#667eea` → `#764ba2`）
- 白色圆角容器（`.container`）
- 响应式设计：移动端 `max-width: 600px` 时转盘缩小至 280px
- 弹窗使用固定定位 + `display: block/none` 切换

### `run/Dockerfile`

- 基于 `nginx:latest`
- 复制 `src/` 下的静态文件到 `/usr/share/nginx/html/`
- 暴露 80 端口

### `run/deploy.sh`

一键 Docker 部署脚本：

1. 停止并删除旧容器 `lucky-wheel`
2. 使用 `run/Dockerfile` 构建新镜像 `my-lucky-wheel:latest`（以项目根目录为构建上下文）
3. 启动新容器，映射 `8080:80`

---

## 4. 开发约定

- **无框架依赖**：不引入 React/Vue/jQuery 等，保持纯原生实现
- **单文件架构**：JS 和 CSS 各仅一个文件，不拆分模块
- **中文注释**：代码注释和 UI 文案均为中文
- **数据持久化**：仅使用 `localStorage`，无后端 API
- **无构建步骤**：修改源码后无需编译/打包，直接部署即可
- **Docker 部署**：通过 `run/deploy.sh` 一键构建和部署

---

## 5. 已知限制

| 限制 | 说明 |
|------|------|
| 最大项目数 | 16 个（受颜色数量和显示面积限制） |
| 历史记录上限 | 100 条 |
| 每日限制范围 | 1~100 次 |
| 数据存储 | 仅 localStorage，清除浏览器数据会丢失 |
| 项目文字长度 | 最多 20 字符（`maxlength="20"`），转盘上超过 6 字截断显示 |

---

## 6. 常见修改指引

| 需求 | 修改位置 |
|------|----------|
| 修改转盘颜色 | `js/script.js` 顶部 `colors` 数组 |
| 修改默认每日限制次数 | `js/script.js` 中 `dailyLimit` 初始值（默认 5） |
| 修改最大项目数 | `js/script.js` 中 `addItem()` 的 `items.length >= 16` 判断 |
| 修改旋转速度/时长 | `js/script.js` 中 `startSpin()` 的 `duration`（默认 3000ms）和 `minSpins`（默认 5） |
| 修改部署端口 | `run/deploy.sh` 中 `PORT="8080"` |
| 修改背景渐变色 | `css/styles.css` 中 `body` 的 `background` |
| 添加新弹窗/功能 | `index.html` 添加弹窗 DOM + `js/script.js` 添加逻辑 |
