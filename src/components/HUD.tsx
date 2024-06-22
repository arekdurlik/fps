import styled from 'styled-components'
import { useGunState } from '../state/gunState'

export function HUD() {
  const gunState = useGunState();

  return <Wrapper>
    <GunStats>
      Ammo: {gunState.ammoInMag}/{gunState.magCapacity}
    </GunStats>
  </Wrapper>
}

const Wrapper = styled.div`
position: absolute;
inset: 0;
z-index: 1;
pointer-events: none;
`

const GunStats = styled.div`
padding: 20px;
display: flex;
font-size: 22px;
flex-direction: column;
`