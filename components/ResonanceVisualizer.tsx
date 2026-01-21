
import React, { useEffect, useRef } from 'react';

const ResonanceVisualizer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles: { x: number, y: number, r: number, o: number, v: number }[] = [];

    const createParticle = () => {
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2,
        o: Math.random() * 0.5,
        v: Math.random() * 0.2 + 0.1
      };
    };

    for (let i = 0; i < 50; i++) {
      particles.push(createParticle());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#ffffff';

      particles.forEach(p => {
        p.o -= p.v * 0.01;
        if (p.o <= 0) {
          const newP = createParticle();
          p.x = newP.x;
          p.y = newP.y;
          p.o = 0.5;
        }
        ctx.globalAlpha = p.o;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);
    animate();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed top-0 left-0 w-full h-full pointer-events-none opacity-20 z-0"
    />
  );
};

export default ResonanceVisualizer;
