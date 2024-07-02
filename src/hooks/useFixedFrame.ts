import { RenderCallback, useFrame } from '@react-three/fiber'
import { useRef } from 'react'

const MAX_FRAME_TIME = 25;

export function useFixedFrame(fps: number, cb: RenderCallback) {
  const frameDuration = 1000 / fps;
  const accumulator = useRef(0);
  const lastUpdateTime = useRef(performance.now());

  useFrame((state) => {
    const now = performance.now();
    let frameTime = now - lastUpdateTime.current;

    if (frameTime > MAX_FRAME_TIME) {
      frameTime = MAX_FRAME_TIME;
    }
    
    accumulator.current += frameTime;
    lastUpdateTime.current = now;

    while (accumulator.current >= frameDuration) {
      cb(state, frameDuration / 1000);
      accumulator.current -= frameDuration;
    }
  });
}