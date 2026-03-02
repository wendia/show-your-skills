# 技能卡设计：倒转乾坤

**技能ID**: reverse_chaos
**稀有度**: 传说 (Legendary)
**类型**: 瞬发技能
**优先级**: 10

---

## 1. 技能概述

### 1.1 基本信息

| 属性 | 值 |
|------|------|
| 名称 | 倒转乾坤 |
| 描述 | 随机反转棋面上 30% 的棋子颜色 |
| 类型 | 瞬发 (instant) |
| 冷却 | 无 |
| 使用条件 | 棋盘上至少有 3 颗棋子 |

### 1.2 设计理念

**倒转乾坤**是一个高风险高回报的技能，能够在劣势时扭转战局。通过随机反转大量棋子的颜色，打破现有的棋局平衡，为使用者创造新的机会。

**核心特点**:
- 🎲 随机性强，不可预测
- ⚡ 瞬间改变战局
- 🎯 适合劣势时使用
- ⚠️ 可能反转自己的棋子

---

## 2. 技能机制

### 2.1 使用条件

```typescript
canUse(context: SkillContext): boolean {
  const stones = getAllStones(context.gameState.board);
  return stones.length >= 3;
}
```

**条件说明**:
- 棋盘上必须有至少 3 颗棋子
- 任何回合都可以使用
- 不需要指定目标位置

### 2.2 执行逻辑

```typescript
execute(context: SkillContext): GameState {
  const { gameState } = context;
  const stones = getAllStones(gameState.board);
  
  // 计算反转数量（30%，至少1颗）
  const flipCount = Math.max(1, Math.floor(stones.length * 0.3));
  
  // 随机选择要反转的棋子
  const shuffled = [...stones].sort(() => Math.random() - 0.5);
  const toFlip = shuffled.slice(0, flipCount).map(s => s.position);
  
  // 执行反转
  const newBoard = flipStones(gameState.board, toFlip);
  
  return {
    ...gameState,
    board: newBoard,
  };
}
```

**执行步骤**:
1. 获取棋盘上所有棋子
2. 计算反转数量（30%）
3. 随机选择要反转的棋子
4. 执行颜色反转
5. 更新棋盘状态

### 2.3 反转数量计算

| 棋子总数 | 反转数量 | 反转比例 |
|---------|---------|---------|
| 3 | 1 | 33% |
| 10 | 3 | 30% |
| 20 | 6 | 30% |
| 50 | 15 | 30% |
| 100 | 30 | 30% |

---

## 3. 视觉设计

### 3.1 卡牌外观

**传说级卡片样式**:

```
┌─────────────────────────┐
│  ⚡ 倒转乾坤    [传说]   │
│  ─────────────────      │
│                         │
│     🌪️                 │
│                         │
│  随机反转棋面上30%      │
│  的棋子颜色             │
│                         │
│  ━━━━━━━━━━━━━━━        │
│  [使用技能]             │
└─────────────────────────┘
```

**颜色方案**:
```css
/* 传说级渐变 */
background: linear-gradient(135deg, #f59e0b, #ea580c);
border: 2px solid rgba(251, 191, 36, 0.5);
box-shadow: 0 0 40px rgba(251, 146, 60, 0.4);
```

### 3.2 图标设计

**图标**: 旋涡/龙卷风图标
```tsx
import { RefreshCcw } from 'lucide-react';

<RefreshCcw className="w-12 h-12 text-yellow-400" />
```

**备选图标**:
- `RefreshCcw` - 刷新旋转
- `Shuffle` - 洗牌
- `Repeat` - 重复

---

## 4. 动画设计

### 4.1 使用动画

**阶段1: 选中棋子高亮** (0.5秒)
```css
.selected-stone {
  animation: pulse 0.5s ease-in-out;
  box-shadow: 0 0 20px rgba(251, 146, 60, 0.8);
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

**阶段2: 棋子翻转** (1秒)
```css
.flip-animation {
  animation: flip 1s ease-in-out;
}

@keyframes flip {
  0% { transform: rotateY(0deg); }
  50% { transform: rotateY(90deg); }
  100% { transform: rotateY(180deg); }
}
```

**阶段3: 颜色变化** (0.3秒)
```css
.color-change {
  animation: colorFlash 0.3s ease-out;
}

@keyframes colorFlash {
  0% { filter: brightness(2); }
  100% { filter: brightness(1); }
}
```

### 4.2 Framer Motion 实现

```tsx
import { motion, AnimatePresence } from 'framer-motion';

const ReverseChaosAnimation = ({ stones, onComplete }) => {
  return (
    <AnimatePresence>
      {stones.map((stone, index) => (
        <motion.div
          key={stone.id}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 180 }}
          exit={{ rotateY: 0 }}
          transition={{
            delay: index * 0.1,
            duration: 0.5,
            ease: "easeInOut"
          }}
          onAnimationComplete={onComplete}
        >
          <Stone color={stone.newColor} />
        </motion.div>
      ))}
    </AnimatePresence>
  );
};
```

### 4.3 屏幕特效

**全屏特效**:
```tsx
const ScreenEffect = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.5 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 pointer-events-none"
  >
    {/* 旋涡粒子效果 */}
    <VortexParticles count={20} />
  </motion.div>
);
```

---

## 5. 音效设计

### 5.1 音效列表

| 时机 | 音效 | 描述 |
|------|------|------|
| 选中卡片 | `card_hover.mp3` | 轻柔的卡片摩擦声 |
| 使用技能 | `skill_activate.mp3` | 魔法激活声 |
| 棋子翻转 | `stone_flip.mp3` | 棋子翻转声（循环） |
| 完成反转 | `reverse_complete.mp3` | 轰鸣声 |

### 5.2 音效实现

```tsx
import { useSound } from '@/hooks/useSound';

const ReverseChaosSkill = () => {
  const playActivate = useSound('/sounds/skill_activate.mp3');
  const playFlip = useSound('/sounds/stone_flip.mp3');
  const playComplete = useSound('/sounds/reverse_complete.mp3');

  const handleUse = async () => {
    playActivate();
    
    for (const stone of stones) {
      await delay(100);
      playFlip();
    }
    
    playComplete();
  };
};
```

---

## 6. 平衡性设计

### 6.1 强度分析

**优势**:
- ✅ 能够瞬间改变战局
- ✅ 适合劣势时使用
- ✅ 随机性可能带来意外惊喜

**劣势**:
- ❌ 可能反转自己的棋子
- ❌ 结果不可控
- ❌ 可能帮助对手

### 6.2 数值平衡

| 参数 | 当前值 | 说明 |
|------|--------|------|
| 反转比例 | 30% | 适中，有足够影响 |
| 最少反转 | 1颗 | 保证技能有效 |
| 使用条件 | ≥3颗 | 早期可用 |

### 6.3 调整建议

**如果技能过强**:
- 降低反转比例（20%）
- 增加使用条件（≥5颗棋子）

**如果技能过弱**:
- 提高反转比例（40%）
- 增加额外效果（如获得1次额外落子）

---

## 7. 代码实现

### 7.1 完整实现

```typescript
// src/skills/cards/ReverseChaosSkill.ts
import { Skill, SkillContext, GameState, Position } from '../../types';
import { getAllStones, flipStones } from '../../core/Game';

export const ReverseChaosSkill: Skill = {
  id: 'reverse_chaos',
  name: '倒转乾坤',
  description: '随机反转棋面上 30% 的棋子颜色',
  type: 'instant',
  priority: 10,
  
  canUse(context: SkillContext): boolean {
    const stones = getAllStones(context.gameState.board);
    return stones.length >= 3;
  },
  
  execute(context: SkillContext): GameState {
    const { gameState } = context;
    const stones = getAllStones(gameState.board);
    
    // 计算反转数量
    const flipCount = Math.max(1, Math.floor(stones.length * 0.3));
    
    // 随机选择
    const shuffled = [...stones].sort(() => Math.random() - 0.5);
    const toFlip = shuffled.slice(0, flipCount).map(s => s.position);
    
    // 执行反转
    const newBoard = flipStones(gameState.board, toFlip);
    
    // 记录日志
    console.log(`[倒转乾坤] 反转了 ${toFlip.length} 颗棋子`);
    
    return {
      ...gameState,
      board: newBoard,
    };
  },
};
```

### 7.2 辅助函数

```typescript
// src/core/Game.ts

