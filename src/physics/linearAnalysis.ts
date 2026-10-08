import GAME_CONFIG from '@/constants/gameConfig';

const W = GAME_CONFIG.WORLD_W;
const H = GAME_CONFIG.WORLD_H;

type linesInput = (s1: number, i1: number, s2: number, i2: number) =>
                  null | { x: number, y: number };

export const getLineIntersect: linesInput = (s1, i1, s2, i2) => {
  const isFinite1 = Number.isFinite(s1);
  const isFinite2 = Number.isFinite(s2);

  if (!isFinite1 && !isFinite2) return null;

  if (!isFinite1) {
    return {x: i1, y: s2 * i1 + i2};
  }

  if (!isFinite2) {
    return {x: i2, y: s1 * i2 + i1};
  }

  if (s1 === s2) return null;
  
  const x = (i2 - i1) / (s1 - s2);
  const y = s1 * x + i1;
  return {x, y};
};

export function expectLineIntersect(s1: number, i1: number, s2: number, i2: number) {
  const result = getLineIntersect(s1, i1, s2, i2);
  if (!result) {
    throw new Error(`[linearAnalysis] Cannot calculate intersection of parallel lines. (s1: ${s1}, s2: ${s2})`);
  }
  return result;
}

type basicInput = { slope: number, intercept: number };
type pointsInput = { x1: number, y1: number, x2: number, y2: number };
type slopeInput = { slope: number, x1: number, y1: number };

export interface LineModel {
  slope: number;
  intercept: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function getLineProps(elements: basicInput | pointsInput | slopeInput): LineModel {
  const ret: LineModel = { slope: NaN, intercept: NaN, x1: NaN, y1: NaN, x2: NaN, y2: NaN };
  if ("intercept" in elements) {
    ret.slope = elements.slope;
    ret.intercept = elements.intercept;
  } else if ("x2" in elements) {
    if (elements.x1 === elements.x2) {
      ret.slope = Infinity;
      ret.intercept = elements.x1;
    } else {
      ret.slope = (elements.y1 - elements.y2) / (elements.x1 - elements.x2);
      ret.intercept = elements.y1 - ret.slope * elements.x1;
    }
  } else {
    ret.slope = elements.slope;
    ret.intercept = !isFinite(ret.slope) ? elements.x1 : elements.y1 - ret.slope * elements.x1;
  }

  if (ret.slope === Infinity) {
    ret.x1 = ret.intercept;
    ret.y1 = 0;
    ret.x2 = ret.intercept;
    ret.y2 = H;
  } else if (ret.slope === 0) {
    ret.x1 = 0;
    ret.y1 = ret.intercept;
    ret.x2 = W;
    ret.y2 = ret.intercept;
  } else {
    const l = expectLineIntersect(ret.slope, ret.intercept, Infinity, 0);
    const r = expectLineIntersect(ret.slope, ret.intercept, Infinity, GAME_CONFIG.WORLD_W);
    const d = expectLineIntersect(ret.slope, ret.intercept, 0, 0);
    const u = expectLineIntersect(ret.slope, ret.intercept, 0, GAME_CONFIG.WORLD_H);

    const candidates = [l, r, d, u];

    const EPS = 0.01;
    const inBoundsPoints = candidates.filter(p => 
      p.x >= 0 - EPS && p.x <= W + EPS &&
      p.y >= 0 - EPS && p.y <= H + EPS
    );

    const validPoints: typeof inBoundsPoints = [];
    for (const p of inBoundsPoints) {
      const isDuplicate = validPoints.some(saved => 
        Math.abs(saved.x - p.x) < EPS && Math.abs(saved.y - p.y) < EPS
      );
      if (!isDuplicate) validPoints.push(p);
    }

    if (validPoints.length >= 2) {
      ret.x1 = validPoints[0].x;
      ret.y1 = validPoints[0].y;
      ret.x2 = validPoints[1].x;
      ret.y2 = validPoints[1].y;
    } else {
      throw new Error(`[linearAnalysis] Failed to find 2 distinct boundary intersections for slope: ${ret.slope}`);
    }
  }
  return ret;
}