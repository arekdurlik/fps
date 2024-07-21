import { EffectComposer, Noise, Vignette, TiltShift, ToneMapping, SMAA, Bloom, BrightnessContrast } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'

export function PostProcessing() {
  return <EffectComposer multisampling={0}>
    <Noise opacity={0.001} blendFunction={BlendFunction.LIGHTEN}/>
    <Vignette darkness={0.5} offset={0.1} />
    {/* <TiltShift focusArea={0} opacity={0.15} kernelSize={KernelSize.HUGE} /> */}
    <Bloom luminanceThreshold={0.5} kernelSize={KernelSize.LARGE} opacity={0.25}/>
    <ToneMapping blendFunction={BlendFunction.ADD}/>
  </EffectComposer>
}