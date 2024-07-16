import { useFrame } from '@react-three/fiber'
import { GunOpticObject } from '../../../config/gunAttachments'
import { RenderOrder } from '../../../constants'
import { SMG_OPTIC_PARAMS } from '../../../data'
import { useSpriteSheet } from '../../../hooks/useSpriteSheet'
import { GunAnimations } from './animations'

const glassNormalArray = new Float32Array([0,1,0.5, 0,1,0.5, 0,1,0.5, 0,1,0.5]);

export function OpticGlass({ optic, animations }: { optic: GunOpticObject, animations: GunAnimations }) {
  const { texture: glassTexture, setFrame } = useSpriteSheet(SMG_OPTIC_PARAMS[optic.type].glass, 3, 1);

  useFrame(() => {
    setFrame(animations.frame);
  });

  return (
    <mesh renderOrder={RenderOrder.GUN_BODY} userData={{ shootThrough: true }}>
      <planeGeometry args={[1, 1, 1, 1]}>
        <bufferAttribute attach="attributes-normal" array={glassNormalArray} itemSize={3} />
      </planeGeometry>
      <meshLambertMaterial map={glassTexture} color={optic.glassColor} transparent depthTest={false}/>
    </mesh>
  )
}