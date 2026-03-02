# 技能卡设计：双子连珠

**技能ID**: double_move
**稀有度**: 传说 (Legendary)
**类型**: 瞬发技能
**优先级**: 30

---

## 1. 技能概述

| 属性 | 值 |
|------|------|
| 名称 | 双子连珠 |
| 描述 | 本回合可以连续落两子 |
| 类型 | 瞬发 (instant) |
| 使用条件 | 游戏进行中且剩余落子数为1 |

---

## 2. 技能机制

### 2.1 使用条件

```typescript
canUse(context: SkillContext): boolean {
  return context.gameState.phase === 'playing' && 
         context.gameState.remainingMoves === 1;
}
```

### 2.2 执行逻辑

```typescript
execute(context: SkillContext): GameState {
  const { gameState } = context;
  
  return {
    ...gameState,
    remainingMoves: 2,
  };
}
```

---

## 3. 视觉设计

**颜色方案**:
```css
background: linear-gradient(135deg, #f59e0b, #d97706);
border: 2px solid rgba(245, 158, 11, 0.5);
```

**图标**: `Target` from lucide-react

---

## 4. 动画设计

- 双子标志显示
- 连续落子提示
- 完成后恢复单次

---

## 5. 代码实现

```typescript
export const DoubleMoveSkill: Skill = {
  id: 'double_move',
  name: '双子连珠',
  description: '本回合可以连续落两子',
  type: 'instant',
  priority: 30,
  
  canUse(context: SkillContext): boolean {
    return context.gameState.phase === 'playing' && 
           context.gameState.remainingMoves === 1;
  },
  
  execute(context: SkillContext): GameState {
    const { gameState } = context;
    
    return {
      ...gameState,
      remainingMoves: 2,
    };
  },
};
```

---

**更新日志**: 2026-02-24 创建
