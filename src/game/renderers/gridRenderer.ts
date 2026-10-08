import * as PIXI from "pixi.js";
import GAME_CONFIG from "@/constants/gameConfig";

export class GridRenderer {
  public container: PIXI.Graphics;

  constructor() {
    this.container = new PIXI.Graphics();
  }

  public draw() {
    const g = this.container;
    g.clear();

    const lineStyle = {
      width: 2,
      color: 0x0000ff,
      alignment: 0.5,
      alpha: 0.2
    };

    for (let x = 0; x <= GAME_CONFIG.WORLD_W; x++) {
      const px = x * GAME_CONFIG.TILE_SIZE;
      g.moveTo(px, 0);
      g.lineTo(px, GAME_CONFIG.WORLD_H * GAME_CONFIG.TILE_SIZE);
    }

    for (let y = 0; y <= GAME_CONFIG.WORLD_H; y++) {
      const py = y * GAME_CONFIG.TILE_SIZE;
      g.moveTo(0, py);
      g.lineTo(GAME_CONFIG.WORLD_W * GAME_CONFIG.TILE_SIZE, py);
    }

    g.stroke(lineStyle);
  }

  public destroy() {
    this.container.destroy();
  }
}

