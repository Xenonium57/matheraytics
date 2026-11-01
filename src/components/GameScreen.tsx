'use client';

import { useState } from 'react';
import GameCanvas from '@/components/GameCanvas';
import { isExistStage } from '@/constants/stages';

export default function GameScreen({initialStage = 1, initialLevel= 1 }: {initialStage?: number, initialLevel?: number}) {
  const [stage, setStage] = useState(initialStage);
  const [level, setLevel] = useState(initialLevel);

  const [fadeOpacity, setFadeOpacity] = useState(0);

  const handleGoal = () => {
    setTimeout(() => {
      setFadeOpacity(1);
      setTimeout(() => {
        if (isExistStage(stage, level + 1)) {
          console.log(`[Stage Transition] Moving to Next Level -> Stage: ${stage}, Level: ${level + 1}`);
          setLevel((prev) => prev + 1);
        } else if (isExistStage(stage + 1, 1)) {
          console.log(`[Stage Transition] Moving to Next Stage -> Stage: ${stage + 1}, Level: 1`);
          setStage((prev) => prev + 1);
          setLevel(1);
        } else {
          console.log('[Stage Transition] No next stage found. Resetting to Stage: 1, Level: 1');
          setStage(1);
          setLevel(1);
        }
        setFadeOpacity(0);
      }, 1000);
    }, 1000);
  };

  return (
    <div style={{ position: 'relative', width: '100vh', height: '100%', overflow: 'hidden' }}>
      <GameCanvas
        key={`${stage}-${level}`}
        stage={stage}
        level={level}
        onGoal={handleGoal}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: '#000000',
          pointerEvents: 'none',
          opacity: fadeOpacity,
          transition: 'opacity 1.0s ease-in-out',
          zIndex: 9999,
        }}
      />
    </div>
  )
}