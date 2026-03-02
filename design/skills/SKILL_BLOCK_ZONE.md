# 技能卡设计：区域封锁

**技能ID**: block_zone
**稀有度**: 史诗 (Epic)
**类型**: 目标技能
**优先级**: 25

---

## 1. 技能概述

| 属性 | 值 |
|------|------|
| 名称 | 区域封锁 |
| 描述 | 封锁指定 3x3 区域一回合 |
| 类型 | 目标 (target) |
| 使用条件 | 游戏进行中 |

---

## 2. 技能机制

### 2.1 使用条件

```typescript
canUse(context: SkillContext): boolean {
  return context.gameState.phase === 'playing';
}
```

### 2.2 执行逻辑

```typescript
execute(context: SkillContext): GameState {
  const { gameState, currentPlayer, targetPosition } = context;
  
  const centerPos = targetPosition || { row: 7, col: 7 };
  
  const newBlock: BlockedZone = {
    centerPosition: centerPos,
    expiresAfterTurn: gameState.turn + 1,
    blockedBy: currentPlayer.color,
  };
  
  return {
    ...gameState,
    blockedZones: [...gameState.blockedZones, newBlock],
  };
}
```

---

## 3. 视觉设计

**颜色方案**:
```css
background: linear-gradient(135deg, #dc2626, #b91c1c);
border: 2px solid rgba(220, 38, 38, 0.5);
```

**图标**: `Ban` from lucide-react

---

## 4. 动画设计

- 封锁区域显示红色网格
- 禁止标志动画
- 回合结束自动解除

---

## 5. 代码实现

```typescript
export const BlockZoneSkill: Skill = {
  id: 'block_zone',
  name: '区域封锁',
  description: '封锁指定 3x3 区域一回合',
  type: 'target',
  priority: 25,
  
  canUse(context: SkillContext): boolean {
    return context.gameState.phase === 'playing';
  },
  
  execute(context: SkillContext): GameState {
    const { gameState, currentPlayer, targetPosition } = context;
    
    const centerPos = targetPosition || { row: 7, col: 7 };
    
    const newBlock: BlockedZone = {
      centerPosition: centerPos,
      expiresAfterTurn: gameState.turn + 1,
      blockedBy: currentPlayer.color,
    };
    
    return {
      ...gameState,
      blockedZones: [...gameState.blockedZones, newBlock],
    };
  },
};
```

---

**更新日志**: 2026-02-24 创建
