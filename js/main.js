import { isDown, justPressed, clearJustPressed } from './input.js';
import { Player } from './player.js';
import { Camera } from './camera.js';
import { Level } from './level.js';
import { spawnEnemies } from './enemies.js';
import { drawTitleScreen, drawLevelSelect, drawLevelComplete, drawGameOver } from './ui.js';
import { space1 } from './levels/space1.js';
import { space2 } from './levels/space2.js';
import { space3 } from './levels/space3.js';
import { space4 } from './levels/space4.js';
import { space5 } from './levels/space5.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// All level data
const levelDataList = [space1, space2, space3, space4, space5];

// Game state
let state = 'title'; // title | levelSelect | playing | levelComplete | gameOver
let selectedLevel = 0;
let levelStars = {}; // { levelIndex: starsCollected }
let frame = 0;

// Current gameplay objects
let level, player, camera, enemies;

function startLevel(index) {
  const data = levelDataList[index];
  if (!data) return;
  level = new Level(data);
  player = new Player(level.playerStart.x, level.playerStart.y);
  camera = new Camera(canvas.width, canvas.height);
  enemies = spawnEnemies(level.enemyData);
  state = 'playing';
}

function update() {
  frame++;

  if (state === 'title') {
    if (justPressed('Enter') || justPressed('Space')) {
      state = 'levelSelect';
    }
  } else if (state === 'levelSelect') {
    if (justPressed('ArrowLeft') || justPressed('KeyA')) {
      selectedLevel = Math.max(0, selectedLevel - 1);
    }
    if (justPressed('ArrowRight') || justPressed('KeyD')) {
      selectedLevel = Math.min(levelDataList.length - 1, selectedLevel + 1);
    }
    if (justPressed('Enter') || justPressed('Space')) {
      // Can only play unlocked levels
      if (selectedLevel === 0 || levelStars[selectedLevel - 1] !== undefined) {
        startLevel(selectedLevel);
      }
    }
  } else if (state === 'playing') {
    player.update(level.platforms);
    camera.follow(player, level.width);

    // Update enemies
    for (const e of enemies) {
      if (e.type === 'drone') e.update(player.x, player.y);
      else e.update();
    }

    // Collect stars
    for (const s of level.stars) {
      if (!s.collected && player.overlaps(s)) {
        s.collected = true;
        player.stars++;
      }
    }

    // Collect power-ups
    for (const p of level.powerups) {
      if (!p.collected && player.overlaps(p)) {
        p.collected = true;
        if (p.type === 'shield') player.hasShield = true;
        if (p.type === 'speed') player.speedBoostTimer = 300;
        if (p.type === 'doublejump') { player.hasDoubleJump = true; player.canDoubleJump = true; }
        if (p.type === 'magnet') player.magnetTimer = 600;
      }
    }

    // Magnet effect — pull stars toward player
    if (player.magnetTimer > 0) {
      for (const s of level.stars) {
        if (s.collected) continue;
        const dx = (player.x + player.w / 2) - (s.x + 8);
        const dy = (player.y + player.h / 2) - (s.y + 8);
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          s.x += dx * 0.05;
          s.y += dy * 0.05;
        }
      }
    }

    // Player vs enemy collision
    for (const e of enemies) {
      if (e.type === 'turret') {
        // Check laser beam collision
        if (e.laserBeam && player.overlaps(e.laserBeam)) {
          player.hit();
        }
        continue;
      }
      if (!e.alive) continue;
      if (player.overlaps(e)) {
        // Stomp: player is falling and hitting top half of enemy
        if (player.vy > 0 && player.y + player.h < e.y + e.h * 0.7) {
          e.alive = false;
          player.vy = -8; // Bounce up after stomp
        } else {
          player.hit();
        }
      }
    }

    // Reached portal
    if (player.overlaps(level.portal)) {
      levelStars[selectedLevel] = player.stars;
      state = 'levelComplete';
    }

    // Fall off screen = lose life
    if (player.y > 550) {
      player.hit();
      if (!player.dead) {
        player.x = level.playerStart.x;
        player.y = level.playerStart.y;
        player.vy = 0;
      }
    }

    // Death
    if (player.dead) {
      state = 'gameOver';
    }
  } else if (state === 'levelComplete') {
    if (justPressed('Enter') || justPressed('Space')) {
      state = 'levelSelect';
    }
  } else if (state === 'gameOver') {
    if (justPressed('KeyR') || justPressed('Enter')) {
      startLevel(selectedLevel);
    }
    if (justPressed('Escape')) {
      state = 'levelSelect';
    }
  }

  clearJustPressed();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (state === 'title') {
    drawTitleScreen(ctx, canvas.width, canvas.height, frame);
  } else if (state === 'levelSelect') {
    drawLevelSelect(ctx, canvas.width, canvas.height, levelStars, selectedLevel);
  } else if (state === 'playing') {
    level.drawBackground(ctx, camera.x, canvas.width, canvas.height);
    level.drawPlatforms(ctx, camera.x);
    level.drawStars(ctx, camera.x);
    level.drawPowerups(ctx, camera.x);
    level.drawPortal(ctx, camera.x, frame);
    for (const e of enemies) e.draw(ctx, camera.x, frame);
    player.draw(ctx, camera.x);

    // HUD
    ctx.fillStyle = '#fff';
    ctx.font = '16px monospace';
    ctx.fillText(`Stars: ${player.stars}`, 10, 24);
    ctx.fillText(`Lives: ${'❤️'.repeat(player.lives)}`, 10, 46);
    ctx.fillText(`World 1 - Level ${selectedLevel + 1}`, canvas.width - 200, 24);
  } else if (state === 'levelComplete') {
    // Draw the level behind the overlay
    level.drawBackground(ctx, camera.x, canvas.width, canvas.height);
    level.drawPlatforms(ctx, camera.x);
    drawLevelComplete(ctx, canvas.width, canvas.height, player.stars, level.stars.length, frame);
  } else if (state === 'gameOver') {
    level.drawBackground(ctx, camera.x, canvas.width, canvas.height);
    drawGameOver(ctx, canvas.width, canvas.height, frame);
  }
}

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
