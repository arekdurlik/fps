const sounds = {
  jump: 'jump.wav',
  land: 'land.wav',
  walkL: 'walkl.wav',
  walkR: 'walkr.wav',
  gunshot: 'ump.wav',
  emptyGunshot: 'empty-gun.mp3',
  reload: 'ump-reload.wav',
};

export function playSound(name: keyof typeof sounds, volume = 1) {
  
  const sound = new Audio(sounds[name]);
  sound.volume = volume;
  sound.currentTime = 0;
  sound.play();
}
