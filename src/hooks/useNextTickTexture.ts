/* eslint-disable @typescript-eslint/no-explicit-any */
import * as THREE from 'three'
import { useLoader } from '@react-three/fiber'

export type TextureCallback = ((texture: THREE.Texture) => void);

// https://github.com/pmndrs/drei/issues/314#issuecomment-1676145098
export function withNextTickLoading<T, L extends LoaderProto<T>>(Proto: L): L {
  return class NextTickLoader extends Proto {
    load(
      ...args: Parameters<Loader<T extends unknown ? any : T>['load']>
    ): void {
      setTimeout(() => super.load(...args), 0);
    }
  };
}

interface Loader<T> extends THREE.Loader {
  load(
    url: string,
    onLoad?: (result: T) => void,
    onProgress?: (event: ProgressEvent) => void,
    onError?: (event: ErrorEvent) => void
  ): unknown;
}

type LoaderProto<T> = new (...args: any) => Loader<T extends unknown ? any : T>;

export function useNextTickTexture(path: string, onLoad?: TextureCallback) {
  //@ts-expect-error Argument of type 'typeof TextureLoader' is not assignable to parameter of type 'LoaderProto<unknown>';
  const texture = useLoader(withNextTickLoading(THREE.TextureLoader), path) as Texture;
  onLoad?.(texture);
  return texture;
}
