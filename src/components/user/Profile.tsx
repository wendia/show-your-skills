import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUserStore } from '@/store/userStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { User, Trophy, TrendingUp, Calendar } from 'lucide-react';

interface UserStats {
  wins: number;
  losses: number;
  draws: number;
  rating: number;
  winRate: number;
  totalGames: number;
  rank: number | null;
}

export function Profile() {
  const { user, token } = useUserStore();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

  useEffect(() => {
    if (!token) return;

    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/api/users/me/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token, API_URL]);

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-400">请先登录</div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-400">加载中...</div>
        </CardContent>
      </Card>
    );
  }

  const getRankBadge = (rank: number | null) => {
    if (!rank) return null;
    
    if (rank <= 10) {
      return <Badge variant="legendary">Top 10</Badge>;
    }
    if (rank <= 100) {
      return <Badge variant="epic">Top 100</Badge>;
    }
    if (rank <= 1000) {
      return <Badge variant="rare">Top 1000</Badge>;
    }
    return null;
  };

  const getRatingLevel = (rating: number) => {
    if (rating >= 2000) return { level: '大师', color: 'text-amber-500' };
    if (rating >= 1800) return { level: '钻石', color: 'text-cyan-500' };
    if (rating >= 1600) return { level: '铂金', color: 'text-purple-500' };
    if (rating >= 1400) return { level: '黄金', color: 'text-yellow-500' };
    if (rating >= 1200) return { level: '白银', color: 'text-gray-400' };
    return { level: '青铜', color: 'text-orange-600' };
  };

  const ratingInfo = stats ? getRatingLevel(stats.rating) : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            个人资料
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-2xl font-bold text-white">
              {user.username[0].toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold">{user.username}</span>
                {stats && getRankBadge(stats.rank)}
              </div>
              {ratingInfo && (
                <div className={`text-sm ${ratingInfo.color}`}>
                  {ratingInfo.level} | {stats?.rating} 分
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-500" />
              <div className="text-2xl font-bold">{stats.wins}</div>
              <div className="text-sm text-gray-500">胜利</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <div className="text-2xl font-bold">
                {stats.winRate.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-500">胜率</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <Calendar className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <div className="text-2xl font-bold">{stats.totalGames}</div>
              <div className="text-sm text-gray-500">总场次</div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-8 h-8 mx-auto mb-2 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center text-lg">
                #{stats.rank || '-'}
              </div>
              <div className="text-2xl font-bold">{stats.rank || '-'}</div>
              <div className="text-sm text-gray-500">排名</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>战绩统计</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>胜利</span>
              <span className="text-green-500 font-medium">{stats?.wins || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>失败</span>
              <span className="text-red-500 font-medium">{stats?.losses || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>平局</span>
              <span className="text-gray-500 font-medium">{stats?.draws || 0}</span>
            </div>
            <div className="border-t pt-4">
              <div className="flex items-center justify-between font-medium">
                <span>积分</span>
                <span>{stats?.rating || 1200}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
