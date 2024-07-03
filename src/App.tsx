import './App.css'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Suspense } from 'react'
import { PostProcessing } from './components/scene/PostProcessing'
import { Console } from './components/debug/Console'
import { Stats } from './components/debug/Stats'
import { Scene } from './components/scene'
import { HUD } from './components/ui/HUD'
import { Controllers } from './controllers'
import { Physics } from '@react-three/rapier'
import { BasicShadowMap } from 'three'
import { PHYSICS_FPS } from './constants'
import { LevaParams } from './components/debug/Leva'

function App() {
  return <>
    <Console/>
    <LevaParams/>
    <HUD/>
    <Suspense fallback={null}>
      <Canvas shadows={{ type: BasicShadowMap }} gl={{ antialias: false }} dpr={0.5}>  
        <PointerLockControls/>
        <Stats/>
        <Physics gravity={[0, -12.81, 0]} timeStep={1/PHYSICS_FPS}>
          <Controllers/>
          <Scene/>
        </Physics>
        <PostProcessing/>
      </Canvas>
    </Suspense>
  </>
}

export default App