import { RawLaserConfig, LaserConfig } from '@/types/game';

export function addLaserInputs(config: RawLaserConfig, fallbackId?: string): LaserConfig {
  let inputs: Record<string, string> = {};

  switch (config.type) {
    case 'linear':
      switch (config.mode) {
        case 'slope-point':
          inputs = {
            slope: String(config.slope),
            point_x: String(config.point.x),
            point_y: String(config.point.y)
          };
          break;
        case 'slope-yint':
          inputs = {
            slope: String(config.slope),
            intercept: String(config.intercept)
          };
          break;
        case 'two-points':
          inputs = {
            p1_x: String(config.p1.x),
            p1_y: String(config.p1.y),
            p2_x: String(config.p2.x),
            p2_y: String(config.p2.y)
          };
          break;
      }
      break;
  }
  return {
    ...config,
    id: config.id ?? fallbackId ?? `laser-${crypto.randomUUID}`,
    inputs,
  };
}

export function addLasersInputs(configs: RawLaserConfig[]): LaserConfig[] {
  return configs.map((config, index) =>
    addLaserInputs(config, config.id ?? `lasers-${index + 1}`)
  );
}

export function updateLaserFromInputs<T extends LaserConfig>(laser: T, newInputs: Record<string, string>): T {
  const mergedInputs = {
    ...laser.inputs,
    ...newInputs,
  };

  if (laser.type === 'linear') {
    switch (laser.mode) {
      case 'slope-point':
        return {
          ...laser,
          slope: Number(mergedInputs.slope ?? laser.slope),
          point: {
            x: Number(mergedInputs.point_x ?? laser.point.x),
            y: Number(mergedInputs.point_y ?? laser.point.y),
          },
          inputs: mergedInputs,
        };
      case 'slope-yint':
        return {
          ...laser,
          slope: Number(mergedInputs.slope ?? laser.slope),
          intercept: Number(mergedInputs.intercept ?? laser.intercept),
          inputs: mergedInputs,
        };
      case 'two-points':
        return {
          ...laser,
          p1: {
            x: Number(mergedInputs.p1_x ?? laser.p1.x),
            y: Number(mergedInputs.p1_y ?? laser.p1.y),
          },
          p2: {
            x: Number(mergedInputs.p2_x ?? laser.p2.x),
            y: Number(mergedInputs.p2_y ?? laser.p2.y),
          },
          inputs: mergedInputs,
        };
    }
  }
  return laser;
}

export function getLaserTargetPoint(config: LaserConfig): { x: number; y: number } {
  if (config.type === 'linear') {
    switch (config.mode) {
      case 'slope-point':
        return config.point;

      case 'slope-yint':
        return { x: 0, y: config.intercept };

      case 'two-points':
        return config.p1;
    }
  }
  
  return { x: 0, y: 0 };
}