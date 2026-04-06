import { isDown, justPressed } from './input.js?v=2';

export class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 30;
    this.h = 40;
    this.vx = 0;
    this.vy = 0;
    this.onGround = false;
    this.jumpHeld = false;
    this.jumpTimer = 0;
    this.lives = 3;
    this.stars = 0;
    this.hasShield = false;
    this.hasDoubleJump = false;
    this.canDoubleJump = false;
    this.speedBoostTimer = 0;
    this.magnetTimer = 0;
    this.dead = false;
    this.invincibleTimer = 0;
  }

  update(platforms) {
    const SPEED = 4;
    const GRAVITY = 0.6;
    const JUMP_FORCE = -10;
    const JUMP_HOLD_FORCE = -0.4;
    const MAX_JUMP_HOLD = 12;
    const MAX_FALL = 12;

    const speed = this.speedBoostTimer > 0 ? SPEED * 1.6 : SPEED;

    // Horizontal movement
    this.vx = 0;
    if (isDown('ArrowLeft') || isDown('KeyA')) this.vx = -speed;
    if (isDown('ArrowRight') || isDown('KeyD')) this.vx = speed;
    this.x += this.vx;

    // Horizontal collision with platforms
    for (const p of platforms) {
      if (this.overlaps(p)) {
        if (this.vx > 0) this.x = p.x - this.w;
        else if (this.vx < 0) this.x = p.x + p.w;
      }
    }

    // Jump
    if (justPressed('Space') || justPressed('ArrowUp') || justPressed('KeyW')) {
      if (this.onGround) {
        this.vy = JUMP_FORCE;
        this.onGround = false;
        this.jumpHeld = true;
        this.jumpTimer = 0;
      } else if (this.hasDoubleJump && this.canDoubleJump) {
        this.vy = JUMP_FORCE;
        this.canDoubleJump = false;
        this.jumpHeld = true;
        this.jumpTimer = 0;
      }
    }

    // Variable jump height — hold spacebar to go higher
    if (this.jumpHeld && (isDown('Space') || isDown('ArrowUp') || isDown('KeyW'))) {
      if (this.jumpTimer < MAX_JUMP_HOLD) {
        this.vy += JUMP_HOLD_FORCE;
        this.jumpTimer++;
      }
    } else {
      this.jumpHeld = false;
    }

    // Gravity
    this.vy += GRAVITY;
    if (this.vy > MAX_FALL) this.vy = MAX_FALL;
    this.y += this.vy;

    // Vertical collision with platforms
    this.onGround = false;
    for (const p of platforms) {
      if (this.overlaps(p)) {
        if (this.vy > 0) {
          // Landing on top
          this.y = p.y - this.h;
          this.vy = 0;
          this.onGround = true;
          this.canDoubleJump = this.hasDoubleJump;
        } else if (this.vy < 0) {
          // Hitting head on bottom
          this.y = p.y + p.h;
          this.vy = 0;
        }
      }
    }

    // Timers
    if (this.speedBoostTimer > 0) this.speedBoostTimer--;
    if (this.magnetTimer > 0) this.magnetTimer--;
    if (this.invincibleTimer > 0) this.invincibleTimer--;
  }

  overlaps(rect) {
    return this.x < rect.x + rect.w &&
           this.x + this.w > rect.x &&
           this.y < rect.y + rect.h &&
           this.y + this.h > rect.y;
  }

  hit() {
    if (this.invincibleTimer > 0) return;
    if (this.hasShield) {
      this.hasShield = false;
      this.invincibleTimer = 60;
      return;
    }
    this.lives--;
    this.invincibleTimer = 90;
    if (this.lives <= 0) this.dead = true;
  }

  draw(ctx, camX) {
    const sx = this.x - camX;
    // Blink when invincible
    if (this.invincibleTimer > 0 && Math.floor(this.invincibleTimer / 4) % 2 === 0) return;

    // Robot body
    ctx.fillStyle = '#78909c';
    ctx.fillRect(sx + 4, 10 + this.y, this.w - 8, this.h - 10);
    // Robot head
    ctx.fillStyle = '#90a4ae';
    ctx.fillRect(sx + 6, this.y, this.w - 12, 14);
    // Eyes
    ctx.fillStyle = '#4fc3f7';
    ctx.fillRect(sx + 9, this.y + 4, 4, 4);
    ctx.fillRect(sx + 17, this.y + 4, 4, 4);
    // Antenna
    ctx.fillStyle = '#f44336';
    ctx.fillRect(sx + 13, this.y - 6, 4, 6);
    ctx.beginPath();
    ctx.arc(sx + 15, this.y - 8, 3, 0, Math.PI * 2);
    ctx.fill();

    // Shield bubble
    if (this.hasShield) {
      ctx.strokeStyle = 'rgba(79, 195, 247, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(sx + this.w / 2, this.y + this.h / 2, 28, 0, Math.PI * 2);
      ctx.stroke();
    }
  }
}
