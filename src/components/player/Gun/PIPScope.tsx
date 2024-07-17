import { useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { GameState } from '../../../state/gameState'
import { Layers, RenderOrder } from '../../../constants'
import { GunAnimations } from './animations'
import { useGLTF } from '@react-three/drei'

export function PIPScope({ animations }: { animations: GunAnimations }) {
  const ref = useRef<THREE.Mesh>(null!);
  const target = useMemo(() => {
    const target = new THREE.WebGLRenderTarget(1920, 1080);
    target.texture.repeat.set(0.5, 1);
    target.texture.offset.setX(0.25);
    return target; 
  }, []);
  
  const { scene, gl } = useThree();
  const { nodes } = useGLTF('guns/pip/acog.glb');

  useFrame(() => {
    ref.current.visible = animations.frame === 2 ? true : false;
    if (!ref.current.visible) return;

    // reset
    ref.current.position.set(0, 0.002, -0.145);
    
    ref.current.position.x += animations.posX / 5;
    ref.current.position.y += animations.posY / 10;
    ref.current.position.x += animations.velX / 10;
    ref.current.position.y += animations.velY / 8;
    ref.current.position.z += animations.knockback;

    GameState.camera.layers.disable(Layers.SCOPE);
    GameState.camera.layers.disable(Layers.GUN);
    GameState.camera.layers.disable(Layers.RETICLE);
    GameState.camera.setFocalLength(65);

    gl.setRenderTarget(target);
    gl.clear();
    gl.render(scene, GameState.camera);
    gl.setRenderTarget(null);

    GameState.camera.layers.enable(Layers.SCOPE);
    GameState.camera.layers.enable(Layers.GUN);
    GameState.camera.layers.enable(Layers.RETICLE);
  }, 1);

  return <mesh ref={ref} renderOrder={RenderOrder.GUN_SCOPE} layers={Layers.SCOPE} geometry={(nodes.Circle as THREE.Mesh).geometry}>
    <meshBasicMaterial map={target.texture}/>
  </mesh>
}