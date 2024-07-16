import { Ground } from './Ground'
import { Box } from './Box'
import { Sky } from '@react-three/drei'
import { Barrel } from './Barrel'
import { BackSide } from 'three'

export function Scene() {

  return <>
    <Sky sunPosition={[0, -20, 0]} /> 
    <ambientLight intensity={0.02}/>
    <fog attach="fog" args={['#181513', 0, 20]}/>
    <mesh>
      <sphereGeometry args={[100, 2, 2]}/>
      <meshStandardMaterial side={BackSide}/>
    </mesh>
    {/* {new Array(10).fill(null).map(() => <pointLight args={[`hsl(${Math.random() * 360}, 100%, 50%)`, 1, 1]} position={[-20 + Math.random() * 40, 2, -20 + Math.random() * 40]}/>)} */}
    <pointLight args={['#f00', 14, 7, 1]} position={[3, 5.4, 0]}/>
    <pointLight args={['#0f0', 14, 7, 1]} position={[7, 5.4, -3.5]}/>
    <pointLight args={['#00f', 14, 7, 1]} position={[3, 5.4, -7]}/>
      <Ground />
      <Box position={[2.5, 0.25, -2.5]} rotation={[0, Math.PI / 4, 0]} scale={0.5}/>
      <Box position={[2.5, 0.5, -4.5]}/>
      <Box position={[2.5, 0.5, -7.5]}/>
      
      <mesh position={[1, 0, -4]} scale={[2, 2, 2]} userData={{ material: 'concrete' }}>
        <boxGeometry args={[0.2, 4, 2]}/>
        <meshStandardMaterial color='#fff'/>
      </mesh>
      <Barrel position={[-1, 0, -4]}/>
      <Barrel position={[-2, 0, -4]}/>
      <Barrel position={[-1.5, 0, -4.5]}/>
      <Barrel position={[1.5, 0, -1.6]}/>
  </>
}