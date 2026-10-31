import { LaserConfig } from '@/types/game';

export function addLaserInputs<T extends LaserConfig>(config: T): T {
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
            p1_x: String(config.p1_x),
            p1_y: String(config.p1_y),
            p2_x: String(config.p2_x),
            p2_y: String(config.p2_y)
          };
          break;
      }
      break;
  }
  return {
    ...config,
    inputs: {
      ...inputs,
      ...config.inputs,
    },
  };
}

export function updateLaserFromInputs<T extends LaserConfig>(laser: T, inputs: Record<string, string>): T {
  if (laser.type === 'linear') {
    switch (laser.mode) {
      case 'slope-point':
        return {
          ...laser,
          slope: Number(inputs.slope ?? laser.slope),
          point: {
            x: Number(inputs.point_x ?? laser.point.x),
            y: Number(inputs.point_y ?? laser.point.y),
          },
          inputs,
        };
      case 'slope-yint':
        return {
          ...laser,
          slope: Number(inputs.slope ?? laser.slope),
          intercept: Number(inputs.intercept ?? laser.intercept),
          inputs,
        };
      case 'two-points':
        return {
          ...laser,
          p1: {
            x: Number(inputs.p1_x ?? laser.p1.x),
            y: Number(inputs.p1_y ?? laser.p1.y),
          },
          p2: {
            x: Number(inputs.p2_x ?? laser.p2.x),
            y: Number(inputs.p2_y ?? laser.p2.y),
          },
          inputs,
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