import { useState } from 'react';
import { motion } from 'framer-motion';
import { gameWebSocket } from '@/multiplayer/websocket';
import { useConfigStore } from '@/store/configStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Settings } from 'lucide-react';

interface CreateRoomProps {
  onRoomCreated: (roomId: string) => void;
}

export function CreateRoom({ onRoomCreated }: CreateRoomProps) {
  const [creating, setCreating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const { skillPoolId } = useConfigStore();

  const handleCreate = () => {
    setCreating(true);
    
    gameWebSocket.createRoom({
      skillPoolId,
      themeId: 'default',
      skillCountPerPlayer: 3,
      enableSkills: true,
    });

    const unsubscribe = gameWebSocket.on('room_created', (message) => {
      if ('roomId' in message) {
        setCreating(false);
        onRoomCreated(message.roomId as string);
        unsubscribe();
      }
    });

    const errorUnsubscribe = gameWebSocket.on('error', (message) => {
      if ('code' in message && message.code === 'CREATE_FAILED') {
        setCreating(false);
        errorUnsubscribe();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="w-5 h-5" />
          创建房间
        </CardTitle>
        <CardDescription>
          创建一个新房间，等待其他玩家加入
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">技能池: {skillPoolId}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              <Settings className="w-4 h-4 mr-1" />
              高级设置
            </Button>
          </div>

          {showAdvanced && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="space-y-3 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg"
            >
              <div>
                <label className="block text-sm font-medium mb-1">技能卡数量</label>
                <select className="w-full px-3 py-2 border rounded-md bg-background">
                  <option value="3">3张（推荐）</option>
                  <option value="5">5张</option>
                  <option value="0">0张（禁用技能）</option>
                </select>
              </div>
            </motion.div>
          )}

          <Button
            className="w-full"
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? '创建中...' : '创建房间'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
