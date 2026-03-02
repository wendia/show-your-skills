# 技能卡设计：时间回溯

**技能ID**: time_warp
**稀有度**: 史诗 (Epic)
**类型**: 瞬发技能
**优先级**: 20

---

## 1. 技能概述

### 1.1 基本信息

| 属性 | 值 |
|------|------|
| 名称 | 时间回溯 |
| 描述 | 撤销对手最近的一步棋 |
| 类型 | 瞬发 (instant) |
| 冷却 | 无 |
| 使用条件 | 历史记录不为空 |

### 1.2 设计理念

**时间回溯**是一个策略性技能，允许玩家撤销对手的最后一步棋。这个技能在防守时特别有用，可以破坏对手的连珠或关键布局。

**核心特点**:
- ⏪ 精确控制，撤销指定落子
- 🛡️ 防守利器
- 🎯 针对性强
- ⚡ 不消耗回合

---

## 2. 技能机制

### 2.1 使用条件

```typescript
canUse(context: SkillContext): boolean {
  return context.gameState.history.length > 0;
}
```

**条件说明**:
- 历史记录中必须有落子记录
- 任何回合都可以使用
- 不需要指定目标位置

### 2.2 执行逻辑

```typescript
execute(context: SkillContext): GameState {
  const { gameState } = context;
  const history = gameState.history;
  
  if (history.length === 0) {
    return gameState;
  }
  
  // 找到最后一个落子动作
  let lastPlaceIndex = history.length - 1;
  while (lastPlaceIndex >= 0 && history[lastPlaceIndex].type !== 'place') {
    lastPlaceIndex--;
  }
  
  if (lastPlaceIndex < 0) {
    return gameState;
  }
  
  const lastAction = history[lastPlaceIndex];
  const position = lastAction.position!;
  
  // 移除棋子
  const newBoard = gameState.board.map(row => [...row]);
  newBoard[position.row][position.col] = null;
  
  // 更新历史
  const newHistory = history.slice(0, lastPlaceIndex);
  
  return {
    ...gameState,
    board: newBoard,
    history: newHistory,
    currentPlayer: lastAction.player,
    turn: gameState.turn - 1,
  };
}
```

**执行步骤**:
1. 检查历史记录
2. 找到最后一个落子
3. 移除该位置的棋子
4. 更新历史记录
5. 调整当前玩家

---

## 3. 视觉设计

### 3.1 卡牌外观

**史诗级卡片样式**:

```
┌─────────────────────────┐
│  ⏪ 时间回溯    [史诗]   │
│  ─────────────────      │
│                         │
│     🕐                  │
│                         │
│  撤销对手最近的         │
│  一步棋                 │
│                         │
│  ━━━━━━━━━━━━━━━        │
│  [使用技能]             │
└─────────────────────────┘
```

**颜色方案**:
```css
/* 史诗级渐变 */
background: linear-gradient(135deg, #8b5cf6, #7c3aed);
border: 2px solid rgba(139, 92, 246, 0.5);
box-shadow: 0 0 40px rgba(139, 92, 246, 0.3);
```

### 3.2 图标设计

**图标**: 时钟回退图标
```tsx
import { RotateCcw } from 'lucide-react';

<RotateCcw className="w-12 h-12 text-purple-400" />
```

**备选图标**:
- `RotateCcw` - 逆时针旋转
- `History` - 历史
- `Undo2` - 撤销

---

## 4. 动画设计

### 4.1 使用动画

**阶段1: 目标棋子高亮** (0.3秒)
```css
.target-stone {
  animation: highlight 0.3s ease-out;
  box-shadow: 0 0 30px rgba(139, 92, 246, 0.8);
}

@keyframes highlight {
  0% { box-shadow: 0 0 0 rgba(139, 92, 246, 0); }
  100% { box-shadow: 0 0 30px rgba(139, 92, 246, 0.8); }
}
```

