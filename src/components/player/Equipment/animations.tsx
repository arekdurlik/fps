import { easings, useSpring } from '@react-spring/three'
import { EquipmentState, EquipmentSubject } from '../../../state/equipmentState'

export function useEquipmentAnimations() {
  const [{ posX, posY, rot }, spring] = useSpring(() => ({ posX: 0, posY: 0, rot: 0 }));

  function swap(equipTime: number, unequipTime: number) {
    spring.start({
      to: [
        { posX: 0.05, posY: -0.15, rot: 0.5, 
          config: { duration: unequipTime, easing: easings.easeInOutSine },  
          onResolve() {
          EquipmentState.notify(EquipmentSubject.ITEM_SWAP);
          }
        },
        { posX: 0, posY: 0, rot: 0, 
          config: { duration: equipTime }, 
          onResolve() {
            EquipmentState.notify(EquipmentSubject.EQUIP_END);
          }
        },
      ]
    })
  }

  return {
    swap,
    get posX() { return posX.get() },
    get posY() { return posY.get() },
    get rot() { return rot.get() }
  };
}