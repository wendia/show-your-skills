import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme/ThemeContext';
import { useConfigStore } from '@/store/configStore';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { SkillPoolSelector } from '@/components/settings/SkillPoolSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Settings, Trophy, Users } from 'lucide-react';

interface HomePageProps {
  onStartGame: () => void;
}

export function HomePage({ onStartGame }: HomePageProps) {
  const [showSettings, setShowSettings] = useState(false);
  const { theme } = useTheme();
  const { skillPool } = useConfigStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent">
            技能五子棋
          </h1>
          <p className="text-xl text-gray-400">
            Show Your Skills - 带技能卡的五子棋对战游戏
          </p>
        </motion.div>

        {showSettings ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto space-y-6"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">设置</h2>
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                返回
              </Button>
            </div>

            <ThemeSelector />
            <SkillPoolSelector />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    快速开始
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    当前主题: {theme?.name || '默认'}<br />
                    技能池: {skillPool?.name || '标准'}
                  </p>
                  <Button onClick={onStartGame} className="w-full">
                    开始游戏
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    在线对战
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    与其他玩家实时对战
                  </p>
                  <Button variant="secondary" className="w-full">
                    匹配对手
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    排行榜
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    查看全球排名
                  </p>
                  <Button variant="secondary" className="w-full">
                    查看排行
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    设置
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400 mb-4">
                    自定义主题和技能池
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setShowSettings(true)}
                  >
                    打开设置
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle>游戏规则</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-400">
                <ul className="list-disc list-inside space-y-2">
                  <li>黑方先行，双方轮流在15x15棋盘上落子</li>
                  <li>先将五子连成一线者获胜</li>
                  <li>每局开始时，双方各获得3张随机技能卡</li>
                  <li>技能卡可以在对局中使用，每张只能使用一次</li>
                  <li>技能卡分为普通、稀有、史诗、传说四个稀有度</li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
