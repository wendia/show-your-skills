/**
 * 大厅组件
 */

import React, { useState, useEffect } from 'react';
import { socketService } from '../services/socket';
import { authService } from '../services/auth';

interface LobbyProps {
  onStartOfflineGame: () => void;
  onMatchFound: (data: any) => void;
}

export const Lobby: React.FC<LobbyProps> = ({ onStartOfflineGame, onMatchFound }) => {
  const [isMatching, setIsMatching] = useState(false);
  const [matchStatus, setMatchStatus] = useState('');
  const user = authService.getStoredUser();

  useEffect(() => {
    // 设置 socket 事件监听
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
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        width: '500px',
        textAlign: 'center',
      }}>
        <h1 style={{ marginBottom: '10px', color: '#333' }}>🎮 技能五子棋</h1>
        <p style={{ color: '#666', marginBottom: '30px' }}>在线对战平台</p>

        {/* 用户信息 */}
        {user && (
          <div style={{
            padding: '15px',
            backgroundColor: '#e3f2fd',
            borderRadius: '8px',
            marginBottom: '20px',
          }}>
            <div style={{ fontWeight: 'bold', color: '#1976d2' }}>
              欢迎，{user.username}
            </div>
          </div>
        )}

        {/* 在线对战 */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ marginBottom: '15px', color: '#333' }}>在线对战</h3>
          
          {!isMatching ? (
            <button
              onClick={handleFindMatch}
              disabled={!user}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: user ? '#4CAF50' : '#ccc',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                cursor: user ? 'pointer' : 'not-allowed',
                marginBottom: '10px',
              }}
            >
              🎯 开始匹配
            </button>
          ) : (
            <div>
              <div style={{
                padding: '20px',
                backgroundColor: '#fff3e0',
                borderRadius: '8px',
                marginBottom: '10px',
              }}>
                <div style={{ marginBottom: '10px', color: '#e65100' }}>
                  {matchStatus}
                </div>
                <div style={{ color: '#666', fontSize: '14px' }}>
                  匹配中...
                </div>
              </div>
              <button
                onClick={handleCancelMatch}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                取消匹配
              </button>
            </div>
          )}
        </div>

        {/* 离线模式 */}
        <div style={{
          padding: '20px',
          backgroundColor: '#f5f5f5',
          borderRadius: '8px',
          marginBottom: '20px',
        }}>
          <h4 style={{ marginBottom: '10px', color: '#666' }}>离线模式</h4>
          <button
            onClick={onStartOfflineGame}
            style={{
              width: '100%',
              padding: '12px',
              backgroundColor: '#2196F3',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            🎮 本地对战（双人同屏）
          </button>
        </div>

        {/* 退出登录 */}
        {user && (
          <button
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: 'transparent',
              color: '#666',
              border: '1px solid #ddd',
              borderRadius: '8px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            退出登录
          </button>
        )}
      </div>
    </div>
  );
};
