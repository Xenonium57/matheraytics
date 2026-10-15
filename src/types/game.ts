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

export interface Laser extends Position {
  slope: number;
}

export interface Guides extends Position {
  text: string;
}

export interface Paramrule {
  min?: number;
  max?: number;
  step?: number;
  options?: number[];
}

export type FunctionType = 'linear' | 'quadratic' | 'circle';

export interface LinearPointSlopeConfig {
  type: 'linear';
  mode: 'point-slope';
  point: { x: number; y: number };
  slope: number;
  fixedParams?: Array<'point' | 'slope'>;
  paramRules?: {
    slope?: Paramrule;
    point_x?: Paramrule;
    point_y?: Paramrule;
  };
}

export interface LinearSlopeYIntConfig {
  type: 'linear';
  mode: 'slope-yint';
  slope: number;
  intercept: number;
  fixedParams?: Array<'slope' | 'intercept'>;
  paramRules?: {
    slope?: Paramrule;
    intercept?: Paramrule;
  }
}

export interface LinearTwoPointsConfig {
  type: 'linear';
  mode: 'two-points';
  p1: { x: number; y: number };
  p2: { x: number; y: number };
  fixedParams?: Array<'p1' | 'p2'>;
  paramRules?: {
    point1_x?: Paramrule;
    point1_y?: Paramrule;
    point2_x?: Paramrule;
    point2_y?: Paramrule;
  }
}

export type LinearLaserConfig =
  | LinearPointSlopeConfig
  | LinearSlopeYIntConfig
  | LinearTwoPointsConfig;

export type LaserConfig =
  | LinearLaserConfig;

export interface StageConfig {
  id: number;
  level: number;
  stagePosition: {
    start: Position;
    goal: Position;
  };
  platforms: Platform[];
  lasers: Laser[];
  guides?: Guides[];
}

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