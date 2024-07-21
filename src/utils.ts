const sounds = {
  jump: new Audio('jump.wav'),
  land: new Audio('land.wav'),
  walk1: new Audio('audio/walk1.wav'),
  walk2: new Audio('audio/walk2.wav'),
  walk3: new Audio('audio/walk3.wav'),
  walk4: new Audio('audio/walk4.wav'),
  shot1: new Audio('audio/smg/shot1.wav'),
  shot2: new Audio('audio/smg/shot2.wav'),
  shot3: new Audio('audio/smg/shot3.wav'),
  shot4: new Audio('audio/smg/shot4.wav'),
  shot5: new Audio('audio/smg/shot5.wav'),
  emptyGunshot: new Audio('empty-gun.mp3'),
  reload: new Audio('ump-reload.wav'),
  casing: new Audio('casing.wav'),
};

export function playSound(name: string, volume = 1) {
  const sound = sounds[name];
  sound.volume = volume;
  sound.currentTime = 0;
  sound.play();
}
