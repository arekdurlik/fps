import { StatsGl } from '@react-three/drei'
import { Perf, usePerf, setCustomData } from 'r3f-perf'
import { useEffect, useRef } from 'react'
import { useFixedFrame } from '../../hooks/useFixedFrame'
import { useFrame } from '@react-three/fiber'

export function Stats() {
  const perf = usePerf();
  const maxGPU = useRef(0);
  const startRecording = useRef(false);

  useEffect(() => {
    setTimeout(() => {
      startRecording.current = true;
    }, 1000);
  }, []);
  
  useFrame(() => {
    if (!startRecording.current) return;

    const newPerf = perf.getReport().log.gpu;

    if (newPerf > maxGPU.current) {
      setCustomData(newPerf);
      maxGPU.current = newPerf;
    }
  });

  return <>
    {/* <StatsGl className='stats-box'/> */}
    <Perf overclock antialias={false} position='bottom-right' customData={{
      value: 0,
      name: 'Max GPU ms',
      round: 3,
      info: ''
    }} />
  </>
}