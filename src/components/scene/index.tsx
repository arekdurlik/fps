import { Ground } from './Ground'
import { Box } from './Box'
import { Barrel } from './Barrel'
import { Environment, Sky } from '@react-three/drei'
import { Euler, PointLight } from 'three'
import { useWorldState } from '../../state/worldState'
import { lerp } from '../../helpers'
import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'

const lights = new Array(10).fill(null).map(() => new PointLight(`hsl(${0}, 100%, 50%)`, 2, 2));
lights.forEach(light => { 
  light.position.set(-25 + Math.random() * 50, 2, -25 + Math.random() * 50);
});

export function Scene() {
  const time = useWorldState(state => state.time);
  const { gl, scene } = useThree();

  useEffect(() => {
    gl.shadowMap.needsUpdate = true;
    gl.shadowMap.autoUpdate = true;
  }, [time]);
  
  useEffect(() => {
    lights.forEach(light => {
      scene.add(light);
    });
  }, []);

  return <>
    <Environment 
      files={['env.hdr']} 
      background 
      environmentIntensity={lerp(0.003, 0.1, time)} 
      backgroundIntensity={lerp(0.0075, 0.2, time)} 
      backgroundRotation={new Euler(0, lerp(3.25, 3, time), 0)} 
      environmentRotation={new Euler(0, lerp(3.25, 3, time), 0)}
      resolution={256}
    />
    <directionalLight 
      intensity={lerp(0.01, 1, time)} 
      position={[-150, lerp(50, 400, time), lerp(-40, -205, time)]} 
      castShadow 
      shadow-camera-near={0} 
      shadow-camera-far={600}
      shadow-camera-left={-25}
      shadow-camera-right={25}
      shadow-camera-bottom={-25}
      shadow-camera-top={25}
      shadow-mapSize-width={4096}
      shadow-mapSize-height={4096}
      shadow-bias={0.00002}
    />
    {/* <Sky sunPosition={[0, -20, 0]} />  */}
    <fog attach="fog" args={[`hsl(217.5, 7.08%, ${lerp(7, 42, time)}%)`, 0, 400]}/>
    {/* <mesh>
      <sphereGeometry args={[100, 2, 2]}/>
      <meshStandardMaterial side={BackSide}/>
    </mesh> */}
    <pointLight args={['#ff7', time > 0.15 ? 0 : 1, 7, 1]} position={[0, 3.4, -4]}/>
    {/* <pointLight args={['#0f0', 5, 7, 1]} position={[7, 5.4, -3.5]}/>
    <pointLight args={['#00f', 5, 7, 1]} position={[3, 5.4, -7]}/> */}
      <Ground />
      <Box position={[2.5, 0.25, -2.5]} rotation={[0, Math.PI / 4, 0]} scale={0.5}/>
      <Box position={[5.5, -0.185, -2.375]} rotation={[Math.PI / 3, 0, 0]}/>
      <Box position={[4.5, 0, -2.505]} rotation={[Math.PI / 4, 0, 0]}/>
      <Box position={[6.5, -0.27, -2.45]} rotation={[Math.PI / 8, 0, 0]}/>
      <Box position={[2.5, 0.5, -4.5]}/>
      <Box position={[2.5, 0.5, -7.5]}/>
      <Box position={[-4.5, 2, -7.5]} scale={4}/>
      
      <Barrel position={[0, 0, -20]}/>
      <Barrel position={[-1, 0, -26]}/>
      <Barrel position={[-2, 0, -14]}/>
  </>
}