import { useState } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, UserPlus } from 'lucide-react';

interface LoginPageProps {
  onSuccess?: () => void;
}

export function LoginPage({ onSuccess }: LoginPageProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login, register } = useUserStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isRegister) {
        await register(username, password);
      } else {
        await login(username, password);
      }
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : '操作失败');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{isRegister ? '注册账号' : '登录'}</CardTitle>
            <CardDescription>
              {isRegister ? '创建新账号开始游戏' : '登录你的账号'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">用户名</label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="输入用户名"
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md bg-background"
                  placeholder="输入密码"
                  required
                  minLength={6}
                />
              </div>

              {error && (
                <div className="text-sm text-red-500">{error}</div>
              )}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  '处理中...'
                ) : isRegister ? (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    注册
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4 mr-2" />
                    登录
                  </>
                )}
              </Button>

              <div className="text-center text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(!isRegister);
                    setError('');
                  }}
                  className="text-primary hover:underline"
                >
                  {isRegister ? '已有账号？立即登录' : '没有账号？立即注册'}
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
