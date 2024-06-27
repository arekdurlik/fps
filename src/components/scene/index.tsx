import * as THREE from 'three'
import { useRef } from 'react'
import { Ground } from './Ground'
import { Box } from './Box'
import { Player } from '../player/Player'
import { Sky } from '@react-three/drei'
import { Barrel } from './Barrel'

export function Scene() {
  const light = useRef<THREE.DirectionalLight | null>(null)

  return <>
  <Sky sunPosition={[0, -20, 0]}/>
    <directionalLight 
      ref={light}
      intensity={0.1} 
      position={[50, 100, 0]} 
      shadow-camera-top={30} 
      shadow-camera-bottom={-30}
      shadow-camera-left={30}
      shadow-camera-right={-30}
      shadow-mapSize-width={2048}
      shadow-mapSize-height={2048}
      shadow-bias={-0.001}
    />
    <ambientLight intensity={0.1}/>
    <pointLight castShadow
      args={['#ffffff', 4, 15, 1]} 
      position={[3, 5.4, -4]} 
    />
      <Ground />
      <Box position={[2.5, 0.25, -2.5]} rotation={[0, Math.PI / 4, 0]} scale={0.5}/>
      <Box position={[2.5, 0.5, -4.5]}/>
      <Box position={[2.5, 0.5, -7.5]}/>
      <Player />
      <mesh castShadow receiveShadow position={[1, 0, -4]} scale={[2, 2, 2]} userData={{ material: 'concrete' }}>
        <boxGeometry args={[0.2, 4, 2]}/>
        <meshStandardMaterial color='#ddd'/>
      </mesh>
      <Barrel position={[-1, 0, -4]}/>
      <Barrel position={[-2, 0, -4]}/>
      <Barrel position={[-1.5, 0, -4.5]}/>
      <Barrel position={[1.5, 0, -1.6]}/>
  </>
}