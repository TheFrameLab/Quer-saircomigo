import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface RunawayButtonProps {
  id?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  colorType?: 'danger' | 'pastel' | 'custom';
}

export const RunawayButton: React.FC<RunawayButtonProps> = ({
  id,
  children,
  className = '',
  onClick,
  colorType = 'danger',
}) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Use spring animation for cute, smooth, organic bounciness
  const springX = useSpring(0, { stiffness: 180, damping: 15 });
  const springY = useSpring(0, { stiffness: 180, damping: 15 });

  useEffect(() => {
    springX.set(offset.x);
    springY.set(offset.y);
  }, [offset, springX, springY]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!buttonRef.current) return;

      const rect = buttonRef.current.getBoundingClientRect();
      const buttonCenterX = rect.left + rect.width / 2;
      const buttonCenterY = rect.top + rect.height / 2;

      const mouseX = e.clientX;
      const mouseY = e.clientY;

      const dx = buttonCenterX - mouseX;
      const dy = buttonCenterY - mouseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      const threshold = 110; // distance threshold in pixels to start running away

      if (distance < threshold) {
        // Calculate raw push direction
        let angle = Math.atan2(dy, dx);
        if (distance === 0) {
          angle = Math.random() * Math.PI * 2;
        }

        // The closer the mouse, the stronger the push
        const pushForce = threshold - distance + 40;
        const targetX = offset.x + Math.cos(angle) * pushForce;
        const targetY = offset.y + Math.sin(angle) * pushForce;

        // Viewport bounding checks
        const pad = 30;
        // Project current button coordinates with targeted offsets
        const projLeft = rect.left - offset.x + targetX;
        const projTop = rect.top - offset.y + targetY;
        const projRight = projLeft + rect.width;
        const projBottom = projTop + rect.height;

        let clampX = targetX;
        let clampY = targetY;

        // Teleport if trapped closely in corners
        const isTrappedX = projLeft < pad || projRight > window.innerWidth - pad;
        const isTrappedY = projTop < pad || projBottom > window.innerHeight - pad;

        if (isTrappedX && isTrappedY) {
          // Send to a semi-random offset inside the screen
          const randomDirX = Math.random() > 0.5 ? 1 : -1;
          const randomDirY = Math.random() > 0.5 ? 1 : -1;
          clampX = offset.x + randomDirX * (150 + Math.random() * 80);
          clampY = offset.y + randomDirY * (150 + Math.random() * 80);
        } else {
          if (projLeft < pad) {
            clampX = targetX + (pad - projLeft);
          } else if (projRight > window.innerWidth - pad) {
            clampX = targetX - (projRight - (window.innerWidth - pad));
          }

          if (projTop < pad) {
            clampY = targetY + (pad - projTop);
          } else if (projBottom > window.innerHeight - pad) {
            clampY = targetY - (projBottom - (window.innerHeight - pad));
          }
        }

        setOffset({ x: clampX, y: clampY });
      } else if (distance > threshold * 2.5) {
        // return back gently if cursor was moved far away
        if (offset.x !== 0 || offset.y !== 0) {
          setOffset({ x: 0, y: 0 });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [offset]);

  // Snappy runaway triggers (reusable for mouseenter, focus, scale offset updates)
  const handleRunaway = (e?: React.SyntheticEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    const jumpDist = 130 + Math.random() * 80;
    const angles = [
      Math.PI / 4, 
      (3 * Math.PI) / 4, 
      -Math.PI / 4, 
      -(3 * Math.PI) / 4, 
      Math.PI / 2, 
      -Math.PI / 2,
      0,
      Math.PI
    ];
    const pickedAngle = angles[Math.floor(Math.random() * angles.length)];
    
    const runX = Math.cos(pickedAngle) * jumpDist;
    const runY = Math.sin(pickedAngle) * jumpDist;

    setOffset((prev) => {
      let nextX = prev.x + runX;
      let nextY = prev.y + runY;

      if (buttonRef.current) {
        const rect = buttonRef.current.getBoundingClientRect();
        const pad = 30;
        const projL = rect.left - prev.x + nextX;
        const projT = rect.top - prev.y + nextY;
        const screenW = window.innerWidth;
        const screenH = window.innerHeight;

        if (projL < pad || projL + rect.width > screenW - pad) {
          nextX = -prev.x + (Math.random() > 0.5 ? 60 : -60);
        }
        if (projT < pad || projT + rect.height > screenH - pad) {
          nextY = -prev.y + (Math.random() > 0.5 ? 60 : -60);
        }
      }

      return { x: nextX, y: nextY };
    });
  };

  const currentStyles =
    colorType === 'custom'
      ? ''
      : colorType === 'danger'
      ? 'bg-rose-100 border-2 border-rose-300 text-rose-500 shadow-sm shadow-rose-200 px-5 py-2.5 rounded-full font-semibold'
      : 'bg-amber-100 border-2 border-amber-300 text-amber-500 shadow-sm shadow-amber-200 px-5 py-2.5 rounded-full font-semibold';

  return (
    <motion.button
      id={id}
      ref={buttonRef}
      style={{ x: springX, y: springY }}
      onMouseEnter={(e) => handleRunaway(e)}
      onFocus={(e) => handleRunaway(e)}
      onPointerDown={(e) => handleRunaway(e)}
      onTouchStart={(e) => handleRunaway(e)}
      onClick={(e) => {
        // Runaway button should never have onClick proceed for real clicks
        e.preventDefault();
        e.stopPropagation();
        handleRunaway(e);
        // Special case: welcome No button doesn't toggle state, but can play fail click sound
        if (id === 'welcome-no-btn' && onClick) {
          onClick();
        }
      }}
      className={`transition-colors duration-150 relative cursor-pointer select-none active:scale-95 ${currentStyles} ${className}`}
    >
      {children}
    </motion.button>
  );
};
