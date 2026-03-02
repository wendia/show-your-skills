import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Brain, Loader2 } from 'lucide-react';

interface AIThinkingIndicatorProps {
  isThinking: boolean;
  thinkingTime?: number;
  depth?: number;
}

export function AIThinkingIndicator({ isThinking, thinkingTime, depth }: AIThinkingIndicatorProps) {
  return (
    <AnimatePresence>
      {isThinking && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50"
        >
          <div className="bg-gray-900/90 backdrop-blur-sm border border-gray-700 rounded-lg px-6 py-3 shadow-xl">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              >
                <Brain className="w-5 h-5 text-purple-400" />
              </motion.div>

              <div className="flex flex-col">
                <span className="text-white font-medium flex items-center gap-2">
                  AI 思考中
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    ...
                  </motion.span>
                </span>
                
                {(thinkingTime !== undefined || depth !== undefined) && (
                  <span className="text-xs text-gray-400">
                    {depth !== undefined && `搜索深度: ${depth}`}
                    {depth !== undefined && thinkingTime !== undefined && ' | '}
                    {thinkingTime !== undefined && `${thinkingTime}ms`}
                  </span>
                )}
              </div>

              <Loader2 className="w-4 h-4 text-gray-400 animate-spin ml-2" />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface AIEvaluationDisplayProps {
  evaluation?: number;
  bestMove?: { row: number; col: number };
  visible: boolean;
}

export function AIEvaluationDisplay({ evaluation, bestMove, visible }: AIEvaluationDisplayProps) {
  if (!visible) return null;

  const getEvaluationColor = (eval_: number) => {
    if (eval_ > 1000) return 'text-green-500';
    if (eval_ > 100) return 'text-green-400';
    if (eval_ > 0) return 'text-yellow-400';
    if (eval_ > -100) return 'text-yellow-500';
    if (eval_ > -1000) return 'text-red-400';
    return 'text-red-500';
  };

  const getEvaluationLabel = (eval_: number) => {
    if (eval_ > 10000) return '必胜';
    if (eval_ > 1000) return '大优';
    if (eval_ > 100) return '优势';
    if (eval_ > 0) return '稍优';
    if (eval_ > -100) return '均势';
    if (eval_ > -1000) return '劣势';
    if (eval_ > -10000) return '大劣';
    return '必败';
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="bg-gray-800/80 backdrop-blur-sm border border-gray-700 rounded-lg px-4 py-2"
    >
      <div className="flex items-center gap-4 text-sm">
        {evaluation !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">评估:</span>
            <span className={cn('font-bold', getEvaluationColor(evaluation))}>
              {getEvaluationLabel(evaluation)}
            </span>
            <span className="text-gray-500 text-xs">
              ({evaluation > 0 ? '+' : ''}{evaluation})
            </span>
          </div>
        )}

        {bestMove && (
          <div className="flex items-center gap-2">
            <span className="text-gray-400">最佳:</span>
            <span className="text-white font-mono">
              ({bestMove.row}, {bestMove.col})
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
