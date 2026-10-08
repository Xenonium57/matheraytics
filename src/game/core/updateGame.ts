import * as PIXI from 'pixi.js';
import GAME_CONFIG from '@/constants/gameConfig';
import { getStageConfig } from '@/constants/stages';
import { checkCircleCollision, checkLaserHit, isRectColliding } from '@/physics/collisionUtils';

const TS = GAME_CONFIG.TILE_SIZE;

interface GridReferences {
  grid: PIXI.Container;
  xTexts: PIXI.Container;
  yTexts: PIXI.Container;
}

export default function updateGame({
  dt,
  stage,
  level,
  playerState,
  keys,
  prevKeys,
  isAliveRef,
  box,
  laserRef,
  gridRef,
  world,
  xGridTexts,
  yGridTexts,
  uiLayerRef,
  uiItems,
  createExplosion,
  setIsUiVisible,
  guideElementsRef,
  isGoalRef,
  onGoal,
}: {
  dt: number;
  stage: number;
  level: number;
  playerState: any;
  keys: { [key: string]: boolean };
  prevKeys: { [key: string]: boolean };
  isAliveRef: React.MutableRefObject<boolean>;
  box: PIXI.Graphics;
  laserRef: React.MutableRefObject<PIXI.Graphics | null>;
  gridRef: React.MutableRefObject<GridReferences | null>;
  world: PIXI.Container;
  xGridTexts: PIXI.Container;
  yGridTexts: PIXI.Container;
  uiLayerRef: React.RefObject<HTMLDivElement | null>;
  uiItems: any[];
  createExplosion: (options: {
    x: number, y: number, count?: number, gravity?: number, color?: number, isRainbow?: boolean
  }) => void;
  setIsUiVisible: React.Dispatch<React.SetStateAction<boolean>>;
  guideElementsRef: React.RefObject<(HTMLDivElement | null)[]>;
  isGoalRef: React.MutableRefObject<boolean>;
  onGoal: () => void;
}) {
  const config = GAME_CONFIG.PHYSICS;
  const STAGE = getStageConfig(stage, level);
  const PLATFORMS = STAGE.platforms;
  const STAGE_POSITION = STAGE.stagePosition;
  const p = playerState;

  const triggeredKeys: { [key: string]: boolean } = {};
  Object.keys(keys).forEach((key) => {
    if (keys[key]) triggeredKeys[key] = !prevKeys[key];
  });

  if (!isGoalRef.current && triggeredKeys['KeyR']) {
    p.x = STAGE_POSITION.start.x; p.y = STAGE_POSITION.start.y;
    p.vx = 0; p.vy = 0;
    box.x = p.x * TS; box.y = p.y * TS;
    box.visible = true;
    isAliveRef.current = true;
    if (gridRef.current) {
      gridRef.current.grid.visible = false;
      gridRef.current.xTexts.visible = false;
      gridRef.current.yTexts.visible = false;
      setIsUiVisible(false);
    }
    return;
  }

  if (!isAliveRef.current) return;

  if (!isGoalRef.current && (keys['ArrowRight'] || keys['KeyD'])) p.vx += config.SPEED * dt;
  if (!isGoalRef.current && (keys['ArrowLeft'] || keys['KeyA'])) p.vx -= config.SPEED * dt;
  p.vx = Math.max(Math.min(p.vx, config.MAX_SPEED), -config.MAX_SPEED);
  p.vy += config.GRAVITY * dt;

  p.x += p.vx * dt;
  PLATFORMS.forEach((pf) => {
    if (isRectColliding(p, pf)) {
      if (p.vx > 0) {
        p.x = pf.x - p.w;
      } else if (p.vx < 0) {
        p.x = pf.x + pf.w + p.w;
      }
      p.vx = 0;
    }
  });

  p.y += p.vy * dt;
  let isGrounded = false;
  PLATFORMS.forEach((pf) => {
    if (isRectColliding(p, pf)) {
      if (p.vy < 0) {
        p.y = pf.y + pf.h + p.h;
        isGrounded = true;
      } else if (p.vy > 0) {
        p.y = pf.y - p.h;
      }
      p.vy = 0;
    }
  });

  if (isGrounded) {
    p.vx *= config.FRICTION
    if (!isGoalRef.current && (triggeredKeys['Space'] || triggeredKeys['ArrowUp'] || triggeredKeys['KeyW'])) p.vy = config.JUMP_FORCE;
  }
  
  if (p.x - p.w < 0) { p.x = p.w; p.vx = 0; }
  if (p.x + p.w > GAME_CONFIG.WORLD_W) { p.x = GAME_CONFIG.WORLD_W - p.w; p.vx = 0; }
  if (p.y + p.h > GAME_CONFIG.WORLD_H) { p.y = GAME_CONFIG.WORLD_H - p.h; p.vy = 0; }

  box.x = p.x * TS;
  box.y = p.y * TS;

  if (isGoalRef.current) return;

  const currentData = laserRef.current ? (laserRef.current as any).currentData : null;
  if (
    currentData &&
    checkLaserHit(currentData.slope, currentData.intercept, p)
  ) {
    isAliveRef.current = false;
    box.visible = false;
    createExplosion({x: p.x, y: p.y});
    return;
  }

  if (STAGE.guides && guideElementsRef?.current) {
    STAGE.guides.forEach((g, index) => {
      const el = guideElementsRef.current?.[index];
      if (!el) return;
      const isNear = checkCircleCollision(p, g);
      el.style.opacity = isNear ? '1' : '0';
    });
  }

  if (checkCircleCollision(p, STAGE_POSITION.goal)) {
    isGoalRef.current = true;
    createExplosion({x: STAGE_POSITION.goal.x, y: STAGE_POSITION.goal.y, count: 30, gravity: -0.005, isRainbow: true});
    onGoal();
    return;
  }

  if (!isGoalRef.current && triggeredKeys['KeyG'] && gridRef.current) {
    gridRef.current.grid.visible = !gridRef.current.grid.visible;
    gridRef.current.xTexts.visible = !gridRef.current.xTexts.visible;
    gridRef.current.yTexts.visible = !gridRef.current.yTexts.visible;
    setIsUiVisible(gridRef.current.grid.visible);
  }

  world.x += (GAME_CONFIG.VIEW_W * TS / 2 - box.x - world.x) * 0.1;
  world.y += (GAME_CONFIG.VIEW_H * TS / 2 + box.y - world.y) * 0.1;
  world.x = Math.min(Math.max(world.x, -(GAME_CONFIG.WORLD_W - GAME_CONFIG.VIEW_W) * TS), 0);
  world.y = Math.min(Math.max(world.y, GAME_CONFIG.VIEW_H * TS), GAME_CONFIG.WORLD_H * TS);

  xGridTexts.y = world.y - GAME_CONFIG.VIEW_H * TS;
  yGridTexts.x = -world.x;

  if (uiLayerRef.current) {
    const htmlElements = uiLayerRef.current.children;

    uiItems.forEach((item, index) => {
      const el = htmlElements[index] as HTMLDivElement;
      if (!el) return;

      const targetX = Math.round(item.target.x * TS + world.x);
      const targetY = Math.round(world.y - item.target.y * TS);
      el.style.transform = `translate(${targetX}px, ${targetY}px)`;
    });
  }
}