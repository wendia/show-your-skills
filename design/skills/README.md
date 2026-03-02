# 技能卡系统总览

**项目**: Show Your Skills (技能五子棋)
**更新时间**: 2026-02-24

---

## 技能卡列表

| ID | 名称 | 稀有度 | 类型 | 文档 |
|----|------|--------|------|------|
| reverse_chaos | 倒转乾坤 | 传说 | 瞬发 | [SKILL_REVERSE_CHAOS.md](SKILL_REVERSE_CHAOS.md) |
| time_warp | 时间回溯 | 史诗 | 瞬发 | [SKILL_TIME_WARP.md](SKILL_TIME_WARP.md) |
| clone | 棋子复制 | 稀有 | 目标 | [SKILL_CLONE.md](SKILL_CLONE.md) |
| block_zone | 区域封锁 | 史诗 | 目标 | [SKILL_BLOCK_ZONE.md](SKILL_BLOCK_ZONE.md) |
| double_move | 双子连珠 | 传说 | 瞬发 | [SKILL_DOUBLE_MOVE.md](SKILL_DOUBLE_MOVE.md) |

---

## 稀有度分布

- **传说** (Legendary): 2个
- **史诗** (Epic): 2个
- **稀有** (Rare): 1个

---

## 类型分布

- **瞬发技能** (Instant): 3个
- **目标技能** (Target): 2个

---

## 文档结构

```
design/skills/
├── README.md                    # 本文档
├── SKILL_REVERSE_CHAOS.md       # 倒转乾坤 (10K)
├── SKILL_TIME_WARP.md           # 时间回溯 (6K)
├── SKILL_CLONE.md               # 棋子复制 (2.4K)
├── SKILL_BLOCK_ZONE.md          # 区域封锁 (1.8K)
└── SKILL_DOUBLE_MOVE.md         # 双子连珠 (1.3K)
```

---

## 代码位置

```
src/skills/
├── SkillRegistry.ts             # 技能注册表
└── cards/
    ├── index.ts                 # 所有技能实现
    └── (未来可拆分为单独文件)
```

---

## 使用示例

```typescript
import { skillRegistry } from '../skills/SkillRegistry';
import { registerAllSkills } from '../skills/cards';

// 注册所有技能
registerAllSkills();

// 获取技能
const skill = skillRegistry.get('reverse_chaos');

// 检查可用性
if (skill.canUse(context)) {
  const newState = skill.execute(context);
}
```

---

## 设计原则

1. **平衡性**: 每个技能都有优势和劣势
2. **策略性**: 技能使用需要策略思考
3. **视觉反馈**: 技能效果有明显的视觉表现
4. **公平性**: 双方玩家拥有相同的技能卡

---

## 未来扩展

- 增加更多技能卡
- 技能卡组合效果
- 技能卡稀有度随机分配
- 技能卡升级系统

---

**更新日志**: 2026-02-24 创建技能卡总览
