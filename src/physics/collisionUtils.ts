import GAME_CONFIG from '@/constants/gameConfig';
import type { Position, Box } from '@/types/game';

export const checkLaserHit = (
  slope: number,
  intercept: number,
  box: Box,
) => {
  const { x, y, w, h } = box;

  const a = slope;
  const b = -1;
  const c = intercept;

  const fLU = a * (x - w) + b * (y - h) + c;
  const fRD = a * (x + w) + b * (y + h) + c;
  const fRU = a * (x + w) + b * (y - h) + c;
  const fLD = a * (x - w) + b * (y + h) + c;

  return (fLU * fRD <= 0) || (fRU * fLD <= 0);
}

export const isRectColliding = (box: Box, platform: any): boolean => {
  return (
    box.x + box.w > platform.x &&
    box.x - box.w < platform.x + platform.w &&
    box.y + box.h > platform.y &&
    box.y - box.h < platform.y + platform.h
  );
};

export const isPointInBox = (box: Box, point: Position): boolean => {
  return isRectColliding(box, {x: point.x, y: point.y, w: 0, h: 0});
};

export const checkCircleCollision = (box: any, circle: Position, r: number = GAME_CONFIG.CIRCLE_R) => {
  const minX = box.x - box.w;
  const maxX = box.x + box.w;
  const minY = box.y - box.h;
  const maxY = box.y + box.h;

  const closestX = Math.max(minX, Math.min(circle.x, maxX));
  const closestY = Math.max(minY, Math.min(circle.y, maxY));

  const dx = circle.x - closestX;
  const dy = circle.y - closestY;
  const distanceSq = dx * dx + dy * dy;

  return distanceSq < r * r;
};