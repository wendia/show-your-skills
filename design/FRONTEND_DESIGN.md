# Show Your Skills - 前端设计文档

**版本**: v2.0
**创建时间**: 2026-02-24
**更新时间**: 2026-02-24
**技术栈**: React 18 + TypeScript + Vite + Zustand

---

## 目录

1. [项目概述](#1-项目概述)
2. [架构设计](#2-架构设计)
3. [目录结构](#3-目录结构)
4. [配置系统](#4-配置系统)
5. [主题系统](#5-主题系统)
6. [技能系统](#6-技能系统)
7. [组件设计](#7-组件设计)
8. [状态管理](#8-状态管理)
9. [路由设计](#9-路由设计)
10. [样式系统](#10-样式系统)
11. [性能优化](#11-性能优化)
12. [测试策略](#12-测试策略)

---

## 1. 项目概述

### 1.1 项目目标

开发一款带技能卡的在线五子棋游戏，具有以下特点：
- 🎮 现代化游戏界面
- ⚡ 流畅的用户体验
- 🌐 在线多人对战
- 🎨 **可配置主题系统**
- 🃏 **可配置技能卡池**
- 📱 响应式布局

### 1.2 技术栈选择

| 技术 | 版本 | 选择理由 |
|------|------|---------|
| React | 18.2 | 生态成熟，组件化开发 |
| TypeScript | 5.3 | 类型安全，开发体验好 |
| Vite | 5.0 | 快速构建，HMR优秀 |
| Zustand | 4.5 | 轻量级状态管理 |
| shadcn/ui | latest | 现代设计，完全可定制 |
| Tailwind CSS | 3.4 | 原子化CSS，快速开发 |
| Framer Motion | 11.0 | 流畅动画 |

### 1.3 核心特性

**v2.0 新增**:
- ✅ **主题配置系统** - 快速切换视觉风格
- ✅ **技能池配置系统** - 灵活配置技能卡组
- ✅ **配置驱动架构** - JSON配置，无需修改代码

---

## 2. 架构设计

### 2.1 整体架构

```
┌─────────────────────────────────────────┐
│              用户界面层                  │
│  ┌─────────────────────────────────┐   │
│  │  Pages (页面)                    │   │
│  │  - HomePage                     │   │
│  │  - GamePage                     │   │
│  │  - LobbyPage                    │   │
│  │  - SettingsPage (主题设置)      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│              组件层                      │
│  ┌─────────────────────────────────┐   │
│  │  UI Components (UI组件)          │   │
│  │  - Board, SkillCard, PlayerInfo │   │
│  └─────────────────────────────────┘   │
│  ┌─────────────────────────────────┐   │
│  │  Themed Components (主题化组件)  │   │
│  │  - ThemedCard, ThemedBadge      │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│         配置与主题层 (NEW)               │
│  ┌─────────────────────────────────┐   │
│  │  ConfigManager                   │   │
│  │  ThemeManager                    │   │
│  │  SkillPoolManager                │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│              状态管理层                  │
│  ┌─────────────────────────────────┐   │
│  │  Zustand Stores                  │   │
│  │  - gameStore                    │   │
│  │  - userStore                    │   │
│  │  - themeStore (NEW)             │   │
│  │  - configStore (NEW)            │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│              数据访问层                  │
│  ┌─────────────────────────────────┐   │
│  │  API Client                      │   │
│  │  - REST API                      │   │
│  │  - WebSocket                     │   │
│  └─────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

---

## 3. 目录结构

### 3.1 完整目录结构

```
src/
├── main.tsx                 # 入口文件
├── App.tsx                  # 根组件
├── index.css               # 全局样式
│
├── config/                  # 🆕 配置系统
│   ├── index.ts            # 配置管理器
│   ├── types.ts            # 配置类型
│   │
│   ├── themes/             # 主题配置
│   │   ├── default.json    # 默认主题
│   │   ├── magic.json      # 魔法主题
│   │   ├── tech.json       # 科技主题
│   │   └── minimal.json    # 极简主题
│   │
│   └── skillPools/         # 技能池配置
│       ├── standard.json   # 标准池
│       ├── chaos.json      # 混乱池
│       └── tactical.json   # 战术池
│
├── theme/                   # 🆕 主题系统
│   ├── ThemeManager.ts     # 主题管理器
│   ├── ThemeContext.tsx    # 主题上下文
│   ├── useTheme.ts         # 主题Hook
│   └── types.ts            # 主题类型
│
├── components/             # 组件目录
│   ├── ui/                 # UI基础组件 (shadcn/ui)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   └── ...
│   │
│   ├── game/               # 游戏组件
│   │   ├── Board.tsx
│   │   ├── Stone.tsx
│   │   ├── SkillCard.tsx   # 主题化
│   │   └── ...
│   │
│   ├── themed/             # 🆕 主题化组件
│   │   ├── ThemedCard.tsx
│   │   ├── ThemedBadge.tsx
│   │   └── ThemedBoard.tsx
│   │
│   └── settings/           # 🆕 设置组件
│       ├── ThemeSelector.tsx
│       ├── SkillPoolSelector.tsx
│       └── SettingsPage.tsx
│
├── skills/                  # 🔄 重构技能系统
│   ├── core/               # 核心系统
│   │   ├── SkillRegistry.ts
│   │   ├── SkillPoolManager.ts
│   │   └── SkillLoader.ts
│   │
│   ├── effects/            # 技能效果（解耦）
│   │   ├── flipStones.ts
│   │   ├── undoMove.ts
│   │   ├── placeStone.ts
│   │   ├── blockZone.ts
│   │   └── doubleMove.ts
│   │
│   └── cards/              # 技能定义（废弃）
│       └── index.ts
│
├── store/                  # 状态管理
│   ├── gameStore.ts
│   ├── userStore.ts
│   ├── themeStore.ts       # 🆕 主题状态
│   └── configStore.ts      # 🆕 配置状态
│
├── hooks/                  # 自定义Hooks
│   ├── useGame.ts
│   ├── useTheme.ts         # 🆕 主题Hook
│   ├── useConfig.ts        # 🆕 配置Hook
│   └── useSkillPool.ts     # 🆕 技能池Hook
│
├── api/                    # API客户端
│   ├── client.ts
│   ├── auth.ts
│   ├── games.ts
│   └── websocket.ts
│
├── multiplayer/            # 多人游戏
│   ├── connection.ts
│   ├── roomManager.ts
│   └── gameSync.ts
│
├── core/                   # 核心逻辑
│   ├── Game.ts
│   ├── SkillEngine.ts
│   └── AI.ts
│
├── lib/                    # 工具库
│   ├── utils.ts
│   ├── constants.ts
│   └── validators.ts
│
├── types/                  # 类型定义
│   ├── index.ts
│   ├── game.ts
│   ├── user.ts
│   ├── theme.ts            # 🆕 主题类型
│   └── config.ts           # 🆕 配置类型
│
├── styles/                 # 样式文件
│   ├── globals.css
│   └── animations.css
│
└── assets/                 # 静态资源
    ├── images/
    ├── icons/
    └── sounds/
```

---

## 4. 配置系统

### 4.1 配置管理器

```typescript
// src/config/index.ts
import { ThemeConfig, SkillPoolConfig } from './types';

class ConfigManager {
  private themes: Map<string, ThemeConfig> = new Map();
  private skillPools: Map<string, SkillPoolConfig> = new Map();
  
  // 注册主题
  registerTheme(theme: ThemeConfig): void {
    this.themes.set(theme.id, theme);
  }
  
  // 注册技能池
  registerSkillPool(pool: SkillPoolConfig): void {
    this.skillPools.set(pool.id, pool);
  }
  
  // 获取主题
  getTheme(id: string): ThemeConfig | undefined {
    return this.themes.get(id);
  }
  
  // 获取所有主题
  getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }
  
  // 获取技能池
  getSkillPool(id: string): SkillPoolConfig | undefined {
    return this.skillPools.get(id);
  }
  
  // 获取所有技能池
  getAllSkillPools(): SkillPoolConfig[] {
    return Array.from(this.skillPools.values());
  }
  
  // 批量导入主题
  importThemes(themes: ThemeConfig[]): void {
    themes.forEach(theme => this.registerTheme(theme));
  }
  
  // 批量导入技能池
  importSkillPools(pools: SkillPoolConfig[]): void {
    pools.forEach(pool => this.registerSkillPool(pool));
  }
}

export const configManager = new ConfigManager();
```

### 4.2 配置类型

```typescript
// src/config/types.ts

// 主题配置
export interface ThemeConfig {
  id: string;
  name: string;
  version: string;
  
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    background: ColorSet;
  };
  
  rarity: {
    common: RarityStyle;
    rare: RarityStyle;
    epic: RarityStyle;
    legendary: RarityStyle;
  };
  
  card: CardStyle;
  board: BoardStyle;
  animations: AnimationConfig;
  sounds: SoundConfig;
}

// 技能池配置
export interface SkillPoolConfig {
  id: string;
  name: string;
  description: string;
  
  skills: SkillDefinition[];
  distribution: DistributionConfig;
  weights?: Record<string, number>;
}

// 技能定义
export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'instant' | 'target' | 'passive';
  priority: number;
  effectId: string;
  conditions: SkillCondition[];
  params: Record<string, any>;
  ui: SkillUIConfig;
}

// 稀有度样式
export interface RarityStyle {
  gradient: string;
  border: string;
  glow: string;
  badge: string;
}

// 颜色系统
export interface ColorScale {
  50: string;
  100: string;
  500: string;
  900: string;
  [key: number]: string;
}
```

### 4.3 配置示例

**主题配置** (`config/themes/magic.json`):
```json
{
  "id": "magic",
  "name": "魔法世界",
  "version": "1.0.0",
  
  "rarity": {
    "common": {
      "gradient": "from-slate-600 to-slate-700",
      "border": "border-slate-500/30",
      "glow": "rgba(100,116,139,0.3)"
    },
    "rare": {
      "gradient": "from-blue-600 to-cyan-600",
      "border": "border-blue-500/30",
      "glow": "rgba(59,130,246,0.4)"
    },
    "epic": {
      "gradient": "from-purple-600 to-pink-600",
      "border": "border-purple-500/30",
      "glow": "rgba(147,51,234,0.5)"
    },
    "legendary": {
      "gradient": "from-amber-500 to-orange-600",
      "border": "border-amber-400/50",
      "glow": "rgba(245,158,11,0.6)"
    }
  },
  
  "card": {
    "borderRadius": 16,
    "shadowGlow": true,
    "animationStyle": "smooth"
  },
  
  "board": {
    "style": "wood",
    "gridColor": "#8B4513",
    "backgroundColor": "#DEB887"
  }
}
```

**技能池配置** (`config/skillPools/standard.json`):
```json
{
  "id": "standard",
  "name": "标准技能池",
  "description": "平衡的标准技能组合",
  
  "skills": [
    {
      "id": "reverse_chaos",
      "name": "倒转乾坤",
      "description": "随机反转棋面上 {flipPercent}% 的棋子颜色",
      "rarity": "legendary",
      "type": "instant",
      "priority": 10,
      "effectId": "flipStones",
      "conditions": [
        { "type": "min_stones", "value": 3 }
      ],
      "params": {
        "flipPercent": 30
      },
      "ui": {
        "icon": "RefreshCcw",
        "animationId": "flip",
        "soundId": "reverse"
      }
    }
  ],
  
  "distribution": {
    "method": "balanced",
    "countPerPlayer": 3,
    "allowDuplicates": false,
    "balanceByRarity": true
  }
}
```

---

## 5. 主题系统

### 5.1 主题管理器

```typescript
// src/theme/ThemeManager.ts
import { ThemeConfig } from '../config/types';

class ThemeManager {
  private currentTheme: ThemeConfig | null = null;
  private listeners: Set<(theme: ThemeConfig) => void> = new Set();
  
  // 加载主题
  async loadTheme(themeId: string): Promise<void> {
    const theme = configManager.getTheme(themeId);
    if (!theme) {
      throw new Error(`Theme not found: ${themeId}`);
    }
    
    this.currentTheme = theme;
    this.applyCSSVariables(theme);
    this.notifyListeners();
  }
  
  // 获取当前主题
  getCurrentTheme(): ThemeConfig | null {
    return this.currentTheme;
  }
  
  // 获取稀有度样式
  getRarityStyle(rarity: string): RarityStyle | null {
    return this.currentTheme?.rarity[rarity] || null;
  }
  
  // 应用CSS变量
  private applyCSSVariables(theme: ThemeConfig): void {
    const root = document.documentElement;
    
    // 颜色变量
    root.style.setProperty('--color-primary', theme.colors.primary[500]);
    root.style.setProperty('--color-secondary', theme.colors.secondary[500]);
    
    // 稀有度变量
    Object.entries(theme.rarity).forEach(([rarity, style]) => {
      root.style.setProperty(`--rarity-${rarity}-glow`, style.glow);
    });
    
    // 卡片变量
    root.style.setProperty('--card-radius', `${theme.card.borderRadius}px`);
  }
  
  // 监听主题变化
  subscribe(listener: (theme: ThemeConfig) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
  
  private notifyListeners(): void {
    if (this.currentTheme) {
      this.listeners.forEach(listener => listener(this.currentTheme!));
    }
  }
}

export const themeManager = new ThemeManager();
```

### 5.2 主题上下文

```tsx
// src/theme/ThemeContext.tsx
import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeConfig } from '../config/types';
import { themeManager } from './ThemeManager';

interface ThemeContextValue {
  theme: ThemeConfig | null;
  loading: boolean;
  setTheme: (themeId: string) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: null,
  loading: true,
  setTheme: async () => {},
});

export const ThemeProvider: React.FC<{
  defaultTheme?: string;
  children: React.ReactNode;
}> = ({ defaultTheme = 'default', children }) => {
  const [theme, setThemeState] = useState<ThemeConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    themeManager.loadTheme(defaultTheme).then(() => {
      setThemeState(themeManager.getCurrentTheme());
      setLoading(false);
    });
    
    const unsubscribe = themeManager.subscribe((newTheme) => {
      setThemeState(newTheme);
    });
    
    return unsubscribe;
  }, [defaultTheme]);
  
  const setTheme = async (themeId: string) => {
    setLoading(true);
    await themeManager.loadTheme(themeId);
    setLoading(false);
  };
  
  return (
    <ThemeContext.Provider value={{ theme, loading, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
```

### 5.3 主题Hook

```typescript
// src/theme/useTheme.ts
import { useTheme as useThemeContext } from './ThemeContext';
import { RarityStyle } from '../config/types';

export function useRarityStyle(rarity: string): RarityStyle | null {
  const { theme } = useThemeContext();
  return theme?.rarity[rarity] || null;
}

export function useThemeColors() {
  const { theme } = useThemeContext();
  return theme?.colors || null;
}

export function useCardStyle() {
  const { theme } = useThemeContext();
  return theme?.card || null;
}

export function useBoardStyle() {
  const { theme } = useThemeContext();
  return theme?.board || null;
}
```

---

## 6. 技能系统

### 6.1 技能注册表（增强版）

```typescript
// src/skills/core/SkillRegistry.ts
import { SkillDefinition, SkillEffect, SkillContext, GameState } from '../../types';

export class SkillRegistry {
  private definitions: Map<string, SkillDefinition> = new Map();
  private effects: Map<string, SkillEffect> = new Map();
  
  // 注册技能定义（从配置）
  registerDefinition(definition: SkillDefinition): void {
    this.definitions.set(definition.id, definition);
  }
  
  // 批量注册
  registerDefinitions(definitions: SkillDefinition[]): void {
    definitions.forEach(def => this.registerDefinition(def));
  }
  
  // 注册效果实现（解耦）
  registerEffect(effectId: string, effect: SkillEffect): void {
    this.effects.set(effectId, effect);
  }
  
  // 获取技能定义
  getDefinition(id: string): SkillDefinition | undefined {
    return this.definitions.get(id);
  }
  
  // 获取所有定义
  getAllDefinitions(): SkillDefinition[] {
    return Array.from(this.definitions.values());
  }
  
  // 按稀有度筛选
  getByRarity(rarity: string): SkillDefinition[] {
    return this.getAllDefinitions().filter(s => s.rarity === rarity);
  }
  
  // 执行技能
  execute(skillId: string, context: SkillContext): GameState | null {
    const definition = this.definitions.get(skillId);
    if (!definition) return null;
    
    // 检查条件
    if (!this.checkConditions(definition.conditions, context)) {
      return null;
    }
    
    // 获取效果
    const effect = this.effects.get(definition.effectId);
    if (!effect) return null;
    
    // 执行效果（传入参数）
    return effect.execute(context, definition.params);
  }
  
  // 检查条件
  private checkConditions(
    conditions: SkillCondition[],
    context: SkillContext
  ): boolean {
    for (const condition of conditions) {
      switch (condition.type) {
        case 'min_stones':
          const stones = getAllStones(context.gameState.board);
          if (stones.length < condition.value) return false;
          break;
        case 'history_not_empty':
          if (context.gameState.history.length === 0) return false;
          break;
      }
    }
    return true;
  }
}

export const skillRegistry = new SkillRegistry();
```

### 6.2 技能池管理器

```typescript
// src/skills/core/SkillPoolManager.ts
import { SkillPoolConfig, SkillCard, SkillDefinition } from '../../types';
import { skillRegistry } from './SkillRegistry';

class SkillPoolManager {
  private pools: Map<string, SkillPoolConfig> = new Map();
  private currentPool: SkillPoolConfig | null = null;
  
  // 注册技能池
  registerPool(pool: SkillPoolConfig): void {
    this.pools.set(pool.id, pool);
    skillRegistry.registerDefinitions(pool.skills);
  }
  
  // 加载技能池
  async loadPool(poolId: string): Promise<void> {
    const pool = this.pools.get(poolId);
    if (!pool) {
      throw new Error(`Skill pool not found: ${poolId}`);
    }
    this.currentPool = pool;
  }
  
  // 获取当前池
  getCurrentPool(): SkillPoolConfig | null {
    return this.currentPool;
  }
  
  // 抽取技能卡
  drawCards(count?: number): SkillCard[] {
    if (!this.currentPool) {
      throw new Error('No skill pool loaded');
    }
    
    const { distribution, skills, weights } = this.currentPool;
    const drawCount = count || distribution.countPerPlayer;
    
    let selected: SkillDefinition[];
    
    switch (distribution.method) {
      case 'random':
        selected = this.randomSelect(skills, drawCount, distribution.allowDuplicates);
        break;
      case 'balanced':
        selected = this.balancedSelect(skills, drawCount, weights);
        break;
      default:
        selected = this.randomSelect(skills, drawCount, false);
    }
    
    return selected.map(skill => this.createSkillCard(skill));
  }
  
  private randomSelect(
    skills: SkillDefinition[],
    count: number,
    allowDuplicates: boolean
  ): SkillDefinition[] {
    const shuffled = [...skills].sort(() => Math.random() - 0.5);
    
    if (allowDuplicates) {
      return Array(count).fill(null).map(() => 
        skills[Math.floor(Math.random() * skills.length)]
      );
    }
    
    return shuffled.slice(0, count);
  }
  
  private balancedSelect(
    skills: SkillDefinition[],
    count: number,
    weights?: Record<string, number>
  ): SkillDefinition[] {
    const byRarity = {
      legendary: skills.filter(s => s.rarity === 'legendary'),
      epic: skills.filter(s => s.rarity === 'epic'),
      rare: skills.filter(s => s.rarity === 'rare'),
      common: skills.filter(s => s.rarity === 'common'),
    };
    
    const result: SkillDefinition[] = [];
    
    // 确保至少有1个传说/史诗
    if (byRarity.legendary.length > 0) {
      result.push(byRarity.legendary[Math.floor(Math.random() * byRarity.legendary.length)]);
    }
    if (byRarity.epic.length > 0 && result.length < count) {
      result.push(byRarity.epic[Math.floor(Math.random() * byRarity.epic.length)]);
    }
    
    // 填充剩余
    while (result.length < count) {
      const pool = [...byRarity.rare, ...byRarity.common];
      const skill = pool[Math.floor(Math.random() * pool.length)];
      if (!result.includes(skill)) {
        result.push(skill);
      }
    }
    
    return result;
  }
  
  private createSkillCard(definition: SkillDefinition): SkillCard {
    return {
      id: `${definition.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      skillId: definition.id,
      name: definition.name,
      description: definition.description,
      rarity: definition.rarity,
      used: false,
    };
  }
}

export const skillPoolManager = new SkillPoolManager();
```

### 6.3 技能效果实现

```typescript
// src/skills/effects/flipStones.ts
import { SkillEffect, SkillContext, GameState } from '../../types';
import { getAllStones, flipStones as doFlipStones } from '../../core/Game';

export const flipStonesEffect: SkillEffect = {
  id: 'flipStones',
  
  execute(context: SkillContext, params: Record<string, any>): GameState {
    const { gameState } = context;
    const { flipPercent = 30 } = params;
    
    const stones = getAllStones(gameState.board);
    const flipCount = Math.max(1, Math.floor(stones.length * flipPercent / 100));
    
    const shuffled = [...stones].sort(() => Math.random() - 0.5);
    const toFlip = shuffled.slice(0, flipCount).map(s => s.position);
    
    const newBoard = doFlipStones(gameState.board, toFlip);
    
    return { ...gameState, board: newBoard };
  }
};

// src/skills/effects/undoMove.ts
export const undoMoveEffect: SkillEffect = {
  id: 'undoMove',
  
  execute(context: SkillContext, params: Record<string, any>): GameState {
    const { gameState } = context;
    const history = gameState.history;
    
    if (history.length === 0) return gameState;
    
    let lastPlaceIndex = history.length - 1;
    while (lastPlaceIndex >= 0 && history[lastPlaceIndex].type !== 'place') {
      lastPlaceIndex--;
    }
    
    if (lastPlaceIndex < 0) return gameState;
    
    const lastAction = history[lastPlaceIndex];
    const position = lastAction.position!;
    
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[position.row][position.col] = null;
    
    return {
      ...gameState,
      board: newBoard,
      history: history.slice(0, lastPlaceIndex),
      currentPlayer: lastAction.player,
      turn: gameState.turn - 1,
    };
  }
};

// src/skills/effects/index.ts
import { skillRegistry } from '../core/SkillRegistry';
import { flipStonesEffect } from './flipStones';
import { undoMoveEffect } from './undoMove';
import { placeStoneEffect } from './placeStone';
import { blockZoneEffect } from './blockZone';
import { doubleMoveEffect } from './doubleMove';

export function registerAllEffects(): void {
  skillRegistry.registerEffect('flipStones', flipStonesEffect);
  skillRegistry.registerEffect('undoMove', undoMoveEffect);
  skillRegistry.registerEffect('placeStone', placeStoneEffect);
  skillRegistry.registerEffect('blockZone', blockZoneEffect);
  skillRegistry.registerEffect('doubleMove', doubleMoveEffect);
}
```

---

## 7. 组件设计

### 7.1 主题化技能卡组件

```tsx
// src/components/game/SkillCard.tsx
import { motion } from 'framer-motion';
import { useRarityStyle, useCardStyle } from '@/theme/useTheme';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import * as Icons from 'lucide-react';

interface SkillCardProps {
  skill: SkillCard;
  onUse: () => void;
  used?: boolean;
}

export const SkillCard = ({ skill, onUse, used }: SkillCardProps) => {
  const rarityStyle = useRarityStyle(skill.rarity);
  const cardStyle = useCardStyle();
  
  if (!rarityStyle || !cardStyle) return null;
  
  // 动态获取图标
  const IconComponent = Icons[skill.ui?.icon || 'Zap'];
  
  return (
    <motion.div
      whileHover={!used ? { scale: 1.05, y: -5 } : {}}
      whileTap={!used ? { scale: 0.95 } : {}}
      transition={{ type: "spring", stiffness: 300 }}
    >
      <Card
        className={cn(
          'relative overflow-hidden',
          `bg-gradient-to-br ${rarityStyle.gradient}`,
          `border-2 ${rarityStyle.border}`,
          used && 'opacity-50 cursor-not-allowed'
        )}
        style={{
          borderRadius: cardStyle.borderRadius,
          boxShadow: cardStyle.shadowGlow 
            ? `0 0 40px ${rarityStyle.glow}` 
            : undefined,
        }}
      >
        {/* 稀有度标签 */}
        <Badge 
          className={cn('absolute top-4 right-4', rarityStyle.badge)}
        >
          {skill.rarity}
        </Badge>
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            {IconComponent && <IconComponent className="w-6 h-6" />}
            {skill.name}
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-gray-200 mb-4">
            {skill.description}
          </p>
          
          <Button
            onClick={onUse}
            disabled={used}
            className="w-full"
            variant="secondary"
          >
            {used ? '已使用' : '使用技能'}
          </Button>
        </CardContent>
        
        {/* 使用状态覆盖层 */}
        {used && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <span className="text-white text-lg font-bold">已使用</span>
          </div>
        )}
      </Card>
    </motion.div>
  );
};
```

### 7.2 主题选择器

```tsx
// src/components/settings/ThemeSelector.tsx
import { useTheme } from '@/theme/ThemeContext';
import { configManager } from '@/config';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const ThemeSelector = () => {
  const { theme, setTheme } = useTheme();
  const themes = configManager.getAllThemes();
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">选择主题</h3>
        
        <RadioGroup
          value={theme?.id}
          onValueChange={(value) => setTheme(value)}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {themes.map((t) => (
            <label
              key={t.id}
              className={cn(
                'relative flex flex-col items-center p-4 rounded-lg border-2 cursor-pointer transition-all',
                theme?.id === t.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <RadioGroupItem value={t.id} className="sr-only" />
              
              {/* 主题预览 */}
              <div className="w-16 h-16 rounded-lg mb-2 overflow-hidden">
                <div className={cn(
                  'w-full h-full',
                  `bg-gradient-to-br ${t.rarity.legendary.gradient}`
                )} />
              </div>
              
              <span className="text-sm font-medium">{t.name}</span>
            </label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
```

### 7.3 技能池选择器

```tsx
// src/components/settings/SkillPoolSelector.tsx
import { useConfig } from '@/hooks/useConfig';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

export const SkillPoolSelector = () => {
  const { skillPool, setSkillPool } = useConfig();
  const pools = configManager.getAllSkillPools();
  
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">选择技能池</h3>
        
        <RadioGroup
          value={skillPool?.id}
          onValueChange={(value) => setSkillPool(value)}
          className="space-y-4"
        >
          {pools.map((pool) => (
            <label
              key={pool.id}
              className={cn(
                'flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all',
                skillPool?.id === pool.id 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              )}
            >
              <RadioGroupItem value={pool.id} className="mt-1" />
              
              <div className="flex-1">
                <div className="font-medium">{pool.name}</div>
                <div className="text-sm text-muted-foreground">
                  {pool.description}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  技能数量: {pool.skills.length} | 
                  每人卡数: {pool.distribution.countPerPlayer}
                </div>
              </div>
            </label>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};
```

---

## 8. 状态管理

### 8.1 主题Store

```typescript
// src/store/themeStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { ThemeConfig } from '../config/types';
import { themeManager } from '../theme/ThemeManager';

interface ThemeState {
  currentThemeId: string;
  currentTheme: ThemeConfig | null;
  
  setTheme: (themeId: string) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      currentThemeId: 'default',
      currentTheme: null,
      
      setTheme: async (themeId: string) => {
        await themeManager.loadTheme(themeId);
        set({
          currentThemeId: themeId,
          currentTheme: themeManager.getCurrentTheme(),
        });
      },
      
      loadTheme: async () => {
        const { currentThemeId } = get();
        await themeManager.loadTheme(currentThemeId);
        set({
          currentTheme: themeManager.getCurrentTheme(),
        });
      },
    }),
    {
      name: 'theme-storage',
      partialize: (state) => ({ currentThemeId: state.currentThemeId }),
    }
  )
);
```

### 8.2 配置Store

```typescript
// src/store/configStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SkillPoolConfig } from '../config/types';
import { skillPoolManager } from '../skills/core/SkillPoolManager';

interface ConfigState {
  skillPoolId: string;
  skillPool: SkillPoolConfig | null;
  
  setSkillPool: (poolId: string) => Promise<void>;
  loadConfig: () => Promise<void>;
}

export const useConfigStore = create<ConfigState>()(
  persist(
    (set, get) => ({
      skillPoolId: 'standard',
      skillPool: null,
      
      setSkillPool: async (poolId: string) => {
        await skillPoolManager.loadPool(poolId);
        set({
          skillPoolId: poolId,
          skillPool: skillPoolManager.getCurrentPool(),
        });
      },
      
      loadConfig: async () => {
        const { skillPoolId } = get();
        await skillPoolManager.loadPool(skillPoolId);
        set({
          skillPool: skillPoolManager.getCurrentPool(),
        });
      },
    }),
    {
      name: 'config-storage',
      partialize: (state) => ({ skillPoolId: state.skillPoolId }),
    }
  )
);
```

---

## 9. 初始化流程

### 9.1 应用初始化

```typescript
// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// 导入配置
import defaultTheme from './config/themes/default.json';
import magicTheme from './config/themes/magic.json';
import techTheme from './config/themes/tech.json';

import standardPool from './config/skillPools/standard.json';
import chaosPool from './config/skillPools/chaos.json';

// 导入配置管理器
import { configManager } from './config';
import { registerAllEffects } from './skills/effects';

// 初始化配置
function initializeApp() {
  // 注册主题
  configManager.importThemes([
    defaultTheme,
    magicTheme,
    techTheme,
  ]);
  
  // 注册技能池
  configManager.importSkillPools([
    standardPool,
    chaosPool,
  ]);
  
  // 注册技能效果
  registerAllEffects();
}

// 初始化
initializeApp();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### 9.2 App组件

```tsx
// src/App.tsx
import { ThemeProvider } from './theme/ThemeContext';
import { useThemeStore } from './store/themeStore';
import { useConfigStore } from './store/configStore';
import { useEffect } from 'react';

function App() {
  const { currentThemeId, loadTheme } = useThemeStore();
  const { skillPoolId, loadConfig } = useConfigStore();
  
  useEffect(() => {
    loadTheme();
    loadConfig();
  }, []);
  
  return (
    <ThemeProvider defaultTheme={currentThemeId}>
      <GameApp skillPoolId={skillPoolId} />
    </ThemeProvider>
  );
}

export default App;
```

---

## 10. 扩展性总结

### 10.1 改进对比

| 方面 | v1.0 | v2.0 |
|------|------|------|
| 技能定义 | 硬编码 | JSON配置 ✅ |
| 主题切换 | 不支持 | 支持 ✅ |
| 技能池切换 | 不支持 | 支持 ✅ |
| 稀有度配置 | 硬编码 | 主题配置 ✅ |
| 扩展新技能 | 修改代码 | 添加配置 ✅ |
| 扩展新主题 | 不可能 | 添加JSON ✅ |

### 10.2 扩展能力

**添加新技能**:
1. 实现效果（可选）
2. 添加技能定义到配置
3. 无需修改代码

**添加新主题**:
1. 创建主题JSON
2. 注册到系统
3. 一键切换

**添加新技能池**:
1. 创建技能池JSON
2. 配置技能和规则
3. 立即可用

---

## 11. 更新日志

- **2026-02-24**: v2.0 - 整合配置系统、主题系统、技能池系统
- **2026-02-24**: v1.0 - 初始版本
