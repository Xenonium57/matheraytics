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

function getInitialInputs(config: LaserConfig): Record<string, string> {
  if (config.mode === 'slope-point') {
    return {
      slope: String(config.slope ?? 0),
      point_x: String(config.point.x ?? 0),
      point_y: String(config.point.y ?? 0),
      ...config.inputs,
    };
  } else if (config.mode === 'slope-intercept') {
    return {
      slope: String(config.slope ?? 0),
      intercept: String(config.intercept ?? 0),
      ...config.inputs,
    }
  } else if (config.mode === 'two-points') {
    return {
      p1_x: String(config.p1.x ?? 0),
      p1_y: String(config.p1.y ?? 0),
      p2_x: String(config.p2.x ?? 0),
      p2_y: String(config.p2.y ?? 0),
      ...config.inputs,
    }
  }
  return (config as { inputs?: Record<string, string> }).inputs ?? {};
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
  const [inputs, setInputs] = useState<Record<string, string>>(() => getInitialInputs(config));
  const [isSetError, setIsSetError] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setInputs(getInitialInputs(config));
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

  const renderInput = (
    paramKey: string,
    getFallbackValue: () => number | string
  ) => {
    const isEditable = (config.editableParams as string[]).includes(paramKey);

    if (isEditable) {
      return (
        <ParamInput
          paramKey={paramKey}
          value={inputs[paramKey] ?? ''}
          onChange={handleInputChange}
          setIsFocused={setIsFocused}
        />
      );
    }

    return <span>{getFallbackValue()}</span>
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
          y = {a === 0 ? b : `${a === 1 ? '' : a === -1 ? '-' : a}x ` + `${b === 0 ? '' : b > 0 ? `+ ${b}` : `- ${Math.abs(b)}`}`}
        </div>
      </AccordionItem>

      <hr className="border-zinc-800" />

      <AccordionItem title="条件" colorClass="text-sky-600" defaultOpen={true}>
        <div className="flex flex-col gap-1.5">
          <div>・一次関数</div>
          {config.mode === 'slope-point' && (
            <>
            <div className="flex items-center gap-1">
              <span>・傾き</span>
              {renderInput('slope', () => config.slope ?? 0)}
            </div>
            <div className="flex items-center gap-1">
              <span>・(</span>
              {renderInput('point_x', () => config.point?.x ?? 0)}
              <span>, </span>
              {renderInput('point_y', () => config.point?.y ?? 0)}
              <span> )を通る</span>
            </div>
            </>
          )}
          {config.mode === 'slope-intercept' && (
            <>
            <div className="flex items-center gap-1">
              <span>・傾き</span>
              {renderInput('slope', () => config.slope ?? 0)}
            </div>
            <div className="flex items-center gap-1">
              <span>・切片</span>
              {renderInput('intercept', () => config.intercept ?? 0)}
            </div>
            </>
          )}
          {config.mode === 'two-points' && (
            <>
            <div className="flex items-center gap-1">
              <span>・(</span>
              {renderInput('p1_x', () => config.p1?.x ?? 0)}
              <span>, </span>
              {renderInput('p1_y', () => config.p1?.y ?? 0)}
              <span>)を通る</span>
            </div>
            <div className="flex items-center gap-1">
              <span>・(</span>
              {renderInput('p2_x', () => config.p2?.x ?? 0)}
              <span>, </span>
              {renderInput('p2_y', () => config.p2?.y ?? 0)}
              <span>)を通る</span>
            </div>
            </>
          )}
          </div>
      </AccordionItem>

      <hr className="border-zinc-800" />

      <AccordionItem title="詳細">
        {config.mode === 'slope-point' && (
          <div className="flex flex-col gap-0.5">
            <div>y - P<sub>y</sub> = a(x - P<sub>x</sub>)</div>
            <div>P<sub>x</sub> = {config.point.x}</div>
            <div>P<sub>y</sub> = {config.point.y}</div>
            <div>a = {a}</div>
          </div>
        )}
        {config.mode === 'slope-intercept' && (
          <div className="flex flex-col gap-0.5">
            <div>y = ax + b</div>
            <div>a = {a}</div>
            <div>b = {b}</div>
          </div>
        )}
        {config.mode === 'two-points' && (
          <div className="flex flex-col gap-0.5">
            <div>(Q<sub>x</sub> - P<sub>x</sub>)(y - P<sub>y</sub>)=(Q<sub>y</sub> - P<sub>y</sub>)(x - P<sub>x</sub>)</div>
            <div>P<sub>x</sub> = {config.p1.x}</div>
            <div>P<sub>y</sub> = {config.p1.y}</div>
            <div>Q<sub>x</sub> = {config.p2.x}</div>
            <div>Q<sub>y</sub> = {config.p2.y}</div>
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