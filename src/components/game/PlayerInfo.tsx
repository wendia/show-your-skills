import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayerState } from '@/config/types';
import { Crown, Clock, Zap } from 'lucide-react';

interface PlayerInfoProps {
  player: PlayerState;
  isCurrentTurn: boolean;
  timeRemaining?: number;
}

export function PlayerInfo({ player, isCurrentTurn, timeRemaining }: PlayerInfoProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const unusedSkills = player.skillCards.filter(card => !card.used).length;

  return (
    <motion.div
      animate={{
        scale: isCurrentTurn ? 1.02 : 1,
        boxShadow: isCurrentTurn
          ? '0 0 20px rgba(147, 51, 234, 0.5)'
          : '0 0 0px rgba(147, 51, 234, 0)',
      }}
      transition={{ duration: 0.3 }}
    >
      <Card
        className={cn(
          'min-w-64',
          player.color === 'black' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900',
          isCurrentTurn && 'ring-2 ring-purple-500'
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div
              className={cn(
                'w-12 h-12 rounded-full flex items-center justify-center',
                player.color === 'black' ? 'bg-gray-700' : 'bg-gray-200'
              )}
            >
              <Crown
                className={cn(
                  'w-6 h-6',
                  player.color === 'black' ? 'text-gray-300' : 'text-gray-700'
                )}
              />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold">{player.username}</span>
                {isCurrentTurn && (
                  <Badge variant="default" className="bg-purple-500">
                    当前回合
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-4 mt-2 text-sm opacity-80">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4" />
                  <span>{unusedSkills} 技能</span>
                </div>

                {timeRemaining !== undefined && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{formatTime(timeRemaining)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
