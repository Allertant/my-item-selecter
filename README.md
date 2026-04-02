# 🎡 幸运转盘（我替你选择）

一个简洁的随机选择工具，帮助你快速做出决定。

## ✨ 功能特性

- 🎯 **自定义项目** — 添加最多 16 个选项到转盘
- 🎰 **随机旋转** — 带缓动动画的转盘旋转，自动选出结果
- 📊 **历史记录** — 保存最近 100 条抽选结果
- ⏱ **使用限制** — 可设置每日使用次数（1~100 次）
- 🌗 **明暗主题** — 支持手动切换 / 跟随系统
- 📱 **移动端适配** — 响应式布局，兼容 iOS Safari

## 🛠 技术栈

| 技术 | 说明 |
|------|------|
| React 19 | UI 框架 |
| TypeScript 5 | 类型安全 |
| Vite 6 | 构建工具 |
| Tailwind CSS v4 | 原子化样式 |
| shadcn/ui (Radix UI) | 无障碍组件库 |
| Lucide React | 图标 |
| Docker + nginx | 生产部署 |

## 🚀 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 生产构建
npm run build
```

## 🐳 Docker 部署

```bash
cd run
./deploy.sh build   # 构建镜像
./deploy.sh start   # 启动服务（默认 8080 端口）
```

支持命令：`start | stop | restart | logs | build | status | clean`

## 📁 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/              # shadcn/ui 基础组件
│   ├── Header.tsx       # 顶部导航
│   ├── Wheel.tsx        # Canvas 转盘
│   ├── ItemList.tsx     # 项目列表（PC 端）
│   ├── ItemManageModal.tsx  # 项目管理（移动端）
│   ├── ConfigModal.tsx  # 使用限制设置
│   └── HistoryModal.tsx # 历史记录
├── hooks/               # 自定义 Hooks
│   ├── useAppLogic.ts   # 核心业务逻辑
│   ├── useWheelSpin.ts  # 旋转动画
│   ├── useUsageLimit.ts # 使用限制
│   ├── useLocalStorage.ts   # 本地存储
│   └── useTheme.ts      # 主题管理
├── lib/                 # 工具函数
│   ├── wheel-drawing.ts # Canvas 绘制
│   └── wheel-utils.ts   # 缓动/角度计算
└── types/index.ts       # 类型定义
```

## 📄 许可

MIT
