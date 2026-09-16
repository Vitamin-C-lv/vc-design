'use client';

import { useRef } from 'react';
import { heroField } from '@/content/site';
import { useIsomorphicLayoutEffect } from '@/lib/motion/useGsap';

/**
 * One-canvas underprint for the hero. The layout is deterministic so the field
 * feels like a designed technical sheet rather than generated noise. Drawing
 * once on weak/reduced-motion devices keeps the texture without a render loop.
 */
export function HeroField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useIsomorphicLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    const startedAt = performance.now();

    const draw = (now = performance.now()) => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (!width || !height) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);

      const columnWidth = width / heroField.gridColumns;
      const rowHeight = height / heroField.gridRows;

      context.lineWidth = 0.75;
      context.strokeStyle = 'rgba(15, 15, 15, 0.07)';
      for (let column = 0; column <= heroField.gridColumns; column += 1) {
        const x = Math.round(column * columnWidth) + 0.5;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
      }
      for (let row = 0; row <= heroField.gridRows; row += 1) {
        const y = Math.round(row * rowHeight) + 0.5;
        context.beginPath();
        context.moveTo(0, y);
        context.lineTo(width, y);
        context.stroke();
      }

      const fontSize = Math.max(8, Math.min(11, width / 145));
      context.font = `${fontSize}px ui-monospace, SFMono-Regular, Menlo, monospace`;
      context.textBaseline = 'middle';
      context.fillStyle = 'rgba(15, 15, 15, 0.13)';

      heroField.words.forEach((word, index) => {
        const column = index % heroField.gridColumns;
        const row = Math.floor(index / heroField.gridColumns);
        const offset = row % 2 === 0 ? columnWidth * 0.12 : columnWidth * 0.2;
        const phase = index * 0.73;
        const amplitude = 1 + (index % 3);
        const period = 9000 + (index % 8) * 1000;
        const drift = prefersReducedMotion
          ? 0
          : Math.sin(((now - startedAt) / period) * Math.PI * 2 + phase) * amplitude;
        const x = column * columnWidth + offset + drift;
        const y = row * rowHeight + rowHeight * 0.52 + drift * 0.65;
        context.fillText(word, x, y);
      });

      if (!prefersReducedMotion) frame = requestAnimationFrame(draw);
    };

    draw();
    const redraw = () => draw();
    const observer = new ResizeObserver(redraw);
    observer.observe(canvas);
    void document.fonts?.ready.then(redraw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return (
    <div data-hero-field className="hero-field" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-field-canvas" />
    </div>
  );
}
