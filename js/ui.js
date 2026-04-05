import { justPressed, isDown } from './input.js';

export function drawTitleScreen(ctx, w, h, frame) {
  ctx.fillStyle = '#0a0a2e';
  ctx.fillRect(0, 0, w, h);

  // Stars background
  ctx.fillStyle = '#fff';
  for (let i = 0; i < 60; i++) {
    const x = (i * 137 + 50) % w;
    const y = (i * 97 + 20) % h;
    const size = (i % 3) + 1;
    const twinkle = Math.sin(frame * 0.03 + i) > 0.3 ? 1 : 0.3;
    ctx.globalAlpha = twinkle;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;

  // Title
  ctx.fillStyle = '#4fc3f7';
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('STAR ROBOT', w / 2, h / 2 - 40);

  // Subtitle
  ctx.fillStyle = '#90a4ae';
  ctx.font = '16px monospace';
  ctx.fillText('A Space Adventure', w / 2, h / 2);

  // Start prompt (blinks)
  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.fillStyle = '#ffd54f';
    ctx.font = '20px monospace';
    ctx.fillText('Press ENTER to Start', w / 2, h / 2 + 60);
  }

  ctx.textAlign = 'left';
}

export function drawLevelSelect(ctx, w, h, levelStars, currentSelection) {
  ctx.fillStyle = '#0a0a2e';
  ctx.fillRect(0, 0, w, h);

  ctx.fillStyle = '#4fc3f7';
  ctx.font = 'bold 28px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('WORLD 1: SPACE', w / 2, 60);

  // Draw 5 level boxes
  const boxW = 100, boxH = 80, gap = 30;
  const startX = (w - (boxW * 5 + gap * 4)) / 2;

  for (let i = 0; i < 5; i++) {
    const x = startX + i * (boxW + gap);
    const y = h / 2 - boxH / 2;
    const unlocked = i === 0 || (levelStars[i - 1] !== undefined);

    // Box
    ctx.fillStyle = currentSelection === i ? '#37474f' : '#1a1a3e';
    ctx.fillRect(x, y, boxW, boxH);
    ctx.strokeStyle = currentSelection === i ? '#4fc3f7' : '#455a64';
    ctx.lineWidth = currentSelection === i ? 3 : 1;
    ctx.strokeRect(x, y, boxW, boxH);

    // Level number
    ctx.fillStyle = unlocked ? '#fff' : '#555';
    ctx.font = 'bold 24px monospace';
    ctx.fillText(`${i + 1}`, x + boxW / 2, y + 35);

    // Stars collected or lock
    if (unlocked) {
      ctx.fillStyle = '#ffd54f';
      ctx.font = '14px monospace';
      const stars = levelStars[i] !== undefined ? `★${levelStars[i]}` : '';
      ctx.fillText(stars, x + boxW / 2, y + 60);
    } else {
      ctx.fillStyle = '#555';
      ctx.font = '20px monospace';
      ctx.fillText('🔒', x + boxW / 2, y + 60);
    }
  }

  ctx.fillStyle = '#90a4ae';
  ctx.font = '14px monospace';
  ctx.fillText('← → to select, ENTER to play', w / 2, h - 60);
  ctx.textAlign = 'left';
}

export function drawLevelComplete(ctx, w, h, starsCollected, totalStars, frame) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#4fc3f7';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('LEVEL COMPLETE!', w / 2, h / 2 - 60);

  ctx.fillStyle = '#ffd54f';
  ctx.font = '24px monospace';
  ctx.fillText(`Stars: ${starsCollected} / ${totalStars}`, w / 2, h / 2);

  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('Press ENTER to continue', w / 2, h / 2 + 50);
  }
  ctx.textAlign = 'left';
}

export function drawGameOver(ctx, w, h, frame) {
  ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
  ctx.fillRect(0, 0, w, h);

  ctx.textAlign = 'center';
  ctx.fillStyle = '#f44336';
  ctx.font = 'bold 40px monospace';
  ctx.fillText('GAME OVER', w / 2, h / 2 - 20);

  if (Math.floor(frame / 30) % 2 === 0) {
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText('Press R to retry', w / 2, h / 2 + 30);
  }
  ctx.textAlign = 'left';
}
