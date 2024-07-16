import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import * as THREE from 'three'
import { GameState } from '../state/gameState'
import { randomFloat } from '../helpers'
import { WorldState } from '../state/worldState'
import { BulletCasingCollisionData, BulletImpactData, WorldSubject } from '../state/worldState/types'

const listener = new THREE.AudioListener();
const audioLoader = new THREE.AudioLoader();
const bulletCasingMap = new Map<number, { volume: number, timestamp: number }>();
const CASING_VOLUME_COOLDOWN = 1000;
const CASING_START_VOLUME = 0.2;

export function AudioController() {
  const { scene } = useThree();

  useEffect(() => {
    GameState.camera.add(listener);
    const casingUnsubscribe = WorldState.subscribe(WorldSubject.BULLET_CASING_COLLISION, handleCasingCollision)
    const unsubscribe = WorldState.subscribe(WorldSubject.BULLET_IMPACT, handleImpact)
    return () => {
      unsubscribe();
      casingUnsubscribe();
    }
  }, []);

  function handleImpact({ object, position }: BulletImpactData) {
    
    const material = object?.userData.material;
    
    switch (material) {
      case 'concrete': {
        const sound = Math.random() > 0.5 ? '01' : '02';
        playSound(`audio/bullet_impact/concrete_${sound}.mp3`, position, 0.15, 1, 1.1);
        break;
      }
      case 'metal':{
        const sound = Math.random() > 0.5 ? '01' : '02';
        playSound(`audio/bullet_impact/metal_${sound}.mp3`, position, 0.2, 1.4, 1.5);
        break;
      }
      default: return;
    }
  }

  // lower volume of bullet cases with each collision
  function handleCasingCollision({ id, position }: BulletCasingCollisionData) {
    let volume = CASING_START_VOLUME;

    if (!bulletCasingMap.has(id)) {
      bulletCasingMap.set(id, { volume, timestamp: Date.now() });
    } else {
      const casing = bulletCasingMap.get(id)!
      
      if (Date.now() - casing.timestamp > CASING_VOLUME_COOLDOWN) {
        volume = CASING_START_VOLUME;
      } else {
        volume = casing.volume / 4;
      }

      bulletCasingMap.set(id, { volume, timestamp: Date.now() });
    }

    playSound('casing.wav', position, volume, 0.9, 1.1);
  }

  function playSound(path: string, position: THREE.Vector3Like, volume = 1, minPlaybackRate = 1, maxPlaybackRate = 1) {
    const sound = new THREE.PositionalAudio(listener);

    audioLoader.load(path, function(buffer) {
      sound.setBuffer(buffer);
      sound.setVolume(volume);
      sound.setRefDistance(3);
      sound.playbackRate = randomFloat(minPlaybackRate, maxPlaybackRate); 
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