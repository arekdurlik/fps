import styled from 'styled-components'
import { useEquipmentState } from '../../state/equipmentState'
import { EquipmentType } from '../../constants'

export function HUD() {
  const { computed: { equipped } } = useEquipmentState();

  return <Wrapper>
    {/* <Crosshair>
      <Dot/>
    </Crosshair> */}
    <GunStats>
      {equipped?.type === EquipmentType.GUN && `Ammo: ${equipped.roundsLeft}/${equipped.roundsPerMag}`}
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

const Crosshair = styled.div`
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