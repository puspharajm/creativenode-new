import React, { useEffect, useRef } from 'react';

export default function ConfettiCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Dynamic resize handler
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Particle class
    interface Particle {
      x: number;
      y: number;
      size: number;
      color: string;
      speedX: number;
      speedY: number;
      rotation: number;
      rotationSpeed: number;
      opacity: number;
    }

    const colors = [
      '#d4af37', // Gold
      '#f3e5ab', // Soft Cream
      '#ef4444', // Red Accent
      '#ffffff', // White
      '#a1a1aa', // Zinc Grey
      '#ec4899', // Pink Cyber
    ];

    const particles: Particle[] = [];

    // Create immediate energetic burst
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: width / 2,
        y: height / 2 - 50,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: (Math.random() - 0.5) * 16,
        speedY: (Math.random() - 0.7) * 16 - 4,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.15,
        opacity: 1,
      });
    }

    // Side-burst emitters for cinematic depth
    const addSideBurst = (startX: number) => {
      for (let i = 0; i < 40; i++) {
        particles.push({
          x: startX,
          y: height - 100,
          size: Math.random() * 7 + 4,
          color: colors[Math.floor(Math.random() * colors.length)],
          speedX: (startX < width / 2 ? 1 : -1) * (Math.random() * 8 + 4),
          speedY: -Math.random() * 15 - 5,
          rotation: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.15,
          opacity: 1,
        });
      }
    };

    // Trigger secondary side bursts after 200ms
    const sideTimeout1 = setTimeout(() => addSideBurst(50), 250);
    const sideTimeout2 = setTimeout(() => addSideBurst(width - 50), 450);

    // Physics Loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        
        // Physics update
        p.x += p.speedX;
        p.y += p.speedY;
        p.speedY += 0.22; // Gravity
        p.speedX *= 0.98; // Friction
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.006; // Gradual fade-out

        // Remove dead particles
        if (p.opacity <= 0 || p.y > height) {
          particles.splice(i, 1);
          continue;
        }

        // Draw individual confetti flake
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.fillStyle = p.color;
        
        // Render rectangular flag shapes
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      }

      if (particles.length > 0) {
        animationId = requestAnimationFrame(render);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
      clearTimeout(sideTimeout1);
      clearTimeout(sideTimeout2);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="confetti-overlay-canvas"
      className="fixed inset-0 w-full h-full pointer-events-none z-[100]"
    />
  );
}
