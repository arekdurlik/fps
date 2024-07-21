import { useTexture } from '@react-three/drei'
import { useThree } from '@react-three/fiber'
import { BackSide, CubeTextureLoader } from 'three'

export function Skybox() {
  const { scene } = useThree();
  const loader = new CubeTextureLoader();
  const texture = loader.load([
    'skybox/quirk/quirk_ft.jpg',
    'skybox/quirk/quirk_bk.jpg',
    'skybox/quirk/quirk_up.jpg',
    'skybox/quirk/quirk_dn.jpg',
    'skybox/quirk/quirk_rt.jpg',
    'skybox/quirk/quirk_lf.jpg',
  ]);

  scene.background = texture;
  return null;
}