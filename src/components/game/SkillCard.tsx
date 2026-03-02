import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRarityStyle, useCardStyle } from '@/theme/useTheme';
import { cn } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SkillCard as SkillCardType } from '@/config/types';
import { RotateCcw, Info } from 'lucide-react';
import * as Icons from 'lucide-react';

interface SkillCardProps {
  skill: SkillCardType;
  onUse: () => void;
  used?: boolean;
  selected?: boolean;
  icon?: string;
  enableFlip?: boolean;
}

export function SkillCard({
  skill,
  onUse,
  used = false,
  selected = false,
  icon = 'Zap',
  enableFlip = true
}: SkillCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const rarityStyle = useRarityStyle(skill.rarity);
  const cardStyle = useCardStyle();

  if (!rarityStyle || !cardStyle) return null;

  const IconComponent = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[icon] || Icons.Zap;

  const rarityLabels: Record<string, string> = {
    common: '普通',
    rare: '稀有',
    epic: '史诗',
    legendary: '传说',
  };

  const handleFlip = () => {
    if (enableFlip && !used) {
      setIsFlipped(!isFlipped);
    }
  };

  const handleUse = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!used) {
      onUse();
    }
  };

  const flipVariants = {
    front: {
      rotateY: 0,
      transition: { duration: 0.4, type: 'spring' as const, stiffness: 200 }
    },
    back: {
      rotateY: 180,
      transition: { duration: 0.4, type: 'spring' as const, stiffness: 200 }
    }
  };

  return (
    <div
      className="relative cursor-pointer perspective-1000"
      onClick={handleFlip}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        className="relative w-full"
        style={{ transformStyle: 'preserve-3d' }}
        animate={isFlipped ? 'back' : 'front'}
        variants={flipVariants}
        whileHover={!used && !isFlipped ? { scale: 1.05, y: -5 } : {}}
        whileTap={!used ? { scale: 0.95 } : {}}
      >
        {/* Front Face */}
        <Card
          className={cn(
            'relative overflow-hidden backface-hidden',
            `bg-gradient-to-br ${rarityStyle.gradient}`,
            `border-2 ${rarityStyle.border}`,
            used && 'opacity-50 cursor-not-allowed',
            selected && 'ring-2 ring-white ring-offset-2 ring-offset-transparent'
          )}
          style={{
            borderRadius: cardStyle.borderRadius,
            boxShadow: cardStyle.shadowGlow
              ? `0 0 40px ${rarityStyle.glow}`
              : undefined,
            backfaceVisibility: 'hidden',
          }}
        >
          <Badge className={cn('absolute top-4 right-4', rarityStyle.badge)}>
            {rarityLabels[skill.rarity] || skill.rarity}
          </Badge>

          {enableFlip && !used && (
            <button
              className="absolute top-4 left-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
            >
              <Info className="w-4 h-4 text-white" />
            </button>
          )}

          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <IconComponent className="w-6 h-6" />
              {skill.name}
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm text-gray-200 mb-4 line-clamp-2">{skill.description}</p>

            <Button
              onClick={handleUse}
              disabled={used}
              className="w-full bg-white/20 hover:bg-white/30 text-white"
            >
              {used ? '已使用' : '使用技能'}
            </Button>
          </CardContent>

          {used && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white text-lg font-bold">已使用</span>
            </div>
          )}
        </Card>

        {/* Back Face */}
        <Card
          className={cn(
            'absolute inset-0 overflow-hidden backface-hidden',
            `bg-gradient-to-br ${rarityStyle.gradient}`,
            `border-2 ${rarityStyle.border}`,
          )}
          style={{
            borderRadius: cardStyle.borderRadius,
            boxShadow: cardStyle.shadowGlow
              ? `0 0 40px ${rarityStyle.glow}`
              : undefined,
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
          }}
        >
          <Badge className={cn('absolute top-4 right-4', rarityStyle.badge)}>
            {rarityLabels[skill.rarity] || skill.rarity}
          </Badge>

          <button
            className="absolute top-4 left-4 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              handleFlip();
            }}
          >
            <RotateCcw className="w-4 h-4 text-white" />
          </button>

          <CardHeader className="pt-12">
            <CardTitle className="flex items-center gap-2 text-white text-lg">
              <IconComponent className="w-6 h-6" />
              {skill.name}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h4 className="text-white font-semibold text-sm">技能说明</h4>
              <p className="text-sm text-gray-200">{skill.description}</p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-semibold text-sm">稀有度</h4>
              <p className="text-sm text-gray-200">
                {rarityLabels[skill.rarity] || skill.rarity}
              </p>
            </div>

            <div className="space-y-2">
              <h4 className="text-white font-semibold text-sm">使用方法</h4>
              <p className="text-sm text-gray-200">
                点击"使用技能"按钮激活，部分技能需要选择目标位置
              </p>
            </div>

            <Button
              onClick={handleUse}
              disabled={used}
              className="w-full bg-white/20 hover:bg-white/30 text-white"
            >
              {used ? '已使用' : '使用技能'}
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
