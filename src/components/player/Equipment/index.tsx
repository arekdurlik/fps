import * as THREE from 'three'
import { useEffect, useRef } from 'react'
import { EquipmentState, useEquipmentState } from '../../../state/equipmentState'
import { Gun } from '../Gun'
import { useFrame } from '@react-three/fiber'
import { WEAPONS_DATA } from '../../../data'
import { useEquipmentAnimations } from './animations'
import { EquipmentType,} from '../../../constants'
import { PlayerState } from '../../../state/playerState'
import { EquipmentSubject } from '../../../state/equipmentState/types'
import { GunState } from '../../../state/equipmentState/gunState'

export function Equipment() {
  const animations = useEquipmentAnimations();
  const { slots, computed: { equipped } } = useEquipmentState();
  const ref = useRef<THREE.Group>(null!);
  const equippedIndexRef = useRef(useEquipmentState.getState().equippedIndex);
  const itemToEquip = useRef(-1);
  const swapping = useRef(false);

  useEffect(() => {
    const indexUnsubscribe = useEquipmentState.subscribe(
      state => equippedIndexRef.current = state.equippedIndex
    );
    
    const setEquipped = () => EquipmentState.setEquipped(itemToEquip.current);
    const setSwappingFalse = () => PlayerState.setSwappingEquipment(false);

    const eqUnsubscribe = EquipmentState.subscribeMany([
      [EquipmentSubject.ITEM_SWAP, setEquipped],
      [EquipmentSubject.EQUIP_END, setSwappingFalse],
    ]);
    
    document.addEventListener('keydown', handleKey);
    
    return () => {
      indexUnsubscribe();
      eqUnsubscribe();
    }
  }, []);
  
  function handleKey(e: KeyboardEvent) {
    if (PlayerState.swappingEquipment || PlayerState.running || PlayerState.aiming || GunState.reloading) return;
    
    let key = -1;

    switch(e.code) {
      case 'Digit1': key = 1; break;
      case 'Digit2': key = 2; break;
      case 'Digit3': key = 3; break;
      case 'Digit4': key = 4; break;
    }

    itemToEquip.current = key - 1;
    
    if (itemToEquip.current !== equippedIndexRef.current && key > 0 && key <= slots.length) {

      const unequipTime =  WEAPONS_DATA[slots[equippedIndexRef.current].itemName].unequipTime;
      const equipTime = WEAPONS_DATA[slots[itemToEquip.current].itemName].equipTime;

      animations.swap(unequipTime, equipTime);
      PlayerState.setSwappingEquipment();
      EquipmentState.notify(EquipmentSubject.EQUIP_BEGIN);
    }
  }

  useFrame(() => {
    if (!PlayerState.swappingEquipment) return;

    ref.current.position.x = animations.posX;
    ref.current.position.y = animations.posY;
    ref.current.rotation.z = animations.rot;
  });

  function getItem() {
    switch(equipped?.type) {
      case EquipmentType.GUN: {
        return <Gun {...(equipped)}/>
      }
      default: return <></>;
    }
  }
  
  return <group ref={ref}>
    {getItem()}
  </group>
}