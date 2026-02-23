/**
 * 认证控制器 - 使用 Prisma 数据库
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma, { createUser, findUserByEmail, findUserByUsername, findUserById } from '../db/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// 注册
export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password } = req.body;

    // 验证
    if (!username || !email || !password) {
      return res.status(400).json({ error: '所有字段都是必填的' });
    }

    // 验证用户名长度
    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ error: '用户名长度应在 3-20 个字符之间' });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: '邮箱格式不正确' });
    }

    // 验证密码长度
    if (password.length < 6) {
      return res.status(400).json({ error: '密码长度至少为 6 个字符' });
    }

    // 检查用户是否已存在
    const existingEmail = await findUserByEmail(email);
    if (existingEmail) {
      return res.status(400).json({ error: '邮箱已被注册' });
    }

    const existingUsername = await findUserByUsername(username);
    if (existingUsername) {
      return res.status(400).json({ error: '用户名已被使用' });
    }

    // 加密密码
    const hashedPassword = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await createUser(username, email, hashedPassword);

    // 生成 token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      message: '注册成功',
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 登录
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 验证
    if (!email || !password) {
      return res.status(400).json({ error: '邮箱和密码都是必填的' });
    }

    // 查找用户
    const user = await findUserByEmail(email);

    if (!user) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: '邮箱或密码错误' });
    }

    // 生成 token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      message: '登录成功',
      user: { id: user.id, username: user.username, email: user.email },
      token,
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取当前用户
export const me = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await findUserById(userId);

    if (!user) {
      return res.status(404).json({ error: '用户不存在' });
    }

    res.json({ user: { id: user.id, username: user.username, email: user.email } });
  } catch (error) {
    console.error('获取用户错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};

// 获取用户战绩
export const getStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // 获取用户的游戏记录
    const gamesAsBlack = await prisma.game.findMany({
      where: { blackPlayerId: userId, winner: { not: null } },
    });
    
    const gamesAsWhite = await prisma.game.findMany({
      where: { whitePlayerId: userId, winner: { not: null } },
    });
    
    // 计算胜负
    let wins = 0;
    let losses = 0;
    
    gamesAsBlack.forEach(game => {
      if (game.winner === 'black') wins++;
      else losses++;
    });
    
    gamesAsWhite.forEach(game => {
      if (game.winner === 'white') wins++;
      else losses++;
    });
    
    const total = wins + losses;
    const winRate = total > 0 ? Math.round((wins / total) * 100) : 0;

    res.json({
      wins,
      losses,
      total,
      winRate,
    });
  } catch (error) {
    console.error('获取战绩错误:', error);
    res.status(500).json({ error: '服务器错误' });
  }
};
