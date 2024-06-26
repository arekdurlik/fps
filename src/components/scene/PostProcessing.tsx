import { EffectComposer, Noise, Vignette, TiltShift, ToneMapping, SMAA } from '@react-three/postprocessing'
import { BlendFunction, KernelSize } from 'postprocessing'

export const PostProcessing = () => (
  <EffectComposer multisampling={0}>
    {/* <Vignette darkness={1} offset={0.1} /> */}
    <TiltShift focusArea={0} opacity={0.25} kernelSize={KernelSize.HUGE} />

    <Noise opacity={0.001} blendFunction={BlendFunction.LIGHTEN}/>
    <ToneMapping/>
  </EffectComposer>
)