import GAME_CONFIG from '@/constants/gameConfig'
import { StageConfig } from '@/types/game'
import { addLasersInputs } from '@/utils/laser'

export type StageMap = Record<number, Record<number, StageConfig>>;

export const STAGES: StageMap = {
  1: {
    1: {
      id: 1,
      level: 1,
      stagePosition: {
        start: {x: 1.5, y: 4.5},
        goal: {x: 10.5, y: 1.5}
      },
      platforms: [
        { x: 0, y: 0, w: GAME_CONFIG.WORLD_W, h: 1, color: 0x66f47c},
        { x: 6, y: 1, w: 3, h: 1 },
        { x: 7, y: 2, w: 1, h: 1 },
      ],
      lasers: addLasersInputs([{
          type: 'linear',
          mode: 'slope-point',
          slope: 1,
          point: { x: 7.5, y: 1.5 },
          editableParams: ['slope'],
        },
      ]),
      guides: [
        { x: 1.5, y: 1.5, text: "矢印キー又はWASDで移動\nRキーでリトライ" },
        { x: 7.5, y: 3.5, text: "Gキーを押して式を表示し、\n直線の傾きを-1にしよう"},
      ],
    }, 2: {
      id: 2,
      level: 2,
      stagePosition: {
        start: {x: 1.5, y: 4.5},
        goal: {x: 10.5, y: 1.5}
      },
      platforms: [
        { x: 0, y: 0, w: GAME_CONFIG.WORLD_W, h: 1, color: 0x66f47c},
        { x: 6, y: 1, w: 3, h: 1 },
        { x: 7, y: 2, w: 1, h: 1 },
      ],
      lasers: addLasersInputs([{
          type: 'linear',
          mode: 'slope-point',
          slope: 1,
          point: { x: 7.5, y: 1.5 },
          editableParams: ['point_x'],
        },
      ]),
      guides: [
        { x: 1.5, y: 1.5, text: "入力は-100以上100以下" },
      ],
    }, 3: {
      id: 3,
      level: 3,
      stagePosition: {
        start: {x: 1.5, y: 4.5},
        goal: {x: 10.5, y: 1.5}
      },
      platforms: [
        { x: 0, y: 0, w: GAME_CONFIG.WORLD_W, h: 1, color: 0x66f47c},
        { x: 6, y: 1, w: 3, h: 1 },
        { x: 7, y: 2, w: 1, h: 1 },
      ],
      lasers: addLasersInputs([{
          type: 'linear',
          mode: 'slope-point',
          slope: 1,
          point: { x: 7.5, y: 1.5 },
          editableParams: ['slope'],
        }, {
          type: 'linear',
          mode: 'slope-point',
          slope: 1,
          point: { x: 7.5, y: 1.5 },
          editableParams: ['point_y'],
        },
      ]),
      guides: [
        { x: 1.5, y: 1.5, text: "上の矢印で\nレーザーを切り替えよう" },
      ],
    }, 4: {
      id: 4,
      level: 4,
      stagePosition: {
        start: {x: 1.5, y: 4.5},
        goal: {x: 10.5, y: 1.5}
      },
      platforms: [
        { x: 0, y: 0, w: GAME_CONFIG.WORLD_W, h: 1, color: 0x66f47c},
        { x: 6, y: 1, w: 3, h: 1 },
        { x: 7, y: 2, w: 1, h: 1 },
      ],
      lasers: addLasersInputs([{
          type: 'linear',
          mode: 'two-points',
          p1: {x: 7.5, y: 1.5},
          p2: {x: 8.5, y: 2.5},
          editableParams: ['p2_x'],
        },
      ]),
    },10: {
      id: 10,
      level: 10,
      stagePosition: {
        start: {x: 1.5, y: 1.5},
        goal: {x: 9.5, y: 7.5}
      },
      platforms: [
        { x: 0, y: 0, w: GAME_CONFIG.WORLD_W, h: 1, color: 0x66f47c},
        ...Array.from({ length: 6 }, (_, i) => ({
          x: i + 4,
          y: i + 1,
          w: 6 - i,
          h: 1,
        })),
      ],
      lasers: addLasersInputs([{
          type: 'linear',
          mode: 'slope-point',
          slope: 0,
          point: { x: 1.5, y: 2.5 },
          editableParams: ['slope'],
        }, {
          type: 'linear',
          mode: 'slope-point',
          slope: 0,
          point: { x: 5.5, y: 4.5 },
          editableParams: ['slope'],
        }, {
          type: 'linear',
          mode: 'slope-point',
          slope: 0,
          point: { x: 6.5, y: 6.5 },
          editableParams: ['slope'],
        }
      ]),
      guides: [
        { x: 1.5, y: 1.5, text: "入力は絶対値100まで" },
      ],
    }
  }
};

export const isExistStage = (stage: number, level: number): boolean => {
  return stage in STAGES && level in STAGES[stage];
};

export const getStageConfig = (stage: number, level: number): StageConfig => {  
  if (!isExistStage(stage, level)) {
    console.warn(`Stage (Stage ${stage}, Level ${level}) not found. Falling back to Level 1, Stage 1.`);
    return STAGES[1][1];
  }
  
  return STAGES[stage][level];
};