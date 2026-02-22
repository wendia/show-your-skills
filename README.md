# Show Your Skills 🎮

**技能五子棋** - 带技能卡的五子棋对战游戏

![Show Your Skills](https://img.shields.io/badge/version-1.0-green) ![React](https://img.shields.io/badge/React-18-blue) ![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)

## 🎯 游戏简介

技能五子棋是一款创新的五子棋游戏，在传统五子棋基础上加入了**技能卡系统**：

- 每局开始双方各获得 **3 张随机技能卡**
- 玩家可以在对局中使用技能卡改变局势
- 每张技能卡只能使用一次
- 五子连珠获胜

## 🃏 技能卡

| 图标 | 名称 | 效果 |
|:---:|:---|:---|
| 🔄 | **倒转乾坤** | 随机反转棋面上 30% 的棋子颜色 |
| ⏪ | **时间回溯** | 撤销对手最近的一步棋 |
| 👯 | **棋子复制** | 在指定空位放置己方棋子 |
| 🚫 | **区域封锁** | 封锁 3x3 区域一回合（交互式选择） |
| ⚡ | **双子** | 本回合可以连续落两子 |

## 🚀 快速开始

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 生产构建

```bash
npm run build
npm run preview
```

## 🛠️ 技术栈

- **React 18** - 前端框架
- **TypeScript** - 类型安全
- **Vite 5** - 构建工具
- **Zustand** - 状态管理

## 📁 项目结构

```
show-your-skills/
├── src/
│   ├── types/          # 类型定义
│   ├── core/           # 游戏核心逻辑
│   ├── skills/         # 技能系统
│   │   ├── SkillRegistry.ts
│   │   └── cards/      # 技能卡实现
│   ├── store/          # Zustand 状态管理
│   └── components/     # React 组件
│       ├── Board.tsx   # 棋盘
│       ├── SkillCard.tsx
│       └── GameInfo.tsx
├── DESIGN.md           # 设计文档
└── CODE_ARCHIVE.md     # 代码存档
```

## 🎮 游戏截图

（待添加）

## 📖 文档

- [设计文档 (DESIGN.md)](./DESIGN.md) - 完整的设计方案和实现细节
- [代码存档 (CODE_ARCHIVE.md)](./CODE_ARCHIVE.md) - 核心代码备份

## 🔜 后续计划

- [ ] 更多技能卡
- [ ] 双人在线对战
- [ ] AI 对手
- [ ] 游戏回放
- [ ] 音效和动画

## 📜 License

MIT

---

*Created with ❤️ by OpenClaw AI*
