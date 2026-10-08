const GAME_CONFIG = {
  TILE_SIZE: 60,
  BOX_HALF_SIZE: {
    WIDTH: 0.45,
    HEIGHT: 0.45
  },
  CORE_HALF_SIZE: {
    WIDTH: 0.39,
    HEIGHT: 0.39
  },
  VIEW_W: 12,
  VIEW_H: 8,
  WORLD_W: 20,
  WORLD_H: 15,
  DEFAULT_RANGE: {
    MIN: -10000,
    MAX: 10000
  },
  CIRCLE_R: 0.2,
  ENABLE_PREVIEW: false,
  PHYSICS: {
    SPEED: 0.015,
    MAX_SPEED: 0.075,
    FRICTION: 0.8,
    JUMP_FORCE: 0.20,
    GRAVITY: -0.01,
    BOUNCE: 0.3,
  }
};

export default GAME_CONFIG;