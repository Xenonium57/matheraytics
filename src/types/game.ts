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
  min?: number;
  max?: number;
}

export interface Guides extends Position {
  text: string;
}

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