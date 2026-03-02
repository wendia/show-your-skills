import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { gameWebSocket } from '@/multiplayer/websocket';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X } from 'lucide-react';

interface MatchmakingProps {
  onMatchFound: (roomId: string) => void;
  onCancel: () => void;
}

export function Matchmaking({ onMatchFound, onCancel }: MatchmakingProps) {
  const [status, setStatus] = useState<'searching' | 'found' | 'cancelled'>('searching');
  const [queueSize, setQueueSize] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    gameWebSocket.findGame({});

    const matchFoundUnsubscribe = gameWebSocket.on('match_found', (message) => {
      if ('roomId' in message) {
        setStatus('found');
        setTimeout(() => {
          onMatchFound(message.roomId as string);
        }, 1000);
      }
    });

    const matchingUnsubscribe = gameWebSocket.on('matching', (message) => {
      if ('queueSize' in message) {
        setQueueSize(message.queueSize as number);
      }
    });

    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);

    return () => {
      matchFoundUnsubscribe();
      matchingUnsubscribe();
      clearInterval(interval);
    };
  }, [onMatchFound]);

  const handleCancel = () => {
    gameWebSocket.send({ type: 'cancel_find' });
    setStatus('cancelled');
    onCancel();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          寻找对手
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8">
          {status === 'searching' && (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="w-16 h-16 mx-auto mb-4"
              >
                <div className="w-full h-full border-4 border-primary border-t-transparent rounded-full" />
              </motion.div>
              
              <div className="text-xl font-medium mb-2">
                正在寻找对手...
              </div>
              
              <div className="text-gray-500 mb-4">
                已等待 {formatTime(elapsedTime)}
                {queueSize > 0 && ` | 队列中: ${queueSize}人`}
              </div>

              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-2" />
                取消
              </Button>
            </>
          )}

          {status === 'found' && (
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-xl font-medium text-green-500"
            >
              找到对手！正在进入游戏...
            </motion.div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
