import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface ProjectQRCodeProps {
  url: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

export default function ProjectQRCode({ url, size = 120, fgColor = '#000000', bgColor = '#ffffff' }: ProjectQRCodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    let active = true;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Use a temporary canvas to generate the QR code mask
    const tempCanvas = document.createElement('canvas');
    QRCode.toCanvas(tempCanvas, url, {
      width: size,
      margin: 1.5,
      color: {
        dark: '#000000ff',
        light: '#00000000', // Transparent background
      },
    })
      .then(() => {
        if (!active) return;
        
        canvas.width = size;
        canvas.height = size;
        
        // Clear canvas
        ctx.clearRect(0, 0, size, size);

        // Draw the QR code pixels
        ctx.drawImage(tempCanvas, 0, 0);

        // Create gradient based on fgColor
        const gradient = ctx.createLinearGradient(0, 0, size, size);
        gradient.addColorStop(0, fgColor);
        // We'll blend to a complementary or a slight off-shade for the dynamic gradient effect
        gradient.addColorStop(1, '#ffffff'); // Subtle light gradient finish

        // Apply gradient only to the drawn QR pixels
        ctx.globalCompositeOperation = 'source-in';
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);

        // Draw the background color behind the QR code
        ctx.globalCompositeOperation = 'destination-over';
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, size, size);
        
        // Reset composite operation
        ctx.globalCompositeOperation = 'source-over';
      })
      .catch((err) => {
        console.error("QR component error:", err);
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [url, size, fgColor, bgColor]);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-zinc-900 border border-zinc-800 rounded p-2 text-zinc-500 font-mono text-[9px]" style={{ width: size, height: size }}>
        QR ERROR
      </div>
    );
  }

  return (
    <canvas 
      ref={canvasRef}
      className="rounded border border-zinc-800 bg-white" 
      style={{ width: size, height: size }}
    />
  );
}
