'use client';

import * as PIXI from 'pixi.js';
import { useEffect, useRef, useState } from 'react';

import EquationInput from '@/components/EquationInput';
import GAME_CONFIG from '@/constants/gameConfig';
import { getStageConfig } from '@/constants/stages';
import updateGame from '@/game/core/updateGame';
import { GridRenderer } from '@/game/renderers/gridRenderer';
import { getLineProps } from '@/physics/linearAnalysis';
import { MovableUiItem } from '@/types/game';
import { createGlowMarker } from '@/utils/createGlowMarker';

const TS = GAME_CONFIG.TILE_SIZE;

interface GridReferences {
  grid: PIXI.Container;
  xTexts: PIXI.Container;
  yTexts: PIXI.Container;
}

export default function GameCanvas({ stage, level, onGoal }: { stage: number, level: number, onGoal: () => void }) {
  const STAGE = getStageConfig(stage, level);
  const LASERS = STAGE.lasers;
  const PLATFORMS = STAGE.platforms;
  const STAGE_POSITION = STAGE.stagePosition;
  const guides = STAGE?.guides;

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const appRef = useRef<PIXI.Application | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<GridReferences | null>(null);
  const guideElementsRef = useRef<(HTMLDivElement | null)[]>([]);
  const initializingRef = useRef(false);
  const isAliveRef = useRef(true);
  const isGoalRef = useRef(false);
  const [isUiVisible, setIsUiVisible] = useState<boolean>(false);
  const keysRef = useRef<{ [key: string]: boolean }>({});
  const laserRef = useRef<PIXI.Graphics | null>(null);
  const previewLaserRef = useRef<PIXI.Graphics | null>(null);
  const prevKeysRef = useRef<{ [key: string]: boolean }>({});
  const timeRef = useRef<number>(0);
  const [uiItems, setUiItems] = useState<MovableUiItem[]>([]);
  const uiLayerRef = useRef<HTMLDivElement>(null);

  const isValidInput = (input: string, min: number, max: number) => {
    if (
      isNaN(Number(input)) ||
      !isFinite(Number(input)) ||
      input.trim() === "" ||
      Number(input) < min ||
      Number(input) > max
    ) return false;
    return true;
  }

  const updateLasersRender = (items: MovableUiItem[]) => {
    if (!laserRef.current) return;

    laserRef.current.clear();

    items.forEach((item, index) => {
      const { slope, intercept } = item.prevValues;
      const newLineProps = getLineProps({ slope, intercept });
      
      const isFocused = index === activeIndex;

      laserRef.current!
        .moveTo(newLineProps.x1 * TS, newLineProps.y1 * TS)
        .lineTo(newLineProps.x2 * TS, newLineProps.y2 * TS)
        .stroke({ 
          width: isFocused ? 7 : 5,
          color: isFocused ? 0xff0044 : 0xff0000,
          alpha: 1.0
        });

      if (isFocused) {
        (laserRef.current as any).currentData = { slope, intercept };
      }
    });
  };

  const handlePrev = () => {
    if (uiItems.length === 0) return;
    setActiveIndex(prev => (prev - 1 + uiItems.length) % uiItems.length);
  };

  const handleNext = () => {
    if (uiItems.length === 0) return;
    setActiveIndex(prev => (prev + 1) % uiItems.length);
  };

  const handleSetEquation = (item: MovableUiItem, slopeStr: string) => {
    if (!isValidInput(slopeStr, item.range.min, item.range.max)) return true;

    const nextSlope = Number(slopeStr);
    const { x, y } = item.target;
    const nextIntercept = y - (nextSlope * x);

    if (previewLaserRef.current) {
      previewLaserRef.current.clear();
    }

    setUiItems(prev => prev.map(u =>
      u.id === item.id
      ? {
        ...u,
        prevValues: {
          slope: nextSlope,
          intercept: nextIntercept
        }
      }
      : u
    ));
  };

  const handleShowPreview = (item: MovableUiItem, slopeStr: string) => {
    if (!isValidInput(slopeStr, item.range.min, item.range.max)) return true;

    const nextSlope = Number(slopeStr);
    const { x, y } = item.target;
    const nextIntercept = y - (nextSlope * x);
  
    if (previewLaserRef.current) {
      try {
        const lineProps = getLineProps({ slope: nextSlope, intercept: nextIntercept });
        
        previewLaserRef.current.clear();
        previewLaserRef.current
          .moveTo(lineProps.x1 * TS, lineProps.y1 * TS)
          .lineTo(lineProps.x2 * TS, lineProps.y2 * TS)
          .stroke({ width: 3, color: 0xffaa00, alpha: 0.7 });
  
        (previewLaserRef.current as any).dashPattern = [12, 8];
        return false;
      } catch (e) {
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    updateLasersRender(uiItems);
  }, [activeIndex, uiItems]);

  useEffect(() => {
    let isMounted = true;

    const handleKeyDown = (e: KeyboardEvent) => { keysRef.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.code] = false; };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    const init = async () => {
      if (initializingRef.current || appRef.current) {
        console.log('brocked', {initializing: initializingRef.current, hasApp: !!appRef.current});
        return;
      }
      initializingRef.current = true;
      console.log('start');

      const app = new PIXI.Application();
      await app.init({
        width: GAME_CONFIG.VIEW_W * TS,
        height: GAME_CONFIG.VIEW_H * TS,
        antialias: true,
        backgroundColor: 0xbde6f9,
        roundPixels: true,
      });

      if (!isMounted) {
        console.log('unmounted');
        app.destroy(true, { children: true, texture: true });
        return;
      }

      app.canvas.style.position = 'absolute';
      app.canvas.style.top = '0';
      app.canvas.style.left = '0';
      app.canvas.style.display = 'block';

      if (containerRef.current) {
        containerRef.current.appendChild(app.canvas);
      }
      appRef.current = app;

      const world = new PIXI.Container();
      world.scale.y = -1;
      world.y = GAME_CONFIG.VIEW_H * TS;
      app.stage.addChild(world);

      PLATFORMS.forEach((p) => {
        const gfx = new PIXI.Graphics()
          .rect(0, -p.h, p.w * TS, p.h * TS)
          .fill(p.color ?? 0x000000);
        gfx.x = p.x * TS;
        gfx.y = p.y * TS;
        world.addChild(gfx);
      });

      const halfW = GAME_CONFIG.BOX_HALF_SIZE.WIDTH;
      const halfH = GAME_CONFIG.BOX_HALF_SIZE.HEIGHT;
      const box = new PIXI.Graphics()
        .rect(-halfW * TS, -halfH * TS, halfW * 2 * TS, halfH * 2 * TS)
        .fill({ color: 0xffffff })
        .stroke({ width: 1, color: 0xffffff, alignment: 1 });
      box.filters = [
        new PIXI.BlurFilter({
          strength: 1,
          quality: 4,
          resolution: window.devicePixelRatio || 1,
        }),
      ];
      box.x = STAGE_POSITION.start.x * TS;
      box.y = STAGE_POSITION.start.y * TS;
      world.addChild(box);

      const playerState = {
        x: STAGE_POSITION.start.x,
        y: STAGE_POSITION.start.y,
        w: halfW,
        h: halfH,
        vx: 0,
        vy: 0,
      };

      if (guides) {
        guideElementsRef.current = new Array(guides.length).fill(null);
        guides.forEach((g) => {
          world.addChild(createGlowMarker({x: g.x, y: g.y}));
        });
      }

      const goal = createGlowMarker({x: STAGE_POSITION.goal.x, y: STAGE_POSITION.goal.y, color: 0xffff00})
      world.addChild(goal);

      const pLaser = new PIXI.Graphics();
      world.addChild(pLaser);
      previewLaserRef.current = pLaser;

      const initialItems: MovableUiItem[] = LASERS.map((laserConfig) => {
        const intercept = laserConfig.y - (laserConfig.slope * laserConfig.x);
        return {
          id: crypto.randomUUID(),
          type: 'equation',
          target: { x: laserConfig.x, y: laserConfig.y },
          range: { min: laserConfig.min ?? GAME_CONFIG.DEFAULT_RANGE.MIN, max: laserConfig.max ?? GAME_CONFIG.DEFAULT_RANGE.MAX },
          inputs: { slope: "" },
          prevValues: { slope: laserConfig.slope, intercept: intercept },
        };
      });
      setUiItems(initialItems);

      const laserGfx = new PIXI.Graphics();
      laserGfx.filters = [
        new PIXI.BlurFilter({
          strength: 2,
          quality: 4,
          resolution: window.devicePixelRatio || 1,
        }),
      ];
      world.addChild(laserGfx);
      laserRef.current = laserGfx;

      const gridRenderer = new GridRenderer();
      gridRenderer.draw();
      world.addChild(gridRenderer.container);

      const style = new PIXI.TextStyle({
        fontFamily: ['Yu Gothic'],
        fontSize: 0.4 * TS,
        fontWeight: 'bold',
        fill: '#c2c4f5',
        letterSpacing: 4,
        stroke: {
          color: '#6167ef',
          width: 2,
          join: 'round',
        },
        dropShadow: { alpha: 0.8, color: '#c2c4f5', distance: 0, blur: 6 },
      });

      const xGridTexts = new PIXI.Container();
      for (let i = 1; i <= GAME_CONFIG.WORLD_W; i++) {
        const text = new PIXI.Text({ text: String(i), style });
        text.anchor.set(0.5);
        text.x = i * TS;
        text.y = 0.5 * TS;
        text.scale.y = -1;
        xGridTexts.addChild(text);
      }
      world.addChild(xGridTexts);

      const yGridTexts = new PIXI.Container();
      for (let i = 1; i <= GAME_CONFIG.WORLD_H; i++) {
        const text = new PIXI.Text({ text: String(i), style });
        text.anchor.set(0.5);
        text.x = 0.5 * TS;
        text.y = i * TS;
        text.scale.y = -1;
        yGridTexts.addChild(text);
      }
      world.addChild(yGridTexts);

      gridRenderer.container.visible = false;
      xGridTexts.visible = false;
      yGridTexts.visible = false;

      gridRef.current = {
        grid: gridRenderer.container,
        xTexts: xGridTexts,
        yTexts: yGridTexts
      };

      let particles: any[] = [];

      function createExplosion({
        x,
        y,
        count = 20,
        gravity = GAME_CONFIG.PHYSICS.GRAVITY,
        color = 0xffffff,
        isRainbow = false
      }: {
        x: number;
        y: number;
        gravity?: number;
        count?: number;
        color?: number;
        isRainbow?: boolean;
      }) {
        for (let i = 0; i < count; i++) {
          const c = isRainbow ? new PIXI.Color(`hsl(${Math.floor(Math.random() * 360)},100%,50%)`).toNumber() : color;
          const p = new PIXI.Graphics().rect(-4, -4, 8, 8).fill(c);
          p.x = x * TS;
          p.y = y * TS;
          const angle = Math.random() * Math.PI;
          const speed = (Math.random() / 4) * TS;
          particles.push({
            display: p,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            rotationSpeed: Math.random() * 0.5,
            gravity,
          });
          world.addChild(p);
        }
      }

      app.ticker.add((ticker) => {
        const dt = ticker.deltaTime;
        timeRef.current += dt / 60;



        particles = particles.filter((pt) => {
          pt.display.x += pt.vx * dt;
          pt.display.y += pt.vy * dt;
          pt.vy += pt.gravity * TS * dt;
          pt.display.rotation += pt.rotationSpeed;
          pt.display.alpha *= Math.pow(0.98, dt);
          if (pt.y < -10 || pt.display.alpha <= 0.01) {
            world.removeChild(pt.display)
            return false;
          }
          return true;
        });

        updateGame({
          dt, stage, level, playerState, keys: keysRef.current, prevKeys: prevKeysRef.current,
          isAliveRef, box, laserRef, gridRef, world, xGridTexts, yGridTexts,
          uiLayerRef, uiItems, createExplosion, setIsUiVisible, guideElementsRef, isGoalRef, onGoal
        });
      
        prevKeysRef.current = { ...keysRef.current };
      });
      initializingRef.current = false;
      console.log('finish');
    };

    init();

    return () => {
      console.log('execute');
      isMounted = false;
      initializingRef.current = false;

      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);

      guideElementsRef.current = [];
      
      if (appRef.current) {
        const app = appRef.current;
        appRef.current = null;
        app.destroy(true, { children: true, texture: true });
      }

      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [stage, level]);

  return (
    <div style={{ position: 'relative', width: `${GAME_CONFIG.VIEW_W * TS}px`, height: `${GAME_CONFIG.VIEW_H * TS}px` }}>
      <div ref={containerRef} style={{ position: 'absolute' }} />
  
      <div 
        ref={uiLayerRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }}
      >

        {isUiVisible && (
          <div
            style={{
              position: 'absolute',
              top: '20px',
              left: '50px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              pointerEvents: 'auto',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.5)',
              padding: '2px 8px',
              borderRadius: '4px',
              border: '1px solid rgba(0,255,255,0.2)',
              backdropFilter: 'blur(4px)',
            }}
          >
            <button 
              onClick={handlePrev} 
              style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#00ffff', fontWeight: 'bold' }}
            >
              ◀
            </button>
            <span>LASER {activeIndex + 1}/{uiItems.length}</span>
            <button 
              onClick={handleNext} 
              style={{ cursor: 'pointer', background: 'none', border: 'none', color: '#00ffff', fontWeight: 'bold' }}
            >
              ▶
            </button>
          </div>
        )}

        {isUiVisible && uiItems.map((item, index) => {
          if (index !== activeIndex) return null;

          return (
            <div 
              key={item.id}
              data-id={item.id}
              style={{ 
                position: 'absolute', 
                top: '50px', 
                left: '50px', 
                pointerEvents: 'auto', 
                color: '#fff',
                willChange: 'transform',
                whiteSpace: 'nowrap'
              }}
            >
              {item.type === 'equation' && (
                <EquationInput
                  item={item}
                  onSet={(slope: string) => {
                    handleSetEquation(item, slope);
                    return false;
                  }}
                  onShow={(slope: string) => handleShowPreview(item, slope)}
                />
              )}
            </div>
          );
        })}
        {guides && guides.map((g, index) => (
          <div
            key={index}
            ref={(el) => {
              guideElementsRef.current[index] = el;
            }}
            style={{
              position: 'absolute',
              left: `${g.x * TS}px`,
              top: `${(GAME_CONFIG.VIEW_H - g.y - 1) * TS}px`,
              transform: 'translate(-50%, -100%)',
              opacity: 0,
              transition: 'opacity 0.2s ease-in-out',
              pointerEvents: 'none',
            }}
            className="flex flex-col gap-1 bg-black/85 p-2.5 px-3.5 rounded-xl border border-cyan-400 text-white font-mono text-xs select-none shadow-2xl backdrop-blur-sm whitespace-nowrap z-20 mb-2"
          >
            {/* ヘッダー風ラベル */}
            <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-1 mb-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse" />
              <span className="text-cyan-500 font-bold tracking-wider text-[10px] uppercase">
                ガイド
              </span>
            </div>

            {/* ガイドテキスト本文 */}
            <div className="text-zinc-600 font-medium">
              {g.text}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}