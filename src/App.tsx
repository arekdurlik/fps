import './App.css'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Suspense } from 'react'
import { PostProcessing } from './components/scene/PostProcessing'
import { Console } from './components/debug/Console'
import { Stats } from './components/debug/Stats'
import { Scene } from './components/scene'
import { HUD } from './components/HUD'

function App() {
  return <>
    <Console/>
    <HUD/>
    <Suspense fallback={null}>
      <Canvas 
        shadows 
        gl={{ antialias: false }} 
        dpr={0.5}
      > 
          <Stats/>
          <Scene/>
          <PointerLockControls />
          <PostProcessing/>
      </Canvas>
    </Suspense>
  </>
}

export default App