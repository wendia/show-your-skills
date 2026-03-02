# Frontend Incomplete Components Workplan

**Project**: Show Your Skills (技能五子棋)
**Version**: v2.1
**Created**: 2026-02-25
**Focus**: Complete missing frontend components per design document

---

## Overview

This workplan addresses all incomplete/missing components identified during the frontend validation against the design document (`design/FRONTEND_DESIGN.md`) and workplan (`WORKPLAN.md`).

### Priority Classification

| Priority | Category | Components |
|----------|----------|------------|
| P0 - Critical | Core Functionality | Themed Components, Custom Hooks |
| P1 - High | User Experience | AI Thinking Indicator, Turn Timer Integration |
| P2 - Medium | Features | Avatar Upload, Card Flip Animation |
| P3 - Low | Code Quality | Duplicate File Cleanup, ESLint/Prettier |

---

## Phase 1: Themed Components (P0)

**Goal**: Implement the themed component layer as specified in design section 7.

### 1.1 ThemedCard Component

**File**: `src/components/themed/ThemedCard.tsx`

**Design Spec** (from FRONTEND_DESIGN.md):
```tsx
// A wrapper component that applies theme styling to any card
// Uses rarity styles from current theme
// Supports glow effects, gradients, and border styling
```

**Tasks**:
- [ ] Create `src/components/themed/` directory
- [ ] Implement ThemedCard with theme-aware styling
- [ ] Support rarity prop (common/rare/epic/legendary)
- [ ] Apply gradient, border, glow from theme
- [ ] Support borderRadius from card style config
- [ ] Add unit tests

### 1.2 ThemedBadge Component

**File**: `src/components/themed/ThemedBadge.tsx`

**Design Spec**:
```tsx
// Theme-aware badge component for displaying rarity
// Uses badge style from current theme's rarity config
```

**Tasks**:
- [ ] Implement ThemedBadge component
- [ ] Support rarity prop
- [ ] Apply badge style from theme
- [ ] Add unit tests

### 1.3 ThemedBoard Component

**File**: `src/components/themed/ThemedBoard.tsx`

**Design Spec**:
```tsx
// Theme-aware board component
// Applies board style from theme (wood/modern/classic/custom)
// Uses gridColor, backgroundColor, stoneStyle from theme
```

**Tasks**:
- [ ] Implement ThemedBoard wrapper
- [ ] Apply board style from theme config
- [ ] Support style variants (wood/modern/classic)
- [ ] Apply stoneStyle (classic/modern/minimal)
- [ ] Add unit tests

---

## Phase 2: Custom Hooks (P0)

**Goal**: Create custom hooks layer as specified in design section 3.1.

### 2.1 useGame Hook

**File**: `src/hooks/useGame.ts`

**Design Spec**:
```tsx
// Convenience hook for game operations
// Wraps gameStore with common operations
// Provides: gameState, startGame, placeStone, useSkill, resetGame
```

**Tasks**:
- [ ] Create `src/hooks/` directory
- [ ] Implement useGame hook
- [ ] Export common game operations
- [ ] Add TypeScript types
- [ ] Add unit tests

### 2.2 useConfig Hook

**File**: `src/hooks/useConfig.ts`

**Design Spec**:
```tsx
// Hook for accessing configuration
// Provides: skillPool, setSkillPool, themes, skillPools
```

**Tasks**:
- [ ] Implement useConfig hook
- [ ] Provide access to configStore
- [ ] Provide access to configManager
- [ ] Add unit tests

### 2.3 useSkillPool Hook

**File**: `src/hooks/useSkillPool.ts`

**Design Spec**:
```tsx
// Hook for skill pool operations
// Provides: currentPool, drawCards, loadPool
```

**Tasks**:
- [ ] Implement useSkillPool hook
- [ ] Wrap SkillPoolManager operations
- [ ] Support card drawing
- [ ] Add unit tests

---

## Phase 3: AI Thinking Indicator (P1)

**Goal**: Implement visual feedback when AI is calculating moves.

### 3.1 AIThinkingIndicator Component

**File**: `src/components/game/AIThinkingIndicator.tsx`

**Design Spec** (from WORKPLAN Phase 11.2):
```tsx
// Shows animated indicator when AI is thinking
// Displays thinking dots animation or progress
// Integrates with AI turn detection
```

**Tasks**:
- [ ] Create AIThinkingIndicator component
- [ ] Add animated thinking dots (CSS or Framer Motion)
- [ ] Integrate with gameStore to detect AI turn
- [ ] Add prop for AI difficulty display
- [ ] Add unit tests

### 3.2 Integration

**Tasks**:
- [ ] Integrate into GamePage when playing vs AI
- [ ] Show during AI calculation period
- [ ] Hide when AI move is complete

---

## Phase 4: Turn Timer Integration (P1)

**Goal**: Complete turn timer functionality in game.

### 4.1 TurnTimer Enhancement

**File**: `src/components/game/TurnTimer.tsx` (exists, needs enhancement)

**Tasks**:
- [ ] Review existing TurnTimer component
- [ ] Add countdown functionality
- [ ] Add time-up handling (auto-forfeit or skip)
- [ ] Add visual warning when time is low
- [ ] Add pause/resume for game pauses
- [ ] Add unit tests

### 4.2 Store Integration

**Tasks**:
- [ ] Add timer state to gameStore if not present
- [ ] Add timer actions (start, pause, reset)
- [ ] Sync timer with turn changes

---

## Phase 5: Avatar Upload (P2)

**Goal**: Allow users to upload custom avatars.

### 5.1 AvatarUpload Component

**File**: `src/components/user/AvatarUpload.tsx` (exists as stub)

**Design Spec** (from WORKPLAN Phase 10.3):
```tsx
// File upload component for user avatar
// Supports image preview, crop, validation
// Integrates with user API
```

**Tasks**:
- [ ] Review existing AvatarUpload component
- [ ] Add file input with drag-and-drop
- [ ] Add image preview
- [ ] Add image cropping (optional)
- [ ] Add file validation (size, type)
- [ ] Integrate with user API for upload
- [ ] Add loading/error states
- [ ] Add unit tests

### 5.2 Backend Support

**Tasks**:
- [ ] Add avatar upload endpoint to server (if not exists)
- [ ] Add file storage handling
- [ ] Add avatar URL to user profile

---

## Phase 6: Card Flip Animation (P2)

**Goal**: Add flip animation to skill cards.

### 6.1 SkillCard Flip Animation

**File**: `src/components/game/SkillCard.tsx` (enhance existing)

**Design Spec** (from WORKPLAN Phase 5.2):
```tsx
// 3D flip animation when viewing card details
// Front: Card preview, Back: Full description
```

**Tasks**:
- [ ] Add 3D CSS transform for flip
- [ ] Add front/back card faces
- [ ] Add click to flip interaction
- [ ] Use Framer Motion for smooth animation
- [ ] Preserve existing functionality
- [ ] Add unit tests

---

## Phase 7: Duplicate File Cleanup (P3)

**Goal**: Consolidate duplicate components and files.

### 7.1 Component Consolidation

**Duplicates Found**:
- `src/components/SkillCard.tsx` ↔ `src/components/game/SkillCard.tsx`
- `src/components/Board.tsx` ↔ `src/components/game/Board.tsx`

**Tasks**:
- [ ] Identify canonical version of each component
- [ ] Merge any unique functionality
- [ ] Update all imports to use canonical path
- [ ] Remove duplicate files
- [ ] Verify no regressions

### 7.2 SkillRegistry Consolidation

**Duplicates Found**:
- `src/skills/SkillRegistry.ts` ↔ `src/skills/core/SkillRegistry.ts`

**Tasks**:
- [ ] Identify canonical version
- [ ] Update imports
- [ ] Remove duplicate

---

## Phase 8: ESLint + Prettier (P3)

**Goal**: Add code quality tooling.

### 8.1 ESLint Configuration

**Tasks**:
- [ ] Install ESLint and plugins
- [ ] Create `.eslintrc.json` for frontend
- [ ] Configure React/TypeScript rules
- [ ] Add lint script to package.json
- [ ] Run and fix linting errors

### 8.2 Prettier Configuration

**Tasks**:
- [ ] Install Prettier
- [ ] Create `.prettierrc` config
- [ ] Add format script
- [ ] Integrate with ESLint
- [ ] Format existing code

---

## File Structure After Completion

```
src/
├── components/
│   ├── themed/                    # 🆕 NEW
│   │   ├── ThemedCard.tsx
│   │   ├── ThemedBadge.tsx
│   │   └── ThemedBoard.tsx
│   ├── game/
│   │   ├── AIThinkingIndicator.tsx  # 🆕 NEW
│   │   ├── TurnTimer.tsx            # ✏️ ENHANCED
│   │   └── ...
│   ├── user/
│   │   ├── AvatarUpload.tsx         # ✏️ ENHANCED
│   │   └── ...
│   └── ...
│
├── hooks/                         # 🆕 NEW DIRECTORY
│   ├── useGame.ts
│   ├── useConfig.ts
│   └── useSkillPool.ts
│
└── ...
```

---

## Test Coverage Requirements

Each new component requires:

1. **Unit Tests**: Test component rendering and behavior
2. **Integration Tests**: Test component with store/theme
3. **Accessibility Tests**: Ensure keyboard/screen reader support

Test files should be placed in:
- `src/components/themed/__tests__/`
- `src/hooks/__tests__/`
- `src/components/game/__tests__/`

---

## Estimated Effort

| Phase | Components | Estimated Time |
|-------|------------|----------------|
| Phase 1 | Themed Components (3) | 4 hours |
| Phase 2 | Custom Hooks (3) | 2 hours |
| Phase 3 | AI Thinking Indicator | 2 hours |
| Phase 4 | Turn Timer Integration | 3 hours |
| Phase 5 | Avatar Upload | 4 hours |
| Phase 6 | Card Flip Animation | 2 hours |
| Phase 7 | Duplicate Cleanup | 2 hours |
| Phase 8 | ESLint/Prettier | 2 hours |
| **Total** | | **21 hours** |

---

## Dependencies

```
Phase 1 (Themed Components)
    ↓
Phase 2 (Custom Hooks) ← can run in parallel
    ↓
Phase 3-6 (Feature components) ← can run in parallel after Phase 1-2
    ↓
Phase 7 (Cleanup) ← run after feature work
    ↓
Phase 8 (Linting) ← run last
```

---

## Acceptance Criteria

- [ ] All themed components render with theme styles
- [ ] Custom hooks provide clean API to stores
- [ ] AI Thinking Indicator shows during AI turns
- [ ] Turn Timer counts down and handles time-up
- [ ] Avatar Upload allows image upload and preview
- [ ] Card Flip animation works on click
- [ ] No duplicate component files
- [ ] ESLint/Prettier configured with no errors
- [ ] All new code has unit tests
- [ ] All tests pass

---

## Next Steps

1. **Review and approve this workplan**
2. **Start with Phase 1 (Themed Components)**
3. **Create todo list for tracking**
4. **Implement incrementally with tests**

---

**Document Status**: Ready for Review
**Last Updated**: 2026-02-25
