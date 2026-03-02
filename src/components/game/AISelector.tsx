import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bot, Zap, Brain, Sparkles } from 'lucide-react';

interface AISelectorProps {
  onSelect: (difficulty: 'easy' | 'medium' | 'hard') => void;
  selectedDifficulty?: 'easy' | 'medium' | 'hard';
}

export function AISelector({ onSelect, selectedDifficulty }: AISelectorProps) {
  const difficulties = [
    {
      id: 'easy' as const,
      name: '简单',
      description: '适合新手，AI较弱',
      icon: Bot,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      id: 'medium' as const,
      name: '中等',
      description: '有一定挑战',
      icon: Brain,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      id: 'hard' as const,
      name: '困难',
      description: '高手挑战',
      icon: Sparkles,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          AI 对战
        </CardTitle>
        <CardDescription>
          选择AI难度开始单机游戏
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {difficulties.map((diff) => {
            const Icon = diff.icon;
            const isSelected = selectedDifficulty === diff.id;

            return (
              <motion.button
                key={diff.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelect(diff.id)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className={`w-12 h-12 mx-auto mb-3 rounded-full ${diff.bgColor} flex items-center justify-center`}>
                  <Icon className={`w-6 h-6 ${diff.color}`} />
                </div>
                <div className="font-medium text-center">{diff.name}</div>
                <div className="text-sm text-gray-500 text-center mt-1">
                  {diff.description}
                </div>
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
