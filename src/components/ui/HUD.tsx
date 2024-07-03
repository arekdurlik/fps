import styled from 'styled-components'
import { useGunState } from '../../state/gunState'

export function HUD() {
  const gunState = useGunState();

  return <Wrapper>
    {/* <Reticle>
      <Dot/>
    </Reticle> */}
    <GunStats>
      Ammo: {gunState.ammoInMag}/{gunState.magCapacity}
    </GunStats>
  </Wrapper>
}

const Wrapper = styled.div`
position: absolute;
inset: 0;
z-index: 1;
`

const GunStats = styled.div`
position: absolute;
inset: 0;
padding: 20px;
display: flex;
font-size: 22px;
flex-direction: column;
justify-content: flex-end;
pointer-events: none;
`

const Reticle = styled.div`
position: absolute;
inset: 0;
display: grid;
place-items: center;
z-index: 1;
`

const Dot = styled.div`
width: 6px;
height: 6px;
background-color: #ffffff22;
`