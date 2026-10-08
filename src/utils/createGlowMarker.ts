import * as PIXI from 'pixi.js';
import GAME_CONFIG from '@/constants/gameConfig';

const TS = GAME_CONFIG.TILE_SIZE;

interface MarkerOptions {
  x: number;
  y: number;
  color?: number;
  alpha?: number;
  sizeRatio?: number;
}

export function createGlowMarker({
  x,
  y,
  color = 0xffffff,
  alpha = 0.6,
  sizeRatio = 8,
}: MarkerOptions): PIXI.Graphics {
  const gfx = new PIXI.Graphics()
    .circle(0, 0, TS / sizeRatio)
    .fill({ color, alpha });

  gfx.x = x * TS;
  gfx.y = y * TS;

  /*gfx.filters = [
    new PIXI.BlurFilter({
      strength: 1,
      quality: 4,
      resolution: window.devicePixelRatio || 1,
    }),
  ];/**/

  return gfx;
}