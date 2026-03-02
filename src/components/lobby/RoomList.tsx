import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gameWebSocket } from '@/multiplayer/websocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Lock, Play } from 'lucide-react';

interface Room {
  id: string;
  createdAt: number;
  skillPoolId: string;
  themeId: string;
  status: 'waiting' | 'playing' | 'ended';
  currentPlayers: number;
}

interface RoomListProps {
  onJoinRoom: (roomId: string) => void;
}

export function RoomList({ onJoinRoom }: RoomListProps) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = gameWebSocket.on('room_list', (message) => {
      if ('rooms' in message) {
        setRooms(message.rooms as Room[]);
        setLoading(false);
      }
    });

    gameWebSocket.send({ type: 'get_rooms' });

    return unsubscribe;
  }, []);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const getPoolName = (poolId: string) => {
    const names: Record<string, string> = {
      standard: '标准',
      chaos: '混乱',
      tactical: '战术',
    };
    return names[poolId] || poolId;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-400">加载房间列表...</div>
        </CardContent>
      </Card>
    );
  }

  if (rooms.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-400 mb-4">暂无等待中的房间</div>
          <p className="text-sm text-gray-500">创建一个新房间开始游戏</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5" />
          房间列表
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rooms.map((room) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <div className="font-medium">{room.id.slice(0, 8)}...</div>
                <div className="text-sm text-gray-500">
                  {getPoolName(room.skillPoolId)} | {formatTime(room.createdAt)}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-sm">
                  <Users className="w-4 h-4" />
                  <span>{room.currentPlayers}/2</span>
                </div>
                <Button
                  size="sm"
                  onClick={() => onJoinRoom(room.id)}
                  disabled={room.status !== 'waiting'}
                >
                  {room.status === 'waiting' ? '加入' : '游戏中'}
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
