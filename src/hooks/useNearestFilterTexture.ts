import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

export type TextureCallback = ((texture: THREE.Texture) => void);

export function useNearestFilterTexture(path: string, onLoad?: TextureCallback) {
  const texture = useTexture(path, texture => {
    const t = (texture as THREE.Texture);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    onLoad?.(texture);
  });

  return texture;
}
