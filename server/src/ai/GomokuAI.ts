import { Stone, GameState, Position } from '../skills/core/SkillRegistry.js';

const WINNING_COUNT = 5;
const BOARD_SIZE = 15;

const DIRECTIONS = [
  [0, 1],   // 水平
  [1, 0],   // 垂直
  [1, 1],   // 对角线
  [1, -1],  // 反对角线
];

type Board = (Stone | null)[][];

interface EvalResult {
  score: number;
}

export class GomokuAI {
  private maxDepth: number;
  private aiColor: Stone;
  private opponentColor: Stone;

  constructor(depth: number = 3, aiColor: Stone = 'white') {
    this.maxDepth = depth;
    this.aiColor = aiColor;
    this.opponentColor = aiColor === 'black' ? 'white' : 'black';
  }

  getBestMove(gameState: GameState): Position | null {
    const board = gameState.board;

    const validMoves = this.getValidMoves(board);
    if (validMoves.length === 0) return null;

    // 如果是第一步，下中心
    if (this.countStones(board) === 0) {
      return { row: 7, col: 7 };
    }

    let bestMove = validMoves[0];
    let bestScore = -Infinity;

    for (const move of validMoves) {
      const newBoard = this.makeMove(board, move, this.aiColor);
      const score = this.minimax(newBoard, this.maxDepth - 1, -Infinity, Infinity, false);

      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }

    return bestMove;
  }

  private minimax(
    board: Board,
    depth: number,
    alpha: number,
    beta: number,
    isMaximizing: boolean
  ): number {
    const winner = this.checkWinner(board);
    if (winner === this.aiColor) return 100000 + depth;
    if (winner === this.opponentColor) return -100000 - depth;
    if (depth === 0) return this.evaluateBoard(board);

    const validMoves = this.getValidMoves(board);
    if (validMoves.length === 0) return 0;

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (const move of validMoves) {
        const newBoard = this.makeMove(board, move, this.aiColor);
        const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, false);
        maxEval = Math.max(maxEval, evalScore);
        alpha = Math.max(alpha, evalScore);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (const move of validMoves) {
        const newBoard = this.makeMove(board, move, this.opponentColor);
        const evalScore = this.minimax(newBoard, depth - 1, alpha, beta, true);
        minEval = Math.min(minEval, evalScore);
        beta = Math.min(beta, evalScore);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  private evaluateBoard(board: Board): number {
    let score = 0;

    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== null) {
          const cellScore = this.evaluateCell(board, row, col);
          if (board[row][col] === this.aiColor) {
            score += cellScore;
          } else {
            score -= cellScore;
          }
        }
      }
    }

    return score;
  }

  private evaluateCell(board: Board, row: number, col: number): number {
    const stone = board[row][col];
    if (!stone) return 0;

    let score = 0;

    for (const [dr, dc] of DIRECTIONS) {
      const lineScore = this.evaluateLine(board, row, col, dr, dc, stone);
      score += lineScore;
    }

    return score;
  }

  private evaluateLine(
    board: Board,
    row: number,
    col: number,
    dr: number,
    dc: number,
    stone: Stone
  ): number {
    let count = 1;
    let openEnds = 0;

    // 正向
    let r = row + dr;
    let c = col + dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      if (board[r][c] === stone) {
        count++;
      } else if (board[r][c] === null) {
        openEnds++;
        break;
      } else {
        break;
      }
      r += dr;
      c += dc;
    }

    // 反向
    r = row - dr;
    c = col - dc;
    while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE) {
      if (board[r][c] === stone) {
        count++;
      } else if (board[r][c] === null) {
        openEnds++;
        break;
      } else {
        break;
      }
      r -= dr;
      c -= dc;
    }

    if (count >= 5) return 100000;
    if (count === 4 && openEnds >= 1) return 10000;
    if (count === 3 && openEnds >= 2) return 1000;
    if (count === 3 && openEnds === 1) return 100;
    if (count === 2 && openEnds >= 2) return 50;
    if (count === 2 && openEnds === 1) return 10;

    return count;
  }

  private getValidMoves(board: Board): Position[] {
    const moves: Position[] = [];
    const visited = new Set<string>();

    // 只考虑已有棋子周围的空位
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== null) {
          for (let dr = -2; dr <= 2; dr++) {
            for (let dc = -2; dc <= 2; dc++) {
              const nr = row + dr;
              const nc = col + dc;
              const key = `${nr},${nc}`;

              if (
                nr >= 0 && nr < BOARD_SIZE &&
                nc >= 0 && nc < BOARD_SIZE &&
                board[nr][nc] === null &&
                !visited.has(key)
              ) {
                visited.add(key);
                moves.push({ row: nr, col: nc });
              }
            }
          }
        }
      }
    }

    if (moves.length === 0) {
      moves.push({ row: 7, col: 7 });
    }

    return moves;
  }

  private makeMove(board: Board, position: Position, stone: Stone): Board {
    const newBoard = board.map(row => [...row]);
    newBoard[position.row][position.col] = stone;
    return newBoard;
  }

  private countStones(board: Board): number {
    let count = 0;
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] !== null) count++;
      }
    }
    return count;
  }

  private checkWinner(board: Board): Stone | null {
    for (let row = 0; row < BOARD_SIZE; row++) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        const stone = board[row][col];
        if (!stone) continue;

        for (const [dr, dc] of DIRECTIONS) {
          let count = 1;
          let r = row + dr;
          let c = col + dc;

          while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === stone) {
            count++;
            r += dr;
            c += dc;
          }

          if (count >= WINNING_COUNT) {
            return stone;
          }
        }
      }
    }

    return null;
  }
}

export function createAI(difficulty: 'easy' | 'medium' | 'hard', color: Stone = 'white'): GomokuAI {
  const depths = {
    easy: 1,
    medium: 2,
    hard: 3,
  };

  return new GomokuAI(depths[difficulty], color);
}
