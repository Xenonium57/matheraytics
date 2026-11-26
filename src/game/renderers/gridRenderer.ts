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

    const ts = GAME_CONFIG.TILE_SIZE;
    const maxW = GAME_CONFIG.WORLD_W * ts;
    const maxH = GAME_CONFIG.WORLD_H * ts;

    const lineStyle = {
      width: 2,
      color: 0x0000ff,
      alignment: 0.5,
      alpha: 0.2
    };

    for (let x = -GAME_CONFIG.WORLD_W; x <= GAME_CONFIG.WORLD_W; x++) {
      if (x === 0) continue;
      const px = x * ts;
      g.moveTo(px, -maxH);
      g.lineTo(px,  maxH);
    }

    for (let y = -GAME_CONFIG.WORLD_H; y <= GAME_CONFIG.WORLD_H; y++) {
      if (y === 0) continue;
      const py = y * ts;
      g.moveTo(-maxW, py);
      g.lineTo( maxW, py);
    }

    g.stroke(lineStyle);

    g.beginPath();
    g.moveTo(0, -maxH);
    g.lineTo(0,  maxH);
    g.moveTo(-maxW, 0);
    g.lineTo( maxW, 0);
    g.stroke({...lineStyle, width: 5, alpha: 0.3});
  }

  public destroy() {
    this.container.destroy();
  }
}

