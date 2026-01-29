// src/components/Planet.tsx
import { useEffect, useRef } from 'react';

interface PlanetProps {
  name: string;
  color: string;
  size?: 'sm' | 'md' | 'lg';
  hasRing?: boolean; // NEW: Only industry planets have rings
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

export default function Planet({
  name,
  color,
  size = 'md',
  hasRing = false, // Default no ring
  onClick,
  className = '',
  style = {},
}: PlanetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const sizeClasses = {
    sm: 'w-[clamp(60px,5vw,90px)] h-[clamp(60px,5vw,90px)]', // Smaller for jobs
    md: 'w-[clamp(100px,7.5vw,130px)] h-[clamp(100px,7.5vw,130px)]', // Medium for fields
    lg: 'w-[clamp(140px,10vw,180px)] h-[clamp(140px,10vw,180px)]', // Large for industries
  };

  const sizeMap = {
    sm: 75,
    md: 115,
    lg: 160,
  };

  // Convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 100, g: 150, b: 255 };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const planetSize = sizeMap[size];
    const dpr = window.devicePixelRatio || 1;

    // Set canvas size with device pixel ratio for crisp rendering
    const canvasMultiplier = hasRing ? 2.5 : 2; // Smaller canvas if no ring
    canvas.width = planetSize * canvasMultiplier * dpr;
    canvas.height = planetSize * canvasMultiplier * dpr;
    canvas.style.width = `${planetSize * canvasMultiplier}px`;
    canvas.style.height = `${planetSize * canvasMultiplier}px`;

    ctx.scale(dpr, dpr);

    const centerX = (planetSize * canvasMultiplier) / 2;
    const centerY = (planetSize * canvasMultiplier) / 2;
    const radius = planetSize / 2;

    // Get color RGB
    const rgb = hexToRgb(color);
    const colorRgba = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw outer colored glow halo
    const haloGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.8, centerX, centerY, radius * 2);
    haloGradient.addColorStop(0, `${colorRgba}, 0.5)`);
    haloGradient.addColorStop(0.3, `${colorRgba}, 0.25)`);
    haloGradient.addColorStop(0.7, `${colorRgba}, 0)`);
    ctx.fillStyle = haloGradient;
    ctx.filter = 'blur(20px)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.filter = 'none';

    // Draw main planet sphere with color tint
    const planetGradient = ctx.createRadialGradient(
      centerX - radius * 0.2,
      centerY - radius * 0.2,
      0,
      centerX,
      centerY,
      radius
    );
    
    // Lighter color at center, darker at edges
    planetGradient.addColorStop(0, '#ffffff');
    planetGradient.addColorStop(0.3, `${colorRgba}, 0.3)`);
    planetGradient.addColorStop(0.6, `${colorRgba}, 0.6)`);
    planetGradient.addColorStop(1, `${colorRgba}, 0.85)`);

    ctx.shadowColor = `${colorRgba}, 0.7)`;
    ctx.shadowBlur = 40;
    ctx.fillStyle = planetGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Add inner shadow to planet
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    const innerShadowGradient = ctx.createRadialGradient(
      centerX,
      centerY + radius * 0.3,
      radius * 0.5,
      centerX,
      centerY,
      radius
    );
    innerShadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
    innerShadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0.2)');
    ctx.fillStyle = innerShadowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    // Draw colored rim glow
    const rimGradient = ctx.createRadialGradient(centerX, centerY, radius * 0.9, centerX, centerY, radius * 1.15);
    rimGradient.addColorStop(0, `${colorRgba}, 0)`);
    rimGradient.addColorStop(0.5, `${colorRgba}, 0.6)`);
    rimGradient.addColorStop(1, `${colorRgba}, 0)`);
    ctx.filter = 'blur(6px)';
    ctx.fillStyle = rimGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.filter = 'none';

    // ONLY draw ring if hasRing is true (industry planets only)
    if (hasRing) {
      const ringRadiusX = radius * 1.9;
      const ringRadiusY = radius * 0.48;
      const ringThickness = 4;
      const tiltAngle = -15 * (Math.PI / 180);

      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(tiltAngle);

      // Draw ring back part (behind planet)
      ctx.strokeStyle = `${colorRgba}, 0.25)`;
      ctx.lineWidth = ringThickness;
      ctx.shadowColor = `${colorRgba}, 0.3)`;
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, Math.PI, Math.PI * 2);
      ctx.stroke();

      // Draw ring front part (in front of planet)
      ctx.strokeStyle = `${colorRgba}, 0.9)`;
      ctx.lineWidth = ringThickness;
      ctx.shadowColor = `${colorRgba}, 0.8)`;
      ctx.shadowBlur = 20;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX, ringRadiusY, 0, 0, Math.PI);
      ctx.stroke();

      // Add inner ring for thickness
      ctx.strokeStyle = `${colorRgba}, 0.55)`;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.ellipse(0, 0, ringRadiusX * 0.95, ringRadiusY * 0.95, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.shadowBlur = 0;

      // Draw dots on the ring (front part)
      const dotCount = 5;
      const dotRadius = 4.5;
      for (let i = 0; i < dotCount; i++) {
        const angle = (i * (Math.PI / dotCount)) + 0.2;
        const x = ringRadiusX * Math.cos(angle);
        const y = ringRadiusY * Math.sin(angle);

        // Draw dot with glow
        const dotGradient = ctx.createRadialGradient(x, y, 0, x, y, dotRadius * 2);
        dotGradient.addColorStop(0, '#ffffff');
        dotGradient.addColorStop(0.4, `${colorRgba}, 0.9)`);
        dotGradient.addColorStop(1, `${colorRgba}, 0)`);

        ctx.fillStyle = dotGradient;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.arc(x, y, dotRadius, 0, Math.PI * 2);
        ctx.fill();

        // Core white dot
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(x, y, dotRadius * 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }
  }, [size, color, hasRing]);

  return (
    <div
      ref={containerRef}
      className={`relative cursor-pointer group ${sizeClasses[size]} ${className}`}
      style={style}
      onClick={onClick}
    >
      {/* Canvas for planet and ring */}
      <canvas
        ref={canvasRef}
        className="absolute"
        style={{
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          pointerEvents: 'none',
        }}
      />

      {/* Sparkle stars around the planet - only for large planets with rings */}
      {hasRing && size === 'lg' && [
        { top: '8%', left: '15%', size: 'w-1.5 h-1.5', delay: 0 },
        { top: '22%', left: '88%', size: 'w-2 h-2', delay: 0.5 },
        { top: '78%', left: '12%', size: 'w-1 h-1', delay: 1 },
        { top: '85%', left: '82%', size: 'w-1.5 h-1.5', delay: 1.5 },
      ].map((star, i) => (
        <div
          key={`star-${i}`}
          className={`absolute ${star.size} pointer-events-none`}
          style={{
            top: star.top,
            left: star.left,
          }}
        >
          {/* Four-pointed star */}
          <div
            className="absolute inset-0"
            style={{
              background: 'white',
              clipPath: 'polygon(50% 0%, 55% 45%, 100% 50%, 55% 55%, 50% 100%, 45% 55%, 0% 50%, 45% 45%)',
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
              animation: `twinkle ${2 + star.delay}s ease-in-out infinite`,
              animationDelay: `${star.delay}s`,
            }}
          />
        </div>
      ))}

      {/* Label below orb */}
      <span className="absolute left-1/2 -translate-x-1/2 bottom-[-35%] text-center text-white text-xs font-medium drop-shadow-lg whitespace-pre-wrap max-w-[120%] leading-tight">
        {name}
      </span>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.8); }
        }
      `}</style>
    </div>
  );
}