/**
 * 认证控制器测试用例
 */

import { Request, Response } from 'express';
import { register, login } from '../controllers/authController';

// Mock Response
const mockResponse = (): Response => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Controller', () => {
  
  describe('POST /api/auth/register', () => {
    
    it('应该成功注册新用户', async () => {
      const req = {
        body: {
          username: 'testuser',
          email: 'test@example.com',
          password: 'password123'
        }
      } as Request;
      
      const res = mockResponse();
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '注册成功',
          user: expect.objectContaining({
            username: 'testuser',
            email: 'test@example.com'
          }),
          token: expect.any(String)
        })
      );
    });
    
    it('应该拒绝缺少字段 的注册请求', async () => {
      const req = {
        body: {
          username: 'testuser',
          // 缺少 email 和 password
        }
      } as Request;
      
      const res = mockResponse();
      
      await register(req, res);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: expect.any(String)
        })
      );
    });
    
    it('应该拒绝重复邮箱', async () => {
      // 第一次注册
      const req1 = {
        body: {
          username: 'user1',
          email: 'same@example.com',
          password: 'password123'
        }
      } as Request;
      const res1 = mockResponse();
      await register(req1, res1);
      
      // 第二次注册相同邮箱
      const req2 = {
        body: {
          username: 'user2',
          email: 'same@example.com',
          password: 'password456'
        }
      } as Request;
      const res2 = mockResponse();
      await register(req2, res2);
      
      expect(res2.status).toHaveBeenCalledWith(400);
    });
  });
  
  describe('POST /api/auth/login', () => {
    
    it('应该成功登录', async () => {
      // 先注册
      const registerReq = {
        body: {
          username: 'loginuser',
          email: 'login@example.com',
          password: 'password123'
        }
      } as Request;
      const registerRes = mockResponse();
      await register(registerReq, registerRes);
      
      // 再登录
      const loginReq = {
        body: {
          email: 'login@example.com',
          password: 'password123'
        }
      } as Request;
      const loginRes = mockResponse();
      
      await login(loginReq, loginRes);
      
      expect(loginRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: '登录成功',
          token: expect.any(String)
        })
      );
    });
    
    it('应该拒绝错误的密码', async () => {
      // 先注册
      const registerReq = {
        body: {
          username: 'wrongpass',
          email: 'wrongpass@example.com',
          password: 'correctpassword'
        }
      } as Request;
      const registerRes = mockResponse();
      await register(registerReq, registerRes);
      
      // 用错误密码登录
      const loginReq = {
        body: {
          email: 'wrongpass@example.com',
          password: 'wrongpassword'
        }
      } as Request;
      const loginRes = mockResponse();
      
      await login(loginReq, loginRes);
      
      expect(loginRes.status).toHaveBeenCalledWith(401);
    });
    
    it('应该拒绝不存在的用户', async () => {
      const req = {
        body: {
          email: 'nonexistent@example.com',
          password: 'password123'
        }
      } as Request;
      const res = mockResponse();
      
      await login(req, res);
      
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});

console.log('✓ 认证测试用例已定义');
