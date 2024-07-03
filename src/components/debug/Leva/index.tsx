import { useEffect } from 'react'
import { GunParams } from './GunParams'

export function LevaParams() {
  useEffect(() => {
    setTimeout(() => {
      const el = document.querySelector('#leva__root') as HTMLDivElement;
      el.addEventListener('mousedown', e => e.stopPropagation());
      el.addEventListener('click', e => e.stopPropagation());
      el.addEventListener('poinerdown', e => e.stopPropagation());
    }, 250);
  }, []);

  return <>
    <GunParams/>
  </>
}