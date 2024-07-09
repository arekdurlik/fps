import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { BulletImpactData, WorldState, WorldSubject } from '../state/worldState'
import { GameState } from '../state/gameState'

const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();

export function AudioController() {
  const { scene } = useThree();

  useEffect(() => {
    if (!GameState.camera) return;

    GameState.camera.add(listener);


    const unsubscribe = WorldState.subscribe(WorldSubject.BULLET_IMPACT, handleImpact)
    return () => unsubscribe();
  }, [GameState.camera]);

  function handleImpact({ object, position }: BulletImpactData) {
    

    const material = object?.userData.material;
    
    switch (material) {
      case 'concrete': {
        const sound = Math.random() > 0.5 ? '01' : '02';
        playSound(`audio/bullet_impact/concrete_${sound}.mp3`, position, 1, 0.2);
        break;
      }
      case 'metal':{
        const sound = Math.random() > 0.5 ? '01' : '02';
        playSound(`audio/bullet_impact/metal_${sound}.mp3`, position, 1.4, 0.25);
        break;
      }
      default: return;
    }
  }

  function playSound(path: string, position: THREE.Vector3, playbackRate = 1, volume = 1) {
    const sound = new THREE.PositionalAudio(listener);

    audioLoader.load(path, function(buffer) {
      sound.setBuffer(buffer);
      sound.setVolume(volume);
      sound.setRefDistance(3);
      sound.playbackRate = playbackRate + Math.random() * 0.1;
      sound.play();
    });
    
    sound.onEnded = function() {
      scene.remove(dummy);
    }

    const dummy = new THREE.Mesh();

    dummy.position.copy(position);
    dummy.add(sound);
    scene.add(dummy);
  }

  return null;
}