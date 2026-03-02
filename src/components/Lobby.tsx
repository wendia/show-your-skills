/**
 * 大厅组件
 */

import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import { authService } from '../services/auth';
import styles from './Lobby.module.scss';

interface LobbyProps {
  onStartOfflineGame: () => void;
  onMatchFound: (data: any) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStartOfflineGame, onMatchFound }) => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchStatus, setMatchStatus] = useState('');
  const user = authService.getStoredUser();

  useEffect(() => {
    socketService.onMatchFound((data) => {
      setIsMatching(false);
      onMatchFound(data);
    });

    socketService.onWaiting((data) => {
      setMatchStatus(data.message);
    });

    return () => {
      socketService.off('match_found');
      socketService.off('waiting');
    };
  }, []);

  const handleFindMatch = async () => {
    if (!authService.isAuthenticated()) {
      alert('请先登录');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (token) {
        await socketService.connect(token);
        setIsMatching(true);
        setMatchStatus('正在寻找对手...');
        socketService.findMatch();
      }
    } catch (error: any) {
      alert('连接失败: ' + error.message);
    }
  };

  const handleCancelMatch = () => {
    socketService.cancelMatch();
    setIsMatching(false);
    setMatchStatus('');
  };

  const handleLogout = () => {
    authService.logout();
    socketService.disconnect();
    window.location.reload();
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>🎮 技能五子棋</h1>
        <p className={styles.subtitle}>在线对战平台</p>

        {/* 用户信息 */}
        {user && (
          <div className={styles.userInfo}>
            <div className={styles.userName}>欢迎，{user.username}</div>
          </div>
        )}

        {/* 在线对战 */}
        <div className={styles.onlineSection}>
          <h3 className={styles.sectionTitle}>在线对战</h3>

          {!isMatching ? (
            <button
              onClick={handleFindMatch}
              disabled={!user}
              className={styles.matchBtn}
            >
              🎯 开始匹配
            </button>
          ) : (
            <div>
              <div className={styles.matchingBox}>
                <div className={styles.matchStatus}>{matchStatus}</div>
                <div className={styles.matchHint}>匹配中...</div>
              </div>
              <button onClick={handleCancelMatch} className={styles.cancelBtn}>
                取消匹配
              </button>
            </div>
          )}
        </div>

        {/* 离线模式 */}
        <div className={styles.offlineSection}>
          <h4 className={styles.offlineTitle}>离线模式</h4>
          <button onClick={onStartOfflineGame} className={styles.offlineBtn}>
            🎮 本地对战（双人同屏）
          </button>
        </div>

        {/* 退出登录 */}
        {user && (
          <button onClick={handleLogout} className={styles.logoutBtn}>
            退出登录
          </button>
        )}
      </div>
    </div>
  );
};
