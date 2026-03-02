# 技能卡设计：棋子复制

**技能ID**: clone
**稀有度**: 稀有 (Rare)
**类型**: 目标技能
**优先级**: 15

---

## 1. 技能概述

### 1.1 基本信息

| 属性 | 值 |
|------|------|
| 名称 | 棋子复制 |
| 描述 | 在指定空位放置己方棋子 |
| 类型 | 目标 (target) |
| 冷却 | 无 |
| 使用条件 | 指定目标位置且为空 |

### 1.2 设计理念

**棋子复制**是一个简单直接的进攻技能，允许玩家在任意空位放置一颗己方棋子，不消耗回合。适合用来补位或制造威胁。

**核心特点**:
- 🎯 需要选择目标位置
- ⚡ 不消耗回合
- 🛡️ 可用于防守或进攻
- ⚠️ 需要空位

---

## 2. 技能机制

### 2.1 使用条件

```typescript
canUse(context: SkillContext): boolean {
  const { gameState, targetPosition } = context;
  if (!targetPosition) return false;
  return gameState.board[targetPosition.row][targetPosition.col] === null;
}
```

### 2.2 执行逻辑

```typescript
execute(context: SkillContext): GameState {
  const { gameState, currentPlayer, targetPosition } = context;
  
  if (!targetPosition) return gameState;
  
  if (gameState.board[targetPosition.row][targetPosition.col] !== null) {
    return gameState;
  }
  
  const newBoard = gameState.board.map(row => [...row]);
  newBoard[targetPosition.row][targetPosition.col] = currentPlayer.color;
  
  return {
    ...gameState,
    board: newBoard,
    currentPlayer: gameState.currentPlayer === 'black' ? 'white' : 'black',
    turn: gameState.turn + 1,
  };
}
```

---

## 3. 视觉设计

**颜色方案**:
```css
/* 稀有级渐变 */
background: linear-gradient(135deg, #3b82f6, #2563eb);
border: 2px solid rgba(59, 130, 246, 0.5);
```

**图标**: `Copy` from lucide-react

---

## 4. 动画设计

- 目标位置高亮
- 棋子放置动画
- 光晕效果

---

## 5. 代码实现

```typescript
export const CloneSkill: Skill = {
  id: 'clone',
  name: '棋子复制',
  description: '在指定空位放置己方棋子',
  type: 'target',
  priority: 15,
  
  canUse(context: SkillContext): boolean {
    const { gameState, targetPosition } = context;
    if (!targetPosition) return false;
    return gameState.board[targetPosition.row][targetPosition.col] === null;
  },
  
  execute(context: SkillContext): GameState {
    const { gameState, currentPlayer, targetPosition } = context;
    
    if (!targetPosition || gameState.board[targetPosition.row][targetPosition.col] !== null) {
      return gameState;
    }
    
    const newBoard = gameState.board.map(row => [...row]);
    newBoard[targetPosition.row][targetPosition.col] = currentPlayer.color;
    
    return {
      ...gameState,
      board: newBoard,
      currentPlayer: gameState.currentPlayer === 'black' ? 'white' : 'black',
      turn: gameState.turn + 1,
    };
  },
};
```

---

**更新日志**: 2026-02-24 创建
