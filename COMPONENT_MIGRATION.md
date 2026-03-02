# Component Migration Guide

This document tracks duplicate files and the canonical versions to use for new development.

## Duplicate Files Summary

### Components

| Legacy Path | Canonical Path | Status |
|-------------|----------------|--------|
| `src/components/SkillCard.tsx` | `src/components/game/SkillCard.tsx` | Deprecated |
| `src/components/Board.tsx` | `src/components/game/Board.tsx` | Deprecated |

### Skills

| Legacy Path | Canonical Path | Status |
|-------------|----------------|--------|
| `src/skills/SkillRegistry.ts` | `src/skills/core/SkillRegistry.ts` | Deprecated |
| `src/skills/cards/index.ts` | `src/skills/effects/index.ts` | Legacy API |

## Key Differences

### SkillCard

- **Legacy**: Inline styles, basic functionality, `SkillCardComponent` and `SkillCardList` exports
- **Modern**: Theme system integration, Framer Motion animations, flip animation, `SkillCard` export

### Board

- **Legacy**: Inline styles, uses gameStore directly
- **Modern**: Theme system integration, controlled component with props

### SkillRegistry

- **Legacy**: Uses `Skill` interface with `canUse()` and `execute()` methods on skill objects
- **Modern**: Uses `SkillDefinition` (config) + `SkillEffect` (implementation) pattern

## Migration Path

1. Update imports to use canonical paths
2. Replace inline styles with theme system
3. Convert skill definitions to config-based approach

## Files Still Using Legacy Components

- `src/App.tsx` - Uses `GameUI` (legacy)
- `src/components/GameUI.tsx` - Uses legacy `Board` and `SkillCard`
- `src/skills/cards/index.ts` - Uses legacy `SkillRegistry`

## When to Migrate

These legacy files are kept for backward compatibility. They can be removed once:
1. App.tsx is updated to use the modern GamePage
2. GameUI.tsx is either updated or removed
3. All skills are migrated to the effects system