**阶段2: 棋子消失** (0.5秒)
```css
.remove-animation {
  animation: fadeOut 0.5s ease-out;
}

@keyframes fadeOut {
  0% { 
    opacity: 1;
    transform: scale(1);
  }
  100% { 
    opacity: 0;
    transform: scale(0.5);
  }
}
```

**阶段3: 时空涟漪** (0.8秒)
```css
.time-ripple {
  animation: ripple 0.8s ease-out;
}

@keyframes ripple {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(3);
    opacity: 0;
  }
}
```

### 4.2 Framer Motion 实现

```tsx
import { motion, AnimatePresence } from 'framer-motion';

const TimeWarpAnimation = ({ position, onComplete }) => {
  return (
    <AnimatePresence>
      {/* 棋子消失 */}
      <motion.div
        key="stone"
        initial={{ opacity: 1, scale: 1 }}
        animate={{ opacity: 0, scale: 0.5 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onAnimationComplete={onComplete}
      >
        <Stone color="black" />
      </motion.div>
      
      {/* 涟漪效果 */}
      <motion.div
        key="ripple"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.8 }}
        className="absolute inset-0 border-2 border-purple-500 rounded-full"
      />
    </AnimatePresence>
  );
};
```

---

## 5. 音效设计

### 5.1 音效列表

| 时机 | 音效 | 描述 |
|------|------|------|
| 选中卡片 | `card_hover.mp3` | 轻柔的卡片摩擦声 |
| 使用技能 | `time_warp.mp3` | 时空扭曲声 |
| 棋子消失 | `stone_vanish.mp3` | 消融声 |
| 完成撤销 | `undo_complete.mp3` | 时钟滴答声 |

---

## 6. 平衡性设计

### 6.1 强度分析

**优势**:
- ✅ 精确控制
- ✅ 可破坏对手连珠
- ✅ 不消耗回合

**劣势**:
- ❌ 只能撤销最后一步
- ❌ 对已形成的连珠无效
- ❌ 对手可能重新落子

---

## 7. 代码实现

### 7.1 完整实现

```typescript
// src/skills/cards/TimeWarpSkill.ts
import { Skill, SkillContext, GameState } from '../../types';

export const TimeWarpSkill: Skill = {
  id: 'time_warp',
  name: '时间回溯',
  description: '撤销对手最近的一步棋',
  type: 'instant',
  priority: 20,
  
  canUse(context: SkillContext): boolean {
    return context.gameState.history.length > 0;
  },
  
  execute(context: SkillContext): GameState {
    const { gameState } = context;
    const history = gameState.history;
    
    if (history.length === 0) {
      return gameState;
    }
    
    // 找到最后一个落子
    let lastPlaceIndex = history.length - 1;
    while (lastPlaceIndex >= 0 && history[lastPlaceIndex].type !== 'place') {
      lastPlaceIndex--;
    }
    
    if (lastPlaceIndex < 0) {
      return gameState;
    }
    
    const lastAction = history[lastPlaceIndex];
    const position = lastAction.position!;
    
    // 移除棋子
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[position.row][position.col] = null;
    
    // 更新历史
    const newHistory = history.slice(0, lastPlaceIndex);
    
    console.log(`[时间回溯] 撤销了 (${position.row}, ${position.col}) 处的棋子`);
    
    return {
      ...gameState,
      board: newBoard,
      history: newHistory,
      currentPlayer: lastAction.player,
      turn: gameState.turn - 1,
    };
  },
};
```

---

## 8. 测试用例

### 8.1 单元测试

```typescript
// tests/skills/TimeWarpSkill.test.ts
describe('TimeWarpSkill', () => {
  test('should require history', () => {
    const context = createTestContext({ history: [] });
    expect(TimeWarpSkill.canUse(context)).toBe(false);
  });
  
  test('should remove last stone', () => {
    const context = createTestContext({
      history: [{ type: 'place', position: { row: 7, col: 7 }, player: 'black' }]
    });
    
    const newState = TimeWarpSkill.execute(context);
    expect(newState.board[7][7]).toBeNull();
  });
});
```

---

## 9. 更新日志

- **2026-02-24**: 创建时间回溯技能设计文档 v1.0
