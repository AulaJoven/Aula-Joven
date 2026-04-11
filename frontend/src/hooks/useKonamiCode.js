import { useEffect, useRef } from 'react';

const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a',
];

export function useKonamiCode(onActivate) {
  const sequenceRef = useRef([]);

  useEffect(() => {
    const handleKey = (e) => {
      sequenceRef.current.push(e.key);
      if (sequenceRef.current.length > KONAMI.length) {
        sequenceRef.current.shift();
      }
      if (sequenceRef.current.join(',') === KONAMI.join(',')) {
        sequenceRef.current = [];
        onActivate();
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onActivate]);
}