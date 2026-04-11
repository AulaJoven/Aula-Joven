// src/components/estudiante/ColorGame.jsx
import { useState, useCallback } from 'react';

function getDelta(lvl) {
  return Math.max(3, Math.round(60 * Math.pow(0.88, lvl - 1)));
}

function hslStr(h, s, l) {
  return `hsl(${(h + 360) % 360},${s}%,${l}%)`;
}

function generateRound(lvl) {
  const h = Math.floor(Math.random() * 360);
  const s = 60 + Math.floor(Math.random() * 20);
  const l = 45 + Math.floor(Math.random() * 15);
  const delta = getDelta(lvl);
  const sign = Math.random() > 0.5 ? 1 : -1;
  return {
    baseColor: hslStr(h, s, l),
    oddColor:  hslStr(h + sign * delta, s, l),
    oddIndex:  Math.floor(Math.random() * 4),
    delta,
  };
}

export default function ColorGame({ onClose }) {
  const [level,    setLevel]    = useState(1);
  const [score,    setScore]    = useState(0);
  const [lives,    setLives]    = useState(3);
  const [round,    setRound]    = useState(() => generateRound(1));
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [finished, setFinished] = useState(false);

  const next = useCallback((nextLevel) => {
    setSelected(null);
    setFeedback('');
    setRound(generateRound(nextLevel));
  }, []);

  const handlePick = (index) => {
    if (selected !== null || finished) return;
    setSelected(index);

    if (index === round.oddIndex) {
      setScore(s => s + 1);
      setFeedback('¡Correcto!');
      const nextLevel = level + 1;
      setLevel(nextLevel);
      setTimeout(() => next(nextLevel), 700);
    } else {
      const newLives = lives - 1;
      setLives(newLives);
      setFeedback(newLives > 0
        ? `Incorrecto — te quedan ${newLives} vida${newLives !== 1 ? 's' : ''}`
        : 'Sin vidas — ¡game over!'
      );
      if (newLives <= 0) {
        setTimeout(() => setFinished(true), 900);
      } else {
        setTimeout(() => next(level), 900);
      }
    }
  };

  const restart = () => {
    setLevel(1); setScore(0); setLives(3);
    setSelected(null); setFeedback(''); setFinished(false);
    setRound(generateRound(1));
  };

  const getBorderColor = (i) => {
    if (selected === null) return 'transparent';
    if (i === round.oddIndex) return '#16a34a';
    if (i === selected)       return '#dc2626';
    return 'transparent';
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 9999,
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '100%', maxWidth: 420,
        overflow: 'hidden',
      }}>

        {/* Header — mismo gradiente que el banner del dashboard */}
        <div style={{
          background: 'linear-gradient(135deg, #3D52A0 0%, #6366f1 60%, #8b5cf6 100%)',
          padding: '1.25rem 1.5rem',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: -16, right: -16,
            width: 80, height: 80,
            background: 'rgba(255,255,255,0.12)', borderRadius: '50%',
          }}/>
          <div style={{
            position: 'absolute', bottom: -20, right: 60,
            width: 60, height: 60,
            background: 'rgba(255,255,255,0.10)', borderRadius: '50%',
          }}/>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase' }}>
              Color Code
            </span>
            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.15)', border: 'none',
                color: '#fff', width: 28, height: 28, borderRadius: '50%',
                cursor: 'pointer', fontSize: 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >✕</button>
          </div>
          <h2 style={{ color: '#fff', fontSize: 18, fontWeight: 700, margin: '0 0 2px', position: 'relative', zIndex: 1 }}>
            ¿Cuál es diferente?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 12, margin: 0, position: 'relative', zIndex: 1 }}>
            Encontrá el cuadrado que no encaja
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          {!finished ? (
            <>
              {/* Vidas */}
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: i < lives ? '#ef4444' : '#e5e7eb',
                  }}/>
                ))}
              </div>

              {/* Grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 10, maxWidth: 240, margin: '0 auto 14px',
              }}>
                {[0, 1, 2, 3].map(i => (
                  <div
                    key={i}
                    onClick={() => handlePick(i)}
                    style={{
                      aspectRatio: '1', borderRadius: 10, cursor: 'pointer',
                      background: i === round.oddIndex ? round.oddColor : round.baseColor,
                      border: `2px solid ${getBorderColor(i)}`,
                      transition: 'transform 0.1s',
                    }}
                    onMouseEnter={e => { if (selected === null) e.currentTarget.style.transform = 'scale(1.05)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  />
                ))}
              </div>

              {/* Feedback */}
              <p style={{ fontSize: 13, color: '#6b7280', minHeight: 18, textAlign: 'center', marginBottom: 12 }}>
                {feedback}
              </p>

              {/* Stats */}
              <div style={{ display: 'flex', gap: 8 }}>
                {[{ label: 'Nivel', value: level }, { label: 'Puntos', value: score }].map(({ label, value }) => (
                  <div key={label} style={{
                    flex: 1, background: '#F0F2F5',
                    borderRadius: 10, padding: 10, textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {label}
                    </div>
                    <div style={{ fontSize: 20, fontWeight: 700, color: '#3D52A0' }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 11, color: '#272728', textAlign: 'center', marginTop: 10 }}>
                diferencia actual: {round.delta}°
              </p>
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
              <div style={{ fontSize: 48, fontWeight: 700, color: '#3D52A0', lineHeight: 1, marginBottom: 4 }}>
                {score}
              </div>
              <p style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
                puntos · llegaste al nivel {level}
              </p>
              <button
                onClick={restart}
                style={{
                  background: '#3D52A0', color: '#fff', border: 'none',
                  padding: '10px 28px', borderRadius: 8,
                  fontSize: 14, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Jugar de nuevo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}