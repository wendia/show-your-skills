import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';  // Load Tailwind CSS
import { configManager } from './config';
import { skillRegistry } from './skills/core/SkillRegistry';
import { registerAllEffects } from './skills/effects';

// Import config files
import defaultTheme from './config/themes/default.json';
import magicTheme from './config/themes/magic.json';
import techTheme from './config/themes/tech.json';
import standardPool from './config/skillPools/standard.json';
import chaosPool from './config/skillPools/chaos.json';

// Register themes
configManager.importThemes([
  defaultTheme,
  magicTheme,
  techTheme,
]);

// Register skill pools
configManager.importSkillPools([
  standardPool,
  chaosPool,
]);

// Register skill effects (implementations)
registerAllEffects();

// Register skill definitions from skill pools
skillRegistry.registerDefinitions(standardPool.skills);
skillRegistry.registerDefinitions(chaosPool.skills);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
