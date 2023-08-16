import React, { useEffect, useRef } from 'react';
import styles from './button.module.css';

// Ajout de la prop onClick
interface GlowButtonProps {
  onClick?: () => void;
}

const GlowButton: React.FC<GlowButtonProps> = ({ onClick }) => {
  const spanRef = useRef<HTMLSpanElement>(null); 

  useEffect(() => {
    const span = spanRef.current;

    const handleMouseMove = (e: MouseEvent) => {
      if (span) {
        const rect = span.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        span.style.setProperty('--pointer-x', `${x}px`);
        span.style.setProperty('--pointer-y', `${y}px`);
      }
    };

    const handleMouseLeave = () => {
      if (span) {
        span.style.setProperty('--button-glow-opacity', '0');
      }
    };

    if (span) {
      span.addEventListener('mousemove', handleMouseMove);
      span.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      if (span) {
        span.removeEventListener('mousemove', handleMouseMove);
        span.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  return (
    <button className={styles.glowButton} onClick={onClick}>
      <div className={styles.gradient}></div>
      <span ref={spanRef}>PLAY</span>
    </button>
  );
};

export default GlowButton;
