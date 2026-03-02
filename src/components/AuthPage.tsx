/**
 * 登录注册组件
 */

import React, { useState } from 'react';
import { authService } from '../services/auth';
import styles from './AuthPage.module.scss';

interface AuthPageProps {
  onAuthSuccess: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await authService.login(email, password);
      } else {
        if (!username.trim()) {
          throw new Error('请输入用户名');
        }
        await authService.register(username, email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>🎮 技能五子棋</h1>
        <h2 className={styles.subtitle}>{isLogin ? '登录' : '注册'}</h2>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className={styles.formGroup}>
              <label className={styles.label}>用户名</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={styles.input}
                placeholder="请输入用户名"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label className={styles.label}>邮箱</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={styles.input}
              placeholder="请输入邮箱"
            />
          </div>

          <div className={styles.formGroupLast}>
            <label className={styles.label}>密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={styles.input}
              placeholder="请输入密码"
            />
          </div>

          {error && <div className={styles.errorBox}>{error}</div>}

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? '处理中...' : (isLogin ? '登录' : '注册')}
          </button>
        </form>

        <div className={styles.switchLink}>
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '没有账号？立即注册' : '已有账号？立即登录'}
          </button>
        </div>

        <div className={styles.guestLink}>
          <button onClick={() => onAuthSuccess()}>
            游客模式（离线游玩）
          </button>
        </div>
      </div>
    </div>
  );
};
