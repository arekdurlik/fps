import * as THREE from 'three'
import { useTexture } from '@react-three/drei'

export function useNearestFilterTexture(path: string) {
  const texture = useTexture(path, texture => {
    const t = (texture as THREE.Texture);
    t.minFilter = t.magFilter = THREE.NearestFilter;
  });

  return texture;
}
