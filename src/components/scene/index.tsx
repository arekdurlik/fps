import * as THREE from 'three'
import { Physics } from '@react-three/rapier'
import { useRef } from 'react'
import { Ground } from './Ground'
import { Boxes } from './Boxes'
import { Player } from '../player/Player'
import { Sky } from '@react-three/drei'

export function Scene() {
  const light = useRef<THREE.DirectionalLight | null>(null)
  /* const { scene } = useThree();
  useEffect(() => {
    if (!light.current) return;
    const shadowHelper = new CameraHelper( light.current.shadow.camera );
    scene.add( shadowHelper );
  }, [light]) */

  return <>
  <Sky distance={450000} sunPosition={[20, 50, 0]} inclination={0} azimuth={0.25} />
    <directionalLight 
      ref={light}
      intensity={1} 
      position={[50, 100, 0]} 
      shadow-camera-top={30} 
      shadow-camera-bottom={-30}
      shadow-camera-left={30}
      shadow-camera-right={-30}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.001}
    />
    <fog attach="fog" args={['#fff', 0, 100]} />
    <ambientLight intensity={0.2}/>
    <pointLight 
      args={['#f00', 4, 15, 1]} 
      position={[0, 2.4, -4]} 
      shadow-mapSize-width={1024} 
      shadow-mapSize-height={1024} 
      shadow-bias={0.0001}
    />

    {/* <mesh position={[0, 2.5, -4]} castShadow>
      <boxGeometry args={[5, 0.15, 5]}/>
      <meshStandardMaterial color='#fff' />
    </mesh> */}

    <Physics gravity={[0, -12.81, 0]}>
      <Ground />
      <Boxes />
      <Player />
    </Physics>
  </>
}