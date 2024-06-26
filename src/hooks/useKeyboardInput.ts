import { useCallback, useEffect, useRef, useState } from 'react'

type HookReturn = {
  [key:string]: boolean
};

export function useKeyboardInput(keysToListen = <string[]>[]) {
  const getKeys = useCallback(() => {
    const lowerCaseArray = <string[]>[];
    const hookReturn = <HookReturn>{};

    keysToListen.forEach((key) => {
      const lowerCaseKey = key.toLowerCase();
      const safeKey = getSafeKey(lowerCaseKey);
      lowerCaseArray.push(safeKey);
      hookReturn[safeKey] = false;
    });

    return {
      lowerCaseArray,
      hookReturn
    };
  }, [keysToListen]);

  const [keysPressed, setPressedKeys] = useState(getKeys().hookReturn);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const lowerKey = e.key.toLowerCase();
      const safeKey = getSafeKey(lowerKey);

      if (getKeys().lowerCaseArray.includes(safeKey)) {
        setPressedKeys((keysPressed) => ({ ...keysPressed, [safeKey]: true }));
      }
    }

    function handleKeyUp (e: KeyboardEvent) {
      const lowerKey = e.key.toLowerCase();
      const safeKey = getSafeKey(lowerKey);

      if (getKeys().lowerCaseArray.includes(safeKey)) {
        setPressedKeys((keysPressed) => ({ ...keysPressed, [safeKey]: false }));
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [keysToListen, getKeys]);

  return keysPressed;
}

function getSafeKey(key: string) {
  switch(key) {
    case ' ':
      return 'space';
    case '`':
      return 'tilde';
    default:
      return key;
  }
}
export function useKeyboardInputRef(keysToListen = <string[]>[]) {
  const getKeys = useCallback(() => {
    const lowerCaseArray = <string[]>[];
    const hookReturn = <HookReturn>{};

    keysToListen.forEach((key) => {
      const lowerCaseKey = key.toLowerCase();
      lowerCaseArray.push(getSafeKey(lowerCaseKey));
      hookReturn[lowerCaseKey] = false;
    });

    return {
      lowerCaseArray,
      hookReturn
    };
  }, [keysToListen]);

  const keysPressed = useRef(getKeys().hookReturn);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const lowerKey = getSafeKey(e.key.toLowerCase());

      if (getKeys().lowerCaseArray.includes(lowerKey)) {
        keysPressed.current = { ...keysPressed.current, [lowerKey]: true };
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      const lowerKey = getSafeKey(e.key.toLowerCase());
      
      if (getKeys().lowerCaseArray.includes(lowerKey)) {
        keysPressed.current = { ...keysPressed.current, [lowerKey]: false };
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [keysToListen, getKeys]);

  return keysPressed;
}