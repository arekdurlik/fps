import { useEffect, useRef } from 'react'

export function useMouseVelocity() {
  const velocity = useRef({ x: 0, y: 0 });
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      clearTimeout(timeout.current);
      const { movementX: x, movementY: y } = e;
      velocity.current = { x, y: -y };

      timeout.current = setTimeout(() => {
        velocity.current = { x: 0, y: 0 };
      }, 10);
    }

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timeout.current);
    };
  }, []);

  return velocity;
}
