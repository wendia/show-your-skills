import { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/theme/ThemeContext';
import { useConfigStore } from '@/store/configStore';
import { useUserStore } from '@/store/userStore';
import { ThemeSelector } from '@/components/settings/ThemeSelector';
import { SkillPoolSelector } from '@/components/settings/SkillPoolSelector';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Settings, LogOut, Moon, Sun, Volume2, VolumeX } from 'lucide-react';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { skillPoolId, setSkillPool } = useConfigStore();
  const { logout, user } = useUserStore();
  
  const [darkMode, setDarkMode] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const handleLogout = () => {
    logout();
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 max-w-4xl mx-auto"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6" />
          设置
        </h1>
      </div>

      <ThemeSelector />
      <SkillPoolSelector />

      <Card>
        <CardHeader>
          <CardTitle>显示设置</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {darkMode ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
                <span>深色模式</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleDarkMode}
              >
                {darkMode ? '开启' : '关闭'}
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                <span>音效</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
              >
                {soundEnabled ? '开启' : '关闭'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>账号</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-gray-500">已登录</div>
                </div>
                <Button variant="destructive" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  退出登录
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>关于</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-500">
            <div>技能五子棋 (Show Your Skills)</div>
            <div>版本: 1.0.0</div>
            <div>一款带技能卡的五子棋对战游戏</div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