export function getAllStones(board: Board): Stone[] {
  const stones: Stone[] = [];
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col] !== null) {
        stones.push({
          position: { row, col },
          color: board[row][col],
        });
      }
    }
  }
  
  return stones;
}

export function flipStones(board: Board, positions: Position[]): Board {
  const newBoard = board.map(row => [...row]);
  
  for (const pos of positions) {
    const currentColor = newBoard[pos.row][pos.col];
    if (currentColor !== null) {
      newBoard[pos.row][pos.col] = currentColor === 'black' ? 'white' : 'black';
    }
  }
  
  return newBoard;
}
```

---

## 8. 测试用例

### 8.1 单元测试

```typescript
// tests/skills/ReverseChaosSkill.test.ts
import { ReverseChaosSkill } from '@/skills/cards/ReverseChaosSkill';
import { createTestContext } from '../utils';

describe('ReverseChaosSkill', () => {
  test('should require at least 3 stones', () => {
    const context = createTestContext({ stoneCount: 2 });
    expect(ReverseChaosSkill.canUse(context)).toBe(false);
  });
  
  test('should work with 3 stones', () => {
    const context = createTestContext({ stoneCount: 3 });
    expect(ReverseChaosSkill.canUse(context)).toBe(true);
  });
  
  test('should flip 30% of stones', () => {
    const context = createTestContext({ stoneCount: 10 });
    const newState = ReverseChaosSkill.execute(context);
    
    const flippedCount = countChangedStones(
      context.gameState.board,
      newState.board
    );
    
    expect(flippedCount).toBe(3); // 10 * 0.3 = 3
  });
  
  test('should flip at least 1 stone', () => {
    const context = createTestContext({ stoneCount: 3 });
    const newState = ReverseChaosSkill.execute(context);
    
    const flippedCount = countChangedStones(
      context.gameState.board,
      newState.board
    );
    
    expect(flippedCount).toBeGreaterThanOrEqual(1);
  });
});
```

### 8.2 集成测试

```typescript
// tests/integration/ReverseChaosSkill.test.ts
describe('ReverseChaosSkill Integration', () => {
  test('should trigger flip animation', async () => {
    const { getByTestId } = render(<GameBoard />);
    
    // 使用技能
    fireEvent.click(getByTestId('skill-reverse-chaos'));
    
    // 等待动画完成
    await waitFor(() => {
      expect(getByTestId('flip-animation')).toBeInTheDocument();
    });
  });
});
```

---

## 9. UI组件

### 9.1 卡片组件

```tsx
// src/components/game/SkillCard/ReverseChaosCard.tsx
import { motion } from 'framer-motion';
import { RefreshCcw } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface ReverseChaosCardProps {
  used: boolean;
  onUse: () => void;
}

export const ReverseChaosCard = ({ used, onUse }: ReverseChaosCardProps) => {
  return (
    <motion.div
      whileHover={!used ? { scale: 1.05 } : {}}
      whileTap={!used ? { scale: 0.95 } : {}}
    >
      <Card className={`
        relative overflow-hidden
        ${used ? 'opacity-50' : ''}
        bg-gradient-to-br from-yellow-600 to-orange-600
        border-2 border-yellow-500/50
        shadow-[0_0_40px_rgba(251,146,60,0.4)]
      `}>
        {/* 稀有度标签 */}
        <Badge className="absolute top-4 right-4 bg-yellow-400 text-black">
          传说
        </Badge>
        
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="w-6 h-6 text-yellow-300" />
            倒转乾坤
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          <p className="text-sm text-gray-200 mb-4">
            随机反转棋面上 30% 的棋子颜色
          </p>
          
          <Button
            onClick={onUse}
            disabled={used}
            className="w-full bg-yellow-500 hover:bg-yellow-400"
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

---

## 10. 更新日志

- **2026-02-24**: 创建倒转乾坤技能设计文档 v1.0
