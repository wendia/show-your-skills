import { Router } from 'express';
import { register, login, me } from '../controllers/authController';
import { authenticate } from '../middleware/auth';
import { registerValidation, loginValidation } from '../middleware/validator';
import { authLimiter, registerLimiter } from '../middleware/rateLimit';

const router = Router();

// 注册 - 需要验证和频率限制
router.post(
  '/register',
  registerLimiter,
  registerValidation,
  register
);

// 登录 - 需要验证和频率限制
router.post(
  '/login',
  authLimiter,
  loginValidation,
  login
);

// 获取当前用户信息
router.get('/me', authenticate, me);

export default router;
