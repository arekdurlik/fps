import * as THREE from 'three'
import { useNextTickTexture } from './useNextTickTexture'

export type TextureCallback = ((texture: THREE.Texture) => void);

export function useNearestFilterTexture(path: string, onLoad?: TextureCallback) {
  const texture = useNextTickTexture(path, texture => {
    const t = (texture as THREE.Texture);
    t.minFilter = t.magFilter = THREE.NearestFilter;
    onLoad?.(texture);
  });

  return texture;
}
