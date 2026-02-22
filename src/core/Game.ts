/**
 * 游戏核心逻辑
 */

import { 
  GameState, 
  GameConfig, 
  DEFAULT_CONFIG, 
  Position, 
  StoneColor,
  GameAction 
} from '../types';

// 创建空棋盘
export function createEmptyBoard(size: number): StoneColor[][] {
  return Array(size).fill(null).map(() => Array(size).fill(null));
}

// 创建初始游戏状态
export function createInitialGameState(config: GameConfig = DEFAULT_CONFIG): GameState {
  return {
    boardSize: config.boardSize,
    board: createEmptyBoard(config.boardSize),
    currentPlayer: 'black',
    players: {
      black: {
        id: 'black',
        name: '黑方',
        color: 'black',
        skillCards: [],
      },
      white: {
        id: 'white',
        name: '白方',
        color: 'white',
        skillCards: [],
      },
    },
    phase: 'playing',
    winner: null,
    history: [],
    turn: 1,
    // 技能相关
    blockedZones: [],
    remainingMoves: 1,
  };
}

// 检查位置是否在棋盘内
export function isValidPosition(position: Position, boardSize: number): boolean {
  return position.row >= 0 
    && position.row < boardSize 
    && position.col >= 0 
    && position.col < boardSize;
}

// 检查位置是否为空
export function isEmptyPosition(board: StoneColor[][], position: Position): boolean {
  return board[position.row][position.col] === null;
}

// 落子
export function placeStone(
  state: GameState, 
  position: Position
): GameState | null {
  // 验证
  if (!isValidPosition(position, state.boardSize)) {
    return null;
  }
  
  if (!isEmptyPosition(state.board, position)) {
    return null;
  }
  
  if (state.phase !== 'playing') {
    return null;
  }
  
  // 检查是否在封锁区域内
  if (isPositionBlocked(position, state.blockedZones, state.turn)) {
    console.log('该位置被封锁！');
    return null;
  }
  
  // 创建新棋盘
  const newBoard = state.board.map(row => [...row]);
  newBoard[position.row][position.col] = state.currentPlayer;
  
  // 记录动作
  const action: GameAction = {
    type: 'place',
    player: state.currentPlayer,
    position,
    timestamp: Date.now(),
  };
  
  // 检查胜利
  const winner = checkWinner(newBoard, position, state.currentPlayer);
  
  // 清理过期的封锁区域
  const cleanedBlockedZones = cleanExpiredBlocks(state.blockedZones, state.turn);
  
  // 处理双子情况
  const newRemainingMoves = state.remainingMoves - 1;
  const shouldSwitchPlayer = newRemainingMoves <= 0;
  const nextPlayer = shouldSwitchPlayer 
    ? (state.currentPlayer === 'black' ? 'white' : 'black')
    : state.currentPlayer;
  const nextTurn = shouldSwitchPlayer ? state.turn + 1 : state.turn;
  
  return {
    ...state,
    board: newBoard,
    currentPlayer: winner ? state.currentPlayer : nextPlayer,
    history: [...state.history, action],
    turn: nextTurn,
    phase: winner ? 'ended' : 'playing',
    winner,
    blockedZones: cleanedBlockedZones,
    remainingMoves: shouldSwitchPlayer ? 1 : newRemainingMoves,
  };
}

// 检查胜利
export function checkWinner(
  board: StoneColor[][], 
  lastPosition: Position, 
  color: 'black' | 'white'
): 'black' | 'white' | null {
  const directions = [
    [0, 1],   // 水平
    [1, 0],   // 垂直
    [1, 1],   // 对角线
    [1, -1],  // 反对角线
  ];
  
  for (const [dr, dc] of directions) {
    let count = 1;
    
    // 正向
    for (let i = 1; i < 5; i++) {
      const r = lastPosition.row + dr * i;
      const c = lastPosition.col + dc * i;
      
      if (r < 0 || r >= board.length || c < 0 || c >= board.length) {
        break;
      }
      
      if (board[r][c] === color) {
        count++;
      } else {
        break;
      }
    }
    
    // 反向
    for (let i = 1; i < 5; i++) {
      const r = lastPosition.row - dr * i;
      const c = lastPosition.col - dc * i;
      
      if (r < 0 || r >= board.length || c < 0 || c >= board.length) {
        break;
      }
      
      if (board[r][c] === color) {
        count++;
      } else {
        break;
      }
    }
    
    if (count >= 5) {
      return color;
    }
  }
  
  return null;
}

// 检查棋盘是否已满
export function isBoardFull(board: StoneColor[][]): boolean {
  return board.every(row => row.every(cell => cell !== null));
}

// 检查位置是否在封锁区域内
export function isPositionBlocked(
  position: Position, 
  blockedZones: import('../types').BlockedZone[],
  currentTurn: number
): boolean {
  for (const zone of blockedZones) {
    // 检查封锁是否已过期
    if (currentTurn > zone.expiresAfterTurn) {
      continue;
    }
    
    // 检查是否在 3x3 范围内
    const { centerPosition } = zone;
    const rowDiff = Math.abs(position.row - centerPosition.row);
    const colDiff = Math.abs(position.col - centerPosition.col);
    
    if (rowDiff <= 1 && colDiff <= 1) {
      return true;
    }
  }
  
  return false;
}

// 清理过期的封锁区域
export function cleanExpiredBlocks(
  blockedZones: import('../types').BlockedZone[],
  currentTurn: number
): import('../types').BlockedZone[] {
  return blockedZones.filter(zone => currentTurn <= zone.expiresAfterTurn);
}

// 获取所有棋子
export function getAllStones(board: StoneColor[][]): { position: Position; color: 'black' | 'white' }[] {
  const stones: { position: Position; color: 'black' | 'white' }[] = [];
  
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[row].length; col++) {
      if (board[row][col]) {
        stones.push({
          position: { row, col },
          color: board[row][col]!,
        });
      }
    }
  }
  
  return stones;
}

// 切换棋子颜色
export function flipStone(color: 'black' | 'white'): 'black' | 'white' {
  return color === 'black' ? 'white' : 'black';
}

// 批量切换棋子颜色
export function flipStones(
  board: StoneColor[][], 
  positions: Position[]
): StoneColor[][] {
  const newBoard = board.map(row => [...row]);
  
  for (const pos of positions) {
    if (newBoard[pos.row][pos.col]) {
      newBoard[pos.row][pos.col] = flipStone(newBoard[pos.row][pos.col] as 'black' | 'white');
    }
  }
  
  return newBoard;
}

// 移除棋子
export function removeStones(
  board: StoneColor[][], 
  positions: Position[]
): StoneColor[][] {
  const newBoard = board.map(row => [...row]);
  
  for (const pos of positions) {
    newBoard[pos.row][pos.col] = null;
  }
  
  return newBoard;
}
