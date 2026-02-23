/**
 * 输入验证中间件
 */

import { body, param, query, validationResult, ValidationChain } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// 验证结果处理
export const validate = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: '输入验证失败',
      details: errors.array().map(err => ({
        field: err.param(),
        message: err.msg,
      })),
    });
  }
  
  next();
};

// 注册验证规则
export const registerValidation: ValidationChain[] = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('用户名长度应在 3-20 个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文'),
  
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 6, max: 50 })
    .withMessage('密码长度应在 6-50 个字符之间')
    .matches(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .withMessage('密码必须包含字母和数字'),
  
  validate,
];

// 登录验证规则
export const loginValidation: ValidationChain[] = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('密码不能为空'),
  
  validate,
];

// 游戏操作验证
export const gameActionValidation: ValidationChain[] = [
  body('roomId')
    .notEmpty()
    .withMessage('房间ID不能为空')
    .matches(/^room_\d+$/)
    .withMessage('无效的房间ID格式'),
  
  validate,
];

// 落子验证
export const placeStoneValidation: ValidationChain[] = [
  body('roomId')
    .notEmpty()
    .withMessage('房间ID不能为空'),
  
  body('position')
    .isObject()
    .withMessage('位置信息无效'),
  
  body('position.row')
    .isInt({ min: 0, max: 14 })
    .withMessage('行号应在 0-14 之间'),
  
  body('position.col')
    .isInt({ min: 0, max: 14 })
    .withMessage('列号应在 0-14 之间'),
  
  validate,
];

// 技能使用验证
export const useSkillValidation: ValidationChain[] = [
  body('roomId')
    .notEmpty()
    .withMessage('房间ID不能为空'),
  
  body('skillCardId')
    .notEmpty()
    .withMessage('技能卡ID不能为空'),
  
  body('targetPosition')
    .optional()
    .isObject()
    .withMessage('目标位置无效'),
  
  body('targetPosition.row')
    .optional()
    .isInt({ min: 0, max: 14 })
    .withMessage('目标行号应在 0-14 之间'),
  
  body('targetPosition.col')
    .optional()
    .isInt({ min: 0, max: 14 })
    .withMessage('目标列号应在 0-14 之间'),
  
  validate,
];

// 聊天验证
export const chatValidation: ValidationChain[] = [
  body('roomId')
    .notEmpty()
    .withMessage('房间ID不能为空'),
  
  body('message')
    .trim()
    .isLength({ min: 1, max: 500 })
    .withMessage('消息长度应在 1-500 个字符之间')
    .escape(),
  
  validate,
];

// 分页参数验证
export const paginationValidation: ValidationChain[] = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码应大于 0'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量应在 1-100 之间'),
  
  validate,
];
