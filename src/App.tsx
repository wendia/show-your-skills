import { useState, useEffect } from 'react';
import { authService } from './services/auth';
import { socketService } from './services/socket';
import { AuthPage } from './components/AuthPage';
import { Lobby } from './components/Lobby';
import { GameUI } from './components/GameUI';
import './App.css';

type AppMode = 'auth' | 'lobby' | 'offline-game' | 'online-game';

function App() {
  const [mode, setMode] = useState<AppMode>('auth');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [onlineRoom, setOnlineRoom] = useState<any>(null);

  useEffect(() => {
    // 检查是否已登录
    if (authService.isAuthenticated()) {
      setIsAuthenticated(true);
      setMode('lobby');
    }
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(authService.isAuthenticated());
    setMode('lobby');
  };

  const handleStartOfflineGame = () => {
    setMode('offline-game');
  };

  const handleMatchFound = async (data: any) => {
    console.log('匹配成功:', data);
    setOnlineRoom(data);
    setMode('online-game');
  };

  const handleBackToLobby = () => {
    setOnlineRoom(null);
    setMode('lobby');
  };

  // 渲染不同页面
  if (mode === 'auth') {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  if (mode === 'lobby') {
    return (
      <Lobby 
        onStartOfflineGame={handleStartOfflineGame}
        onMatchFound={handleMatchFound}
      />
    );
  }

  // 游戏页面（离线或在线）
  return (
    <div className="App">
      {/* 返回按钮 */}
      <button
        onClick={handleBackToLobby}
        style={{
          position: 'absolute',
          top: '10px',
          left: '10px',
          padding: '8px 16px',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          zIndex: 100,
        }}
      >
        ← 返回大厅
      </button>
      
      <GameUI />
      
      {/* 在线模式信息 */}
      {mode === 'online-game' && onlineRoom && (
        <div style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '10px 15px',
          backgroundColor: '#4CAF50',
          color: 'white',
          borderRadius: '4px',
          fontSize: '14px',
        }}>
          🌐 在线对战 | 房间: {onlineRoom.roomId?.slice(-6)}
        </div>
      )}
    </div>
  );
}

export default App;
