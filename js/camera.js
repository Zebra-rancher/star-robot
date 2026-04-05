export class Camera {
  constructor(canvasWidth, canvasHeight) {
    this.x = 0;
    this.canvasWidth = canvasWidth;
    this.canvasHeight = canvasHeight;
  }

  follow(player, levelWidth) {
    // Camera centers on player horizontally
    const target = player.x - this.canvasWidth / 3;
    this.x += (target - this.x) * 0.1; // Smooth follow
    // Clamp to level bounds
    if (this.x < 0) this.x = 0;
    if (this.x > levelWidth - this.canvasWidth) this.x = levelWidth - this.canvasWidth;
  }
}
