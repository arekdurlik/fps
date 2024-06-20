const sounds = {
  jump: new Audio('jump.wav'),
  land: new Audio('land.wav'),
  walkL: new Audio('walkl.wav'),
  walkR: new Audio('walkr.wav'),
};

export function playSound(name: keyof typeof sounds, volume = 1) {
  const sound = sounds[name];
  sound.volume = volume;
  sound.currentTime = 0;
  sound.play();
}
