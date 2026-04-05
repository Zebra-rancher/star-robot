export class Level {
  constructor(data) {
    this.width = data.width;
    this.background = data.background;
    this.platforms = data.platforms;
    this.portal = data.portal;
    this.playerStart = data.playerStart;

    // Stars: each gets a collected flag
    this.stars = data.stars.map(s => ({ ...s, w: 16, h: 16, collected: false }));

    // Power-ups: each gets a collected flag
    this.powerups = (data.powerups || []).map(p => ({ ...p, w: 20, h: 20, collected: false }));

    // Enemy data (enemies.js will use this to spawn)
    this.enemyData = data.enemies || [];
  }

  drawBackground(ctx, camX, canvasWidth, canvasHeight) {
    ctx.fillStyle = this.background;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Draw stars in background (decoration, not collectibles)
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 80; i++) {
      const sx = ((i * 137 + 50) % this.width) - camX * 0.3;
      const sy = (i * 97 + 20) % (canvasHeight - 100);
      const size = (i % 3) + 1;
      if (sx > -10 && sx < canvasWidth + 10) {
        ctx.fillRect(sx, sy, size, size);
      }
    }
  }

  drawPlatforms(ctx, camX) {
    for (const p of this.platforms) {
      const sx = p.x - camX;
      if (sx > -p.w && sx < 800) {
        // Platform top (lighter)
        ctx.fillStyle = '#546e7a';
        ctx.fillRect(sx, p.y, p.w, 4);
        // Platform body
        ctx.fillStyle = '#37474f';
        ctx.fillRect(sx, p.y + 4, p.w, p.h - 4);
      }
    }
  }

  drawStars(ctx, camX) {
    for (const s of this.stars) {
      if (s.collected) continue;
      const sx = s.x - camX;
      if (sx > -20 && sx < 820) {
        // Yellow star shape
        ctx.fillStyle = '#ffd54f';
        ctx.beginPath();
        const cx = sx + 8, cy = s.y + 8;
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const method = i === 0 ? 'moveTo' : 'lineTo';
          ctx[method](cx + Math.cos(angle) * 8, cy + Math.sin(angle) * 8);
          const angle2 = angle + (2 * Math.PI) / 10;
          ctx.lineTo(cx + Math.cos(angle2) * 4, cy + Math.sin(angle2) * 4);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  drawPowerups(ctx, camX) {
    const colors = { shield: '#4fc3f7', speed: '#ffeb3b', doublejump: '#ce93d8', magnet: '#ef5350' };
    const labels = { shield: 'S', speed: 'F', doublejump: 'DJ', magnet: 'M' };
    for (const p of this.powerups) {
      if (p.collected) continue;
      const sx = p.x - camX;
      if (sx > -20 && sx < 820) {
        ctx.fillStyle = colors[p.type] || '#fff';
        ctx.fillRect(sx, p.y, p.w, p.h);
        ctx.fillStyle = '#000';
        ctx.font = '10px monospace';
        ctx.fillText(labels[p.type] || '?', sx + 3, p.y + 14);
      }
    }
  }

  drawPortal(ctx, camX, frame) {
    const p = this.portal;
    const sx = p.x - camX;
    if (sx > -p.w && sx < 820) {
      // Pulsing portal
      const pulse = Math.sin(frame * 0.05) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(156, 39, 176, ${pulse})`;
      ctx.fillRect(sx, p.y, p.w, p.h);
      ctx.strokeStyle = '#e1bee7';
      ctx.lineWidth = 2;
      ctx.strokeRect(sx, p.y, p.w, p.h);
      // Label
      ctx.fillStyle = '#fff';
      ctx.font = '10px monospace';
      ctx.fillText('EXIT', sx + 4, p.y + p.h / 2 + 4);
    }
  }
}
