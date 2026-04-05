export class SpaceBug {
  constructor(x, y, patrolLeft, patrolRight) {
    this.x = x;
    this.y = y;
    this.w = 28;
    this.h = 20;
    this.patrolLeft = patrolLeft;
    this.patrolRight = patrolRight;
    this.speed = 1.5;
    this.dir = 1;
    this.alive = true;
    this.type = 'bug';
  }

  update() {
    if (!this.alive) return;
    this.x += this.speed * this.dir;
    if (this.x <= this.patrolLeft) this.dir = 1;
    if (this.x + this.w >= this.patrolRight) this.dir = -1;
  }

  draw(ctx, camX) {
    if (!this.alive) return;
    const sx = this.x - camX;
    if (sx < -40 || sx > 840) return;
    // Bug body (green)
    ctx.fillStyle = '#66bb6a';
    ctx.fillRect(sx + 4, this.y + 6, this.w - 8, this.h - 6);
    // Bug head
    ctx.fillStyle = '#43a047';
    ctx.fillRect(sx + 8, this.y, 12, 10);
    // Eyes
    ctx.fillStyle = '#f44336';
    ctx.fillRect(sx + 10, this.y + 3, 3, 3);
    ctx.fillRect(sx + 16, this.y + 3, 3, 3);
    // Legs
    ctx.fillStyle = '#388e3c';
    ctx.fillRect(sx + 2, this.y + this.h - 4, 4, 4);
    ctx.fillRect(sx + this.w - 6, this.y + this.h - 4, 4, 4);
  }
}

export class LaserTurret {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 20;
    this.h = 20;
    this.fireTimer = 0;
    this.fireInterval = 120; // frames between shots
    this.laserOn = false;
    this.laserTimer = 0;
    this.laserDuration = 40;
    this.type = 'turret';
    this.laserBeam = null; // { x, y, w, h } when firing
  }

  update() {
    this.fireTimer++;
    if (this.fireTimer >= this.fireInterval) {
      this.laserOn = true;
      this.laserTimer = 0;
      this.fireTimer = 0;
    }
    if (this.laserOn) {
      this.laserTimer++;
      // Laser shoots horizontally to the right, 300px long
      this.laserBeam = { x: this.x + this.w, y: this.y + 8, w: 300, h: 4 };
      if (this.laserTimer >= this.laserDuration) {
        this.laserOn = false;
        this.laserBeam = null;
      }
    }
  }

  draw(ctx, camX) {
    const sx = this.x - camX;
    if (sx < -320 || sx > 840) return;
    // Turret body
    ctx.fillStyle = '#78909c';
    ctx.fillRect(sx, this.y, this.w, this.h);
    // Barrel
    ctx.fillStyle = '#546e7a';
    ctx.fillRect(sx + this.w - 4, this.y + 6, 8, 8);
    // Warning light — blinks before firing
    const warning = this.fireTimer > this.fireInterval - 30;
    ctx.fillStyle = warning ? '#f44336' : '#455a64';
    ctx.fillRect(sx + 6, this.y + 4, 6, 6);

    // Laser beam
    if (this.laserOn && this.laserBeam) {
      ctx.fillStyle = 'rgba(244, 67, 54, 0.8)';
      ctx.fillRect(this.laserBeam.x - camX, this.laserBeam.y, this.laserBeam.w, this.laserBeam.h);
      // Glow
      ctx.fillStyle = 'rgba(244, 67, 54, 0.2)';
      ctx.fillRect(this.laserBeam.x - camX, this.laserBeam.y - 4, this.laserBeam.w, this.laserBeam.h + 8);
    }
  }
}

export class FlyingDrone {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.w = 24;
    this.h = 24;
    this.speed = 1.2;
    this.alive = true;
    this.type = 'drone';
    this.bobOffset = Math.random() * Math.PI * 2;
  }

  update(playerX, playerY) {
    if (!this.alive) return;
    // Slowly chase player
    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 10) {
      this.x += (dx / dist) * this.speed;
      this.y += (dy / dist) * this.speed;
    }
    // Bob up and down
    this.bobOffset += 0.05;
  }

  draw(ctx, camX, frame) {
    if (!this.alive) return;
    const sx = this.x - camX;
    if (sx < -40 || sx > 840) return;
    const bob = Math.sin(this.bobOffset) * 3;
    // Drone body
    ctx.fillStyle = '#ef5350';
    ctx.fillRect(sx + 4, this.y + 8 + bob, this.w - 8, this.h - 12);
    // Drone top
    ctx.fillStyle = '#c62828';
    ctx.fillRect(sx + 2, this.y + 4 + bob, this.w - 4, 8);
    // Propellers (spin effect)
    ctx.fillStyle = '#90a4ae';
    const spin = Math.floor(frame / 2) % 2;
    if (spin) {
      ctx.fillRect(sx - 2, this.y + bob, this.w + 4, 3);
    } else {
      ctx.fillRect(sx + 4, this.y + bob, this.w - 8, 3);
    }
    // Eye
    ctx.fillStyle = '#fff';
    ctx.fillRect(sx + 9, this.y + 10 + bob, 6, 4);
  }
}

export function spawnEnemies(enemyData) {
  return enemyData.map(e => {
    if (e.type === 'bug') return new SpaceBug(e.x, e.y, e.patrolLeft, e.patrolRight);
    if (e.type === 'turret') return new LaserTurret(e.x, e.y);
    if (e.type === 'drone') return new FlyingDrone(e.x, e.y);
    return null;
  }).filter(Boolean);
}
