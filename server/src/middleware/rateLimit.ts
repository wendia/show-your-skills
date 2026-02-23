/**
 * 请求频率限制中间件
 */

import rateLimit from 'express-rate-limit';

// 通用限制：每个 IP 每 15 分钟最多 100 个请求
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100,
  message: {
    error: '请求过于频繁，请稍后再试',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 认证限制：每个 IP 每 15 分钟最多 5 次登录尝试
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 5,
  message: {
    error: '登录尝试次数过多，请 15 分钟后再试',
    retryAfter: '15 minutes',
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // 成功的请求不计入限制
});

// 注册限制：每个 IP 每 1 小时最多 3 次注册
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 小时
  max: 3,
  message: {
    error: '注册请求过于频繁，请 1 小时后再试',
    retryAfter: '1 hour',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API 限制：每个 IP 每分钟最多 60 个请求
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 分钟
  max: 60,
  message: {
    error: 'API 请求过于频繁，请稍后再试',
    retryAfter: '1 minute',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 游戏操作限制：每个 IP 每秒最多 10 个请求
export const gameLimiter = rateLimit({
  windowMs: 1000, // 1 秒
  max: 10,
  message: {
    error: '游戏操作过于频繁',
    retryAfter: '1 second',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// 聊天限制：每个 IP 每秒最多 3 条消息
export const chatLimiter = rateLimit({
  windowMs: 1000, // 1 秒
  max: 3,
  message: {
    error: '发送消息过快，请稍后再试',
    retryAfter: '1 second',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
