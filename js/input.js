// Tracks which keys are currently held down
const keys = {};

window.addEventListener('keydown', (e) => {
  keys[e.code] = true;
  // Prevent spacebar from scrolling the page
  if (e.code === 'Space') e.preventDefault();
});

window.addEventListener('keyup', (e) => {
  keys[e.code] = false;
});

// Helper: check if a key is pressed right now
export function isDown(code) {
  return !!keys[code];
}

// For one-shot actions (like jumping), track "just pressed"
const justPressedKeys = {};

window.addEventListener('keydown', (e) => {
  if (!keys[e.code]) justPressedKeys[e.code] = true;
});

export function justPressed(code) {
  if (justPressedKeys[code]) {
    justPressedKeys[code] = false;
    return true;
  }
  return false;
}

export function clearJustPressed() {
  for (const key in justPressedKeys) {
    justPressedKeys[key] = false;
  }
}
