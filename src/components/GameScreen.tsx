'use client';

import { useState } from 'react';
import GameCanvas from '@/components/GameCanvas';

export default function GameScreen() {
  const [stage, setStage] = useState(1);
  const [level, setLevel] = useState(1);

  const [fadeOpacity, setFadeOpacity] = useState(0);

  const handleGoal = () => {
    setTimeout(() => {
      setFadeOpacity(1);
      setTimeout(() => {
        setLevel((prev) => prev + 1);
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