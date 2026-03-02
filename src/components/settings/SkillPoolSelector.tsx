import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useConfigStore } from '@/store/configStore';

export function SkillPoolSelector() {
  const { skillPool, skillPoolId, setSkillPool } = useConfigStore();
  const pools = [
    { id: 'standard', name: '标准技能池', description: '平衡的标准技能组合', skillCount: 5 },
    { id: 'chaos', name: '混乱模式', description: '高随机性的混乱技能池', skillCount: 3 },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="text-lg font-semibold mb-4">选择技能池</h3>

        <div className="space-y-4">
          {pools.map((pool) => (
            <button
              key={pool.id}
              onClick={() => setSkillPool(pool.id)}
              className={cn(
                'w-full flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all text-left',
                skillPoolId === pool.id
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50'
              )}
            >
              <div className="flex-1">
                <div className="font-medium">{pool.name}</div>
                <div className="text-sm text-muted-foreground">
                  {pool.description}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  技能数量: {pool.skillCount} | 每人卡数: {skillPool?.distribution.countPerPlayer || 3}
                </div>
              </div>

              {skillPoolId === pool.id && (
                <div className="w-2 h-2 bg-primary rounded-full mt-2" />
              )}
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
