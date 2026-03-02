import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/store/gameStore';
import { skillPoolManager } from '@/skills/core/SkillPoolManager';
import { Board } from '@/components/game/Board';
import { PlayerInfo } from '@/components/game/PlayerInfo';
import { SkillCard } from '@/components/game/SkillCard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SkillCard as SkillCardType } from '@/config/types';
import { RotateCcw, Flag } from 'lucide-react';

export function GamePage() {
  const {
    gameState,
    selectedSkillCard,
    selectSkillCard,
    placeStone,
    useSkill,
    startGame,
    resetGame,
    previewPosition,
    setPreviewPosition,
  } = useGameStore();

  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!isStarted) {
      skillPoolManager.loadPool('standard');
      const blackCards = skillPoolManager.drawCards(3);
      const whiteCards = skillPoolManager.drawCards(3);
      startGame({ black: blackCards, white: whiteCards });
      setIsStarted(true);
    }
  }, [isStarted, startGame]);

  if (!gameState) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const currentPlayerState = gameState.players[gameState.currentPlayer];

  const handleCellClick = (position: { row: number; col: number }) => {
    if (selectedSkillCard) {
      useSkill(selectedSkillCard, position);
    } else {
      placeStone(position);
    }
  };

  const handleSkillUse = (skillCardId: string) => {
    const skillCard = currentPlayerState.skillCards.find(c => c.id === skillCardId);
    if (!skillCard || skillCard.used) return;

    if (skillCard.skillId === 'blockZone' || skillCard.skillId === 'clone') {
      selectSkillCard(skillCardId);
    } else {
      useSkill(skillCardId);
    }
  };

  const handleNewGame = () => {
    resetGame();
    setIsStarted(false);
  };

  const lastMove = gameState.history.length > 0
    ? gameState.history[gameState.history.length - 1].position
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-white">技能五子棋</h1>
          <div className="flex gap-4">
            <Button onClick={handleNewGame} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              新游戏
            </Button>
            <Button variant="destructive">
              <Flag className="w-4 h-4 mr-2" />
              投降
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <PlayerInfo
              player={gameState.players.black}
              isCurrentTurn={gameState.currentPlayer === 'black'}
            />
          </div>

          <div className="lg:col-span-1 flex justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Board
                board={gameState.board}
                onCellClick={handleCellClick}
                onCellHover={setPreviewPosition}
                previewPosition={previewPosition}
                lastMove={lastMove}
              />
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <PlayerInfo
              player={gameState.players.white}
              isCurrentTurn={gameState.currentPlayer === 'white'}
            />
          </div>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                你的技能卡
                {selectedSkillCard && (
                  <span className="text-sm font-normal text-muted-foreground">
                    (已选择技能，点击棋盘使用)
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {currentPlayerState.skillCards.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    onUse={() => handleSkillUse(skill.id)}
                    used={skill.used}
                    selected={selectedSkillCard === skill.id}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {gameState.phase === 'ended' && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="fixed inset-0 flex items-center justify-center bg-black/50"
          >
            <Card className="p-8 text-center">
              <CardTitle className="text-2xl mb-4">
                {gameState.winner === 'draw' ? '平局!' : `${gameState.winner === 'black' ? '黑方' : '白方'}获胜!`}
              </CardTitle>
              <Button onClick={handleNewGame}>再来一局</Button>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
