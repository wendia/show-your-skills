import { motion, AnimatePresence } from 'framer-motion';
import { Stone, Position } from '@/config/types';

interface FlipStonesAnimationProps {
  positions: Position[];
  onComplete: () => void;
}

export function FlipStonesAnimation({ positions, onComplete }: FlipStonesAnimationProps) {
  return (
    <AnimatePresence>
      {positions.map((pos, index) => (
        <motion.div
          key={`${pos.row}-${pos.col}`}
          initial={{ rotateY: 0 }}
          animate={{ rotateY: 180 }}
          exit={{ rotateY: 0 }}
          transition={{
            delay: index * 0.1,
            duration: 0.5,
            ease: 'easeInOut'
          }}
          onAnimationComplete={index === positions.length - 1 ? onComplete : undefined}
          className="absolute"
          style={{
            top: pos.row * 32,
            left: pos.col * 32,
          }}
        >
          <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full" />
        </motion.div>
      ))}
    </AnimatePresence>
  );
}

interface UndoMoveAnimationProps {
  position: Position;
  onComplete: () => void;
}

export function UndoMoveAnimation({ position, onComplete }: UndoMoveAnimationProps) {
  return (
    <motion.div
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 0.5, opacity: 0 }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="absolute"
      style={{
        top: position.row * 32,
        left: position.col * 32,
      }}
    >
      <div className="w-8 h-8 bg-gray-500 rounded-full" />
      <motion.div
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="absolute inset-0 border-2 border-purple-500 rounded-full"
      />
    </motion.div>
  );
}

interface BlockZoneAnimationProps {
  centerPosition: Position;
  size: number;
  onComplete: () => void;
}

export function BlockZoneAnimation({ centerPosition, size, onComplete }: BlockZoneAnimationProps) {
  const halfSize = Math.floor(size / 2);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.6, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className="absolute pointer-events-none"
      style={{
        top: (centerPosition.row - halfSize) * 32,
        left: (centerPosition.col - halfSize) * 32,
        width: size * 32,
        height: size * 32,
      }}
    >
      <div className="w-full h-full bg-red-500/30 border-2 border-red-500 rounded-lg flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          className="text-red-500 text-2xl"
        >
          🚫
        </motion.div>
      </div>
    </motion.div>
  );
}

interface PlaceStoneAnimationProps {
  position: Position;
  color: Stone;
  onComplete: () => void;
}

export function PlaceStoneAnimation({ position, color, onComplete }: PlaceStoneAnimationProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1.2, opacity: 1 }}
      exit={{ scale: 1, opacity: 1 }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 15,
      }}
      onAnimationComplete={onComplete}
      className="absolute"
      style={{
        top: position.row * 32,
        left: position.col * 32,
      }}
    >
      <div className={`w-6 h-6 rounded-full ${
        color === 'black'
          ? 'bg-gradient-to-br from-gray-700 to-black'
          : 'bg-gradient-to-br from-white to-gray-200'
      }`} />
    </motion.div>
  );
}

interface DoubleMoveAnimationProps {
  onComplete: () => void;
}

export function DoubleMoveAnimation({ onComplete }: DoubleMoveAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
    >
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-lg shadow-xl">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.5, repeat: 2 }}
          className="text-2xl font-bold"
        >
          双子连珠！
        </motion.div>
        <div className="text-sm opacity-80">本回合可落两子</div>
      </div>
    </motion.div>
  );
}

interface VictoryAnimationProps {
  winner: Stone;
  onComplete: () => void;
}

export function VictoryAnimation({ winner, onComplete }: VictoryAnimationProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
      className="fixed inset-0 flex items-center justify-center bg-black/50 z-50"
    >
      <motion.div
        initial={{ scale: 0.5, rotate: -10 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="text-center"
      >
        <motion.div
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-6xl mb-4"
        >
          🏆
        </motion.div>
        <div className="text-4xl font-bold text-white mb-2">
          {winner === 'black' ? '黑方' : '白方'}获胜！
        </div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-xl text-gray-300"
        >
          恭喜！
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

interface TurnChangeAnimationProps {
  currentPlayer: Stone;
  onComplete: () => void;
}

export function TurnChangeAnimation({ currentPlayer, onComplete }: TurnChangeAnimationProps) {
  return (
    <motion.div
      initial={{ x: currentPlayer === 'black' ? -100 : 100, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
      className={`fixed top-20 ${
        currentPlayer === 'black' ? 'left-4' : 'right-4'
      } z-40`}
    >
      <div className={`px-4 py-2 rounded-lg ${
        currentPlayer === 'black'
          ? 'bg-gray-900 text-white'
          : 'bg-white text-gray-900'
      } shadow-lg`}>
        <div className="text-sm font-medium">
          {currentPlayer === 'black' ? '黑方' : '白方'}回合
        </div>
      </div>
    </motion.div>
  );
}
