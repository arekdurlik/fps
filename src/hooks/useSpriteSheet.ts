import * as THREE from 'three'
import { TextureCallback, useNearestFilterTexture } from './useNearestFilterTexture'
import { useEffect, useState } from 'react'

export function useSpriteSheet(path: string, width: number, height = width, initialFrame = 0, onLoad?: TextureCallback) {
  const texture = useNearestFilterTexture(path, texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(width / texture.image.width, height / texture.image.height);
    onLoad?.(texture);
  });
  const [frames, setFrames] = useState<{ x: number, y: number }[]>([]);
  let currentFrame = -1;
  
  useEffect(() => {
    const hFrames = texture.image.width / width;
    const vFrames = texture.image.height / height;

    for (let v = 0; v < vFrames; v++) {
      for (let h = 0; h < hFrames; h++) {
        frames.push({ x: h * width, y: v * width });
      }
    }
    setFrames(frames);
    setFrame(initialFrame);
  }, [texture, initialFrame]);
  
  function setFrame(frame: number) {
    if (frame === currentFrame) return;
    
    if (!Number.isInteger(frame)) {
      console.warn(`Invalid frame value "${frame}" for sprite sheet "${path}". Rounding down to nearest integer.`);
      frame = Math.floor(frame);
    }
    
    const offset = frames[frame % frames.length];
    texture.offset.x = offset.x / texture.image.width;
    texture.offset.y =  1 - (height! / texture.image.height) - (offset.y / texture.image.height);

    currentFrame = frame;
  }

  return { texture, setFrame };
}