import * as THREE from 'three'
import { TextureCallback, useNearestFilterTexture } from './useNearestFilterTexture'
import { useEffect, useRef, useState } from 'react'

export function useSpriteSheet(path: string, hFrames: number, vFrames: number, initialFrame = 0, onLoad?: TextureCallback) {
  const texture = useNearestFilterTexture(path, texture => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1 / hFrames, 1 / vFrames);
    onLoad?.(texture);
  });

  const [frames, setFrames] = useState<{ x: number, y: number }[]>([]);
  const frame = useRef(-1);

  useEffect(() => {
    const frameWidth = texture.image.width / hFrames;
    const frameHeight = texture.image.height / vFrames;

    const newFrames = [];
    for (let v = 0; v < vFrames; v++) {
      for (let h = 0; h < hFrames; h++) {
        newFrames.push({ x: h * frameWidth, y: v * frameHeight });
      }
    }
    setFrames(newFrames);
  }, [texture, initialFrame, hFrames, vFrames]);

  useEffect(() => {
    setFrame(initialFrame);
  }, [frames]);
  
  function setFrame(newFrame: number) {
    if (!frames.length) return;
    
    if (newFrame === frame.current) return;


    if (!Number.isInteger(newFrame)) {
      console.warn(`Invalid frame value "${newFrame}" for sprite sheet "${path}". Rounding down to nearest integer.`);
      newFrame = Math.floor(newFrame);
    }

    const offset = frames[newFrame % frames.length];
    texture.offset.x = offset.x / texture.image.width;
    texture.offset.y = 1 - (1 / vFrames) - (offset.y / texture.image.height);

    frame.current = newFrame;
  }

  return { texture, setFrame };
}