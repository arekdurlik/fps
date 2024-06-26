import { useEffect, useRef } from 'react'

export function useMouseInputRef() {
  const buttonsPressed = useRef({ lmb: false, rmb: false });

  useEffect(() => {
    function handleMouseDown(e: MouseEvent) {
      if (e.button === 2) {
        buttonsPressed.current = { ...buttonsPressed.current, rmb: true };
      } else if (e.button === 0) {
        buttonsPressed.current = { ...buttonsPressed.current, lmb: true };
      }
    }

    function handleMouseUp(e: MouseEvent) {
      if (e.button === 2) {
        buttonsPressed.current = { ...buttonsPressed.current, rmb: false };
      } else if (e.button === 0) {
        buttonsPressed.current = { ...buttonsPressed.current, lmb: false };
      }
    }

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return buttonsPressed;
}
