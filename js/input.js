// Tracks which keys are currently held down
const keys = {};
// Queue of keys pressed this frame (consumed by justPressed)
let pressedThisFrame = new Set();

window.addEventListener('keydown', (e) => {
  if (!keys[e.code]) {
    pressedThisFrame.add(e.code);
  }
  keys[e.code] = true;
  if (e.code === 'Space') e.preventDefault();
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Also treat click/tap as Enter (for menus)
window.addEventListener('mousedown', () => {
  pressedThisFrame.add('Enter');
});
window.addEventListener('touchstart', () => {
  pressedThisFrame.add('Enter');
});

// Check if a key is held down right now
export function isDown(code) {
  return !!keys[code];
}

// Check if a key was freshly pressed this frame (one-shot)
export function justPressed(code) {
  return pressedThisFrame.has(code);
}

// Call once at the END of each frame to reset
export function clearJustPressed() {
  pressedThisFrame = new Set();
}
