import GAME_CONFIG from '@/constants/gameConfig'
import { StageConfig } from '@/types/game'


export type StageMap = Record<number, Record<number, StageConfig>>;

export const STAGES: StageMap = {
  1: {
    1: {
      id: 1,
      level: 1,
      stagePosition: {
        start: {x: 0.5, y: 3.5},
        goal: {x: 10.5, y: 1.5}
      },
      platforms: [
        { x: 0, y: 0, w: GAME_CONFIG.WORLD_W, h: 1, color: 0x66f47c},
        { x: 6, y: 1, w: 3, h: 1 },
        { x: 7, y: 2, w: 1, h: 1 },
      ],
      lasers: [
        { x: 7.5, y: 1.5, slope: 1, min: -10, max: 10 },
      ],
      guides: [
        { x: 3.5, y: 1.5, text: "触れて説明を表示" },
      ],
    },
    2: {
      id: 2,
      level: 2,
      stagePosition: {
        start: {x: 0.5, y: 3.5},
        goal: {x: 10.5, y: 1.5}
      },
      platforms: [
        { x: 0, y: 0, w: GAME_CONFIG.WORLD_W, h: 1, color: 0x66f47c},
        { x: 6, y: 1, w: 3, h: 1 },
      ],
      lasers: [
        { x: 7.5, y: 1.5, slope: 6, min: -10, max: 10 },
      ],
    }
  }
};

export const getStageConfig = (level: number, stage: number): StageConfig => {
  const stageData = STAGES[level]?.[stage];
  
  if (!stageData) {
    console.warn(`Stage (Level ${level}, Stage ${stage}) not found. Falling back to Level 1, Stage 1.`);
    return STAGES[1][1];
  }
  
  return stageData;
};