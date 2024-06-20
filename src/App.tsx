import './App.css'
import { Canvas } from '@react-three/fiber'
import { PointerLockControls } from '@react-three/drei'
import { Suspense } from 'react'
import { PostProcessing } from './components/scene/PostProcessing'
import { Console } from './components/scene/Console'
import { Stats } from './components/debug/Stats'
import { Scene } from './components/scene'

function App() {
  
  return <>
    <Console/>
    <Canvas 
      shadows 
      gl={{ antialias: false }} 
      dpr={0.5}
    > 
      <Suspense>
        <Stats/>
        <Scene/>
        <PointerLockControls />
        <PostProcessing/>
      </Suspense>
    </Canvas>
  </>
}

export default App