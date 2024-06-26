const sounds = {
  jump: new Audio('jump.wav'),
  land: new Audio('land.wav'),
  walkL: new Audio('walkl.wav'),
  walkR: new Audio('walkr.wav'),
  gunshot: new Audio('ump.wav'),
  emptyGunshot: new Audio('empty-gun.mp3'),
  reload: new Audio('ump-reload.wav'),
};

export function playSound(name: keyof typeof sounds, volume = 1) {
  
  const sound = sounds[name];
  sound.volume = volume;
  sound.currentTime = 0;
  sound.play();
}
