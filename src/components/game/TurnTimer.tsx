import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Clock, AlertTriangle } from 'lucide-react';

interface TurnTimerProps {
  initialSeconds: number;
  onTimeout: () => void;
  isPaused?: boolean;
  isActive?: boolean;
}

export function TurnTimer({ initialSeconds, onTimeout, isPaused = false, isActive = true }: TurnTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [isWarning, setIsWarning] = useState(false);

  useEffect(() => {
    if (!isActive || isPaused) return;

    const interval = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, isPaused, onTimeout]);

  useEffect(() => {
    setIsWarning(seconds <= 30 && seconds > 0);
  }, [seconds]);

  const reset = useCallback(() => {
    setSeconds(initialSeconds);
  }, [initialSeconds]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = (seconds / initialSeconds) * 100;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            className="text-gray-700"
          />
          <motion.circle
            cx="40"
            cy="40"
            r="36"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className={cn(
              isWarning ? 'text-red-500' : 'text-green-500'
            )}
            style={{
              strokeDasharray: 226,
              strokeDashoffset: 226 - (226 * progress) / 100,
            }}
            animate={{
              strokeDashoffset: 226 - (226 * progress) / 100,
            }}
            transition={{ duration: 0.5 }}
          />
        </svg>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className={cn(
            'text-lg font-bold',
            isWarning && 'text-red-500 animate-pulse'
          )}>
            {formatTime(seconds)}
          </div>
        </div>
      </div>

      <div className={cn(
        'flex items-center gap-1 text-sm',
        isWarning ? 'text-red-500' : 'text-gray-400'
      )}>
        {isWarning ? (
          <>
            <AlertTriangle className="w-4 h-4" />
            <span>时间紧迫!</span>
          </>
        ) : (
          <>
            <Clock className="w-4 h-4" />
            <span>剩余时间</span>
          </>
        )}
      </div>
    </div>
  );
}

interface GameTimerProps {
  currentPlayer: 'black' | 'white';
  blackTime: number;
  whiteTime: number;
  initialTime: number;
  onTimeout: (player: 'black' | 'white') => void;
}

export function GameTimer({ currentPlayer, blackTime, whiteTime, initialTime, onTimeout }: GameTimerProps) {
  return (
    <div className="flex items-center justify-center gap-8">
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-1">黑方</div>
        <div className={cn(
          'text-2xl font-bold font-mono',
          currentPlayer === 'black' ? 'text-white' : 'text-gray-500',
          blackTime <= 30 && 'text-red-500 animate-pulse'
        )}>
          {formatTime(blackTime)}
        </div>
      </div>

      <div className="text-2xl text-gray-600">vs</div>

      <div className="text-center">
        <div className="text-sm text-gray-400 mb-1">白方</div>
        <div className={cn(
          'text-2xl font-bold font-mono',
          currentPlayer === 'white' ? 'text-white' : 'text-gray-500',
          whiteTime <= 30 && 'text-red-500 animate-pulse'
        )}>
          {formatTime(whiteTime)}
        </div>
      </div>
    </div>
  );
}

function formatTime(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
