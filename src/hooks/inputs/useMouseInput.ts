import { useEffect, useRef } from 'react'

export function useMouseInput() {
  const keysPressed = useRef({ left: false, right: false });

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (e.button === 2) {
        keysPressed.current = { ...keysPressed.current, right: true };
      } else if (e.button === 0) {
        keysPressed.current = { ...keysPressed.current, left: true };
      }
    }

    function handleMouseUp(e: MouseEvent) {
      if (e.button === 2) {
        keysPressed.current = { ...keysPressed.current, right: false };
      } else if (e.button === 0) {
        keysPressed.current = { ...keysPressed.current, left: false };
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return keysPressed;
}
