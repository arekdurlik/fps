import { useControls } from 'leva'
import { useEffect } from 'react'
import { useWorldState, WorldState } from '../../../state/worldState'

export function WorldParams() {
  const time = useWorldState(state => state.time);

  const world = useControls('World', {
    time: { value: time, min: 0, max: 1 },
  });

  useEffect(() => {
    WorldState.setTime(world.time);
  }, [world])

  return null;
}