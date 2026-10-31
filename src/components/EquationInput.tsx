'use client';

import { useState, useEffect, ReactNode } from 'react';
import GAME_CONFIG from '@/constants/gameConfig'
import { LaserConfig, LinearSlopePointConfig } from '@/types/game';
import { getLinePropsFromConfig } from '@/physics/linearAnalysis';

interface EquationInputProps {
  config: LaserConfig;
  onSet: (inputs: Record<string, string>) => boolean;
  onShow: (inputs: Record<string, string>) => boolean;
}

interface ParamInputProps {
  paramKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
  setIsFocused: (focused: boolean) => void;
  className?: string;
}

function ParamInput({
  paramKey,
  value,
  onChange,
  setIsFocused,
  className = "equation-input equation-input-sm"
}: ParamInputProps) {
  return (
    <input
    type="text"
    value={value ?? ''}
    onChange={(e) => onChange(paramKey, e.target.value)}
    onFocus={() => setIsFocused(true)}
    onBlur={() => setIsFocused(false)}
    onKeyDown={(e) => e.stopPropagation()}
    onKeyUp={(e) => e.stopPropagation()}
    className={className}
    />
  );
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

export default function EquationInput({ config, onSet, onShow }: EquationInputProps) {
  const [inputs, setInputs] = useState<Record<string, string>>(() => {
    if (config.mode === 'slope-point') {
      return {
        slope: String(config.slope),
        point_x: String(config.point.x),
        point_y: String(config.point.y),
        ...config.inputs,
      };
    }
    return config.inputs ?? {};
  });
  const [isSetError, setIsSetError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (config.mode === 'slope-point') {
      setInputs({
        slope: String(config.slope),
        point_x: String(config.point.x),
        point_y: String(config.point.y),
        ...config.inputs,
      });
    }
  }, [config]);

  const handleInputChange = (key: string, value: string) => {
    const nextInputs = { ...inputs, [key]: value };
    setInputs(nextInputs);
    if (value.trim() === "" || value === "-" || isNaN(Number(value))) return;
    if (GAME_CONFIG.ENABLE_PREVIEW) {
      onShow(nextInputs);
    }
  };

  const triggerSetError = () => {
    setIsSetError(true);
    clearTimeout(setSetTimeoutId);
    setSetTimeoutId = setTimeout(() => setIsSetError(false), 1000);
  };

  const handleSet = () => {
    const hasError = config.editableParams.some((key) => {
      const val = inputs[key] ?? "";
      return val.trim() === "" || isNaN(Number(val));
    });

    if (hasError) {
      triggerSetError();
      return;
    }

    if (onSet(inputs)) {
      triggerSetError();
    }
  };

  const lineModel = getLinePropsFromConfig(config);
  const a = lineModel?.slope ?? 0;
  const b = lineModel?.intercept ?? 0;

  return (
    <div
      onMouseEnter={() => setIsFocused(true)}
      onMouseLeave={() => setIsFocused(false)}
      className={`flex flex-col gap-2 bg-black/85 p-3 pb-12 rounded-xl border border-cyan-400 text-white font-mono text-sm w-64 select-none shadow-2xl transition-opacity duration-200 backdrop-blur-sm ${
        isFocused ? 'opacity-100' : 'opacity-60'
      }`}
    >
      <AccordionItem title="式" colorClass="text-emerald-600" defaultOpen={true}>
        <div>
          y = {a === 1 ? '' : a === -1 ? '-' : a}x {b === 0 ? '' : b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`}
        </div>
      </AccordionItem>

      <hr className="border-zinc-800" />

      <AccordionItem title="条件" colorClass="text-sky-600" defaultOpen={true}>
        <div className="flex flex-col gap-1.5">
          <div>・一次関数</div>
          {config.mode === 'slope-point' && (
            <>
            <div className="flex items-center gap-1">
              <span>・傾きa = </span>
              {config.editableParams.includes('slope') ? (
                <ParamInput
                paramKey="slope"
                value={inputs.slope}
                onChange={handleInputChange}
                setIsFocused={setIsFocused}
                />
              ) : (
                <span>{config.slope}</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <span>・点P(</span>
              {config.editableParams.includes('point_x') ? (
                <ParamInput
                paramKey="point_x"
                value={inputs.point_x}
                onChange={handleInputChange}
                setIsFocused={setIsFocused}
              />
              ) : (
                <span>{config.point.x}</span>
              )}
              <span>, </span>
              {config.editableParams.includes('point_y') ? (
                <ParamInput
                paramKey="point_y"
                value={inputs.point_y}
                onChange={handleInputChange}
                setIsFocused={setIsFocused}
                />
              ) : (
                <span>{config.point.y}</span>
              )}
              <span> )</span>
            </div>
            </>
          )}
          </div>
      </AccordionItem>

      <hr className="border-zinc-800" />

      <AccordionItem title="詳細">
        {config.mode === 'slope-point' &&(
          <div className="flex flex-col gap-0.5">
            <div>y - P.y = a(x - P.x)</div>
            <div>P.x = {config.point.x}</div>
            <div>P.y = {config.point.y}</div>
            <div>a = {a}</div>
          </div>
        )}
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