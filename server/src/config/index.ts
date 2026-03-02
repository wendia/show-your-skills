import { ThemeConfig, SkillPoolConfig, ServerConfig } from './types.js';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ConfigManager {
  private serverConfig: ServerConfig;
  private themes: Map<string, ThemeConfig> = new Map();
  private skillPools: Map<string, SkillPoolConfig> = new Map();

  constructor() {
    this.serverConfig = this.loadServerConfig();
    this.loadThemes();
    this.loadSkillPools();
  }

  private loadServerConfig(): ServerConfig {
    return {
      server: {
        port: parseInt(process.env.PORT || '3001'),
        host: process.env.HOST || '0.0.0.0',
        corsOrigins: process.env.CORS_ORIGINS?.split(',') || ['*'],
      },
      game: {
        defaultBoardSize: 15,
        defaultSkillCountPerPlayer: 3,
        defaultSkillPoolId: 'standard',
        defaultThemeId: 'default',
      },
      database: {
        path: process.env.DB_PATH || './game.db',
        walMode: true,
      },
      websocket: {
        heartbeatInterval: 30000,
        heartbeatTimeout: 60000,
        maxConnections: 1000,
      },
    };
  }

  private loadThemes(): void {
    const themesDir = path.join(__dirname, 'themes');
    if (!fs.existsSync(themesDir)) return;

    const files = fs.readdirSync(themesDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(themesDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const theme: ThemeConfig = JSON.parse(content);
      this.themes.set(theme.id, theme);
    }
  }

  private loadSkillPools(): void {
    const poolsDir = path.join(__dirname, 'skillPools');
    if (!fs.existsSync(poolsDir)) return;

    const files = fs.readdirSync(poolsDir).filter(f => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(poolsDir, file);
      const content = fs.readFileSync(filePath, 'utf-8');
      const pool: SkillPoolConfig = JSON.parse(content);
      this.skillPools.set(pool.id, pool);
    }
  }

  getServerConfig(): ServerConfig {
    return this.serverConfig;
  }

  getAllThemes(): ThemeConfig[] {
    return Array.from(this.themes.values());
  }

  getTheme(id: string): ThemeConfig | undefined {
    return this.themes.get(id);
  }

  getAllSkillPools(): SkillPoolConfig[] {
    return Array.from(this.skillPools.values());
  }

  getSkillPool(id: string): SkillPoolConfig | undefined {
    return this.skillPools.get(id);
  }

  reload(): void {
    this.loadThemes();
    this.loadSkillPools();
  }
}

export const configManager = new ConfigManager();
