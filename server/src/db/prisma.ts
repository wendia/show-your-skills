/**
 * Prisma Database Service
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default prisma;

// Helper functions for common operations

export async function createUser(username: string, email: string, password: string) {
  return prisma.user.create({
    data: {
      username,
      email,
      password,
    },
  });
}

export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

export async function findUserByUsername(username: string) {
  return prisma.user.findUnique({
    where: { username },
  });
}

export async function findUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
  });
}

export async function createGame(
  roomId: string,
  blackPlayerId: string,
  whitePlayerId: string
) {
  return prisma.game.create({
    data: {
      roomId,
      blackPlayerId,
      whitePlayerId,
      totalTurns: 0,
      boardState: '[]',
      skillCards: '{}',
      gameHistory: '[]',
    },
  });
}

export async function updateGameResult(
  roomId: string,
  winner: string | null,
  totalTurns: number,
  boardState: string,
  skillCards: string,
  gameHistory: string
) {
  return prisma.game.update({
    where: { roomId },
    data: {
      winner,
      totalTurns,
      boardState,
      skillCards,
      gameHistory,
      endedAt: new Date(),
    },
  });
}

export async function getUserStats(userId: string) {
  let stats = await prisma.userStats.findUnique({
    where: { userId },
  });

  if (!stats) {
    stats = await prisma.userStats.create({
      data: { userId },
    });
  }

  return stats;
}

export async function updateUserStats(userId: string, isWin: boolean) {
  const stats = await getUserStats(userId);

  return prisma.userStats.update({
    where: { userId },
    data: {
      wins: isWin ? stats.wins + 1 : stats.wins,
      losses: isWin ? stats.losses : stats.losses + 1,
    },
  });
}

export async function createGameSession(roomId: string, gameState: string) {
  return prisma.gameSession.create({
    data: {
      roomId,
      gameState,
    },
  });
}

export async function updateGameSession(roomId: string, gameState: string) {
  return prisma.gameSession.update({
    where: { roomId },
    data: { gameState },
  });
}

export async function deleteGameSession(roomId: string) {
  return prisma.gameSession.delete({
    where: { roomId },
  });
}
