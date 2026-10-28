export interface Position {
  x: number;
  y: number;
}

export interface Rect extends Position {
  w: number;
  h: number;
}

export interface Platform extends Rect {
  color?: number;
}

export interface Circle extends Position {
  r: number;
}

export interface Box extends Rect {
  vx?: number;
  vy?: number;
}

export interface LaserLine extends Position {
  slope: number;
  min: number;
  max: number;
}

export interface Guides extends Position {
  text: string;
}

export interface ParamRule {
  min?: number;
  max?: number;
  step?: number;
  options?: number[];
}

export type FunctionType = 'linear' | 'quadratic' | 'circle';

export interface BaseLaserItemConfig {
  id: string;
  inputs: Record<string, string>;
}

export interface LinearPointSlopeConfig extends BaseLaserItemConfig {
  type: 'linear';
  mode: 'point-slope';
  point: { x: number; y: number };
  slope: number;
  editableParams: Array<'slope' | 'point_x' | 'point_y'>;
  ParamRules?: {
    slope?: ParamRule;
    point_x?: ParamRule;
    point_y?: ParamRule;
  };
}

export interface LinearSlopeYIntConfig extends BaseLaserItemConfig {
  type: 'linear';
  mode: 'slope-yint';
  slope: number;
  intercept: number;
  editableParams: Array<'slope' | 'intercept'>;
  ParamRules?: {
    slope?: ParamRule;
    intercept?: ParamRule;
  }
}

export interface LinearTwoPointsConfig extends BaseLaserItemConfig {
  type: 'linear';
  mode: 'two-points';
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  editableParams: Array<'p1_x' | 'p1_y' | 'p2_x' | 'p2_y'>;
  ParamRules?: {
    p1_x?: ParamRule;
    p1_y?: ParamRule;
    p2_x?: ParamRule;
    p2_y?: ParamRule;
  }
}

export type LinearConfig =
  | LinearPointSlopeConfig
  | LinearSlopeYIntConfig
  | LinearTwoPointsConfig;

export type LaserConfig =
  | LinearConfig;

export interface StageConfig {
  id: number;
  level: number;
  stagePosition: {
    start: Position;
    goal: Position;
  };
  platforms: Platform[];
  lasers: LaserLine[];
  guides?: Guides[];
}

/* 移替え終了後削除 */
export interface MovableUiItem {
  id: string;
  type: 'equation';
  target: Position;
  range: { min: number; max: number };
  inputs: {
    slope: string;
  };
  prevValues: {
    slope: number;
    intercept: number;
  };
}
/**/