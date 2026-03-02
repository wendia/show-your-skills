export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface ColorSet {
  light: string;
  dark: string;
}

export interface RarityStyle {
  gradient: string;
  border: string;
  glow: string;
  badge: string;
}

export interface CardStyle {
  borderRadius: number;
  shadowGlow: boolean;
  animationStyle: 'smooth' | 'snappy' | 'none';
  backgroundStyle: 'gradient' | 'solid' | 'pattern';
}

export interface BoardStyle {
  style: 'wood' | 'modern' | 'classic' | 'custom';
  gridColor: string;
  backgroundColor: string;
  stoneStyle: 'classic' | 'modern' | 'minimal';
}

export interface AnimationConfig {
  enabled: boolean;
  duration: number;
  easing: string;
  particleEffects: boolean;
}

export interface SoundConfig {
  enabled: boolean;
  volume: number;
  packId: string;
}

export interface ThemeConfig {
  id: string;
  name: string;
  version: string;
  colors: {
    primary: Partial<ColorScale>;
    secondary: Partial<ColorScale>;
    background: ColorSet;
    surface: ColorSet;
    text: ColorSet;
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

export interface SkillCondition {
  type: 'min_stones' | 'history_not_empty' | 'phase' | 'custom';
  value: unknown;
}

export interface SkillUIConfig {
  icon: string;
  animationId: string;
  soundId: string;
}

export interface SkillDefinition {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  type: 'instant' | 'target' | 'passive';
  priority: number;
  effectId: string;
  conditions: SkillCondition[];
  params: Record<string, unknown>;
  ui: SkillUIConfig;
}

export interface DistributionConfig {
  method: 'random' | 'balanced' | 'choice';
  countPerPlayer: number;
  allowDuplicates: boolean;
  balanceByRarity: boolean;
}

export interface SkillPoolConfig {
  id: string;
  name: string;
  description: string;
  skills: SkillDefinition[];
  distribution: DistributionConfig;
  weights?: Record<string, number>;
}

export interface ServerConfig {
  server: {
    port: number;
    host: string;
    corsOrigins: string[];
  };
  game: {
    defaultBoardSize: number;
    defaultSkillCountPerPlayer: number;
    defaultSkillPoolId: string;
    defaultThemeId: string;
  };
  database: {
    path: string;
    walMode: boolean;
  };
  websocket: {
    heartbeatInterval: number;
    heartbeatTimeout: number;
    maxConnections: number;
  };
}

export type Stone = 'black' | 'white';

export type Board = (Stone | null)[][];

export interface Position {
  row: number;
  col: number;
}

export interface HistoryMove {
  type: 'place' | 'skill';
  position?: Position;
  player: Stone;
  skillId?: string;
}

export interface SkillCard {
  id: string;
  skillId: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  used: boolean;
}

export interface BlockedZone {
  centerPosition: Position;
  expiresAfterTurn: number;
  blockedBy: Stone;
}

export interface PlayerState {
  id: string;
  username: string;
  color: Stone;
  skillCards: SkillCard[];
  timeRemaining?: number;
}

export interface GameState {
  id: string;
  board: Board;
  currentPlayer: Stone;
  phase: 'waiting' | 'playing' | 'ended';
  winner?: Stone | 'draw';
  players: {
    black: PlayerState;
    white: PlayerState;
  };
  history: HistoryMove[];
  turn: number;
  remainingMoves: number;
  blockedZones: BlockedZone[];
}
