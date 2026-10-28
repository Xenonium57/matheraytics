'use client';

import { useState, useEffect, ReactNode } from 'react';
import GAME_CONFIG from '@/constants/gameConfig'
import { MovableUiItem } from '@/types/game';

interface EquationInputProps {
  item: MovableUiItem;
  onSet: (slope: string) => boolean;
  onShow: (slope: string) => boolean;
}

function AccordionItem({ 
  title, 
  colorClass = "text-zinc-600", 
  defaultOpen = false, 
  children 
}: { 
  title: string; 
  colorClass?: string; 
  defaultOpen?: boolean; 
  children: ReactNode 
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div>
      <div 
        onClick={() => setIsOpen(!isOpen)} 
        className={`${colorClass} font-bold cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-1 select-none`}
      >
        <span>{isOpen ? '▼' : '▶'}</span>
        <span>■ {title}:</span>
      </div>
      {isOpen && (
        <div className="pl-4 pt-1 text-zinc-700 flex flex-col gap-1 text-pre-wrap">
          {children}
        </div>
      )}
    </div>
  );
}

let setSetTimeoutId: NodeJS.Timeout;

export default function EquationInput({ item, onSet, onShow }: EquationInputProps) {
  const { x, y } = item.target;
  const { slope, intercept } = item.prevValues;
  const [inputs, setInputs] = useState<Record<string, string>>({slope: String(slope)});
  const [isSetError, setIsSetError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputs((prev) => ({ ...inputs, 'slope': slope }));
  }, [slope]);

  const handleInputChange = (key: string, value: string) => {
    const nextInputs = { ...inputs, [key]: value };
    setInputs(nextInputs);
    if (value.trim() === "" || value === "-" || isNaN(Number(value))) return;
    if (GAME_CONFIG.ENABLE_PREVIEW) {
      onShow(value);
    }
  };

  const triggerSetError = () => {
    setIsSetError(true);
    clearTimeout(setSetTimeoutId);
    setSetTimeoutId = setTimeout(() => setIsSetError(false), 1000);
  };

  const handleSet = () => {
    if (inputs.slope.trim() === "" || isNaN(Number(inputs.slope))) {
      triggerSetError();
      return;
    }
    if (onSet(inputs.slope)) {
      triggerSetError();
    }
  };

  return (
    <div
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className={`flex flex-col gap-2 bg-black/85 p-3 pb-12 rounded-xl border border-cyan-400 text-white font-mono text-sm w-64 select-none shadow-2xl transition-opacity duration-200 backdrop-blur-sm ${
        isFocused ? 'opacity-100' : 'opacity-60'
      }`}
    >
      <AccordionItem title="式" colorClass="text-emerald-600" defaultOpen={true}>
      <div className="flex items-center gap-1">
          <span>y = </span>
          <input 
            type="text" 
            value={inputs.slope ?? ''} 
            onChange={(e) => handleInputChange('slope', e.target.value)} 
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => e.stopPropagation()} 
            onKeyUp={(e) => e.stopPropagation()} 
            className="equation-input equation-input-sm" 
          />
          <span>x + b</span>
        </div>
        <div>y = {slope === 1 ? "" : (slope === -1 ? "-" : `${slope}`)}x {intercept >= 0 ? `+ ${intercept}` : `- ${Math.abs(intercept)}`}</div>
      </AccordionItem>

      <hr className="border-zinc-800" />

      <AccordionItem title="説明" colorClass="text-sky-600">
        <div>P({x}, {y})を通る傾きがaの直線</div>
      </AccordionItem>

      <hr className="border-zinc-800" />

      <AccordionItem title="詳細">
        <div>y - P.y = a(x - P.x)</div>
        <div>P.x = {x}</div>
        <div>P.y = {y}</div>
        <div>a = {slope}</div>
      </AccordionItem>

      <button 
        onClick={handleSet}
        className={`absolute bottom-3 right-3 px-4 py-1 rounded text-xs font-bold transition-colors shadow-lg border ${
          isSetError 
            ? 'bg-red-950 border-red-500 text-red-300 shadow-red-950/50' 
            : 'bg-cyan-950 border-cyan-400 text-cyan-300 hover:bg-cyan-900 active:bg-cyan-950'
        }`}
      >
        {isSetError ? 'エラー発生' : '変更する'}
      </button>
    </div>
  );
}