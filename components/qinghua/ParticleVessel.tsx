'use client';

import { useEffect, useRef } from 'react';
import type {
  BufferGeometry,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  WebGLRenderer,
} from 'three';
import { useDeviceProfile } from '@/lib/motion/device';
import { cx } from '@/lib/utils';
import {
  getParticlePreset,
  particleLooks as particleLookTable,
  particleMotions as particleMotionTable,
  type ParticleStage,
  type ParticleModel,
} from './particlePresets';
import { loadPointCloud, type DecodedPointCloud } from './pointcloud';
import { vesselFragmentShader, vesselVertexShader } from './particleShaders';

export interface ParticleVesselProps {
  /** 使用哪个点云模型 */
  model?: ParticleModel;
  /** 阶段 id，决定配色与运动 */
  stage?: ParticleStage;
  /** 0–1 显形进度；不传则由组件自己随滚动驱动 */
  reveal?: number;
  /** 相机距离/取景；'focus' 用 15000 点，否则 8000 点 */
  framing?: 'focus' | 'wide';
  className?: string;
  /** 静止兜底图（低端设备 / reduced-motion / 加载失败时显示） */
  fallbackSrc?: string;
  fallbackAlt?: string;
}

type ThreeModule = typeof import('three');

interface Uniforms {
  uTime: { value: number };
  uOpacity: { value: number };
  uPointSize: { value: number };
  uDrift: { value: number };
  uHalo: { value: number };
  uTint: { value: unknown };
  uMotionMode: { value: number };
  uMotionSpeed: { value: number };
  uPulseRate: { value: number };
  uMotionStrength: { value: number };
  uPulseAmount: { value: number };
  uReveal: { value: number };
}

interface VesselRuntime {
  readonly renderer: WebGLRenderer;
  readonly scene: Scene;
  readonly camera: PerspectiveCamera;
  readonly geometry: BufferGeometry;
  readonly materials: ShaderMaterial[];
  readonly points: Points[];
  setReveal(value: number): void;
  setStage(stage: ParticleStage, framing: 'focus' | 'wide'): void;
  render(time: number): void;
  resize(): void;
  dispose(): void;
}

const DATA_ROOT = '/qinghua';
function clamp(value: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
}

function cssColor(root: HTMLElement, variable: string, fallback: string): string {
  const value = getComputedStyle(root).getPropertyValue(variable).trim();
  return value || fallback;
}

function buildRuntime(
  THREE: ThreeModule,
  canvas: HTMLCanvasElement,
  data: DecodedPointCloud,
  stage: ParticleStage,
  framing: 'focus' | 'wide',
  isCompact: boolean,
  colorRoot: HTMLElement,
): VesselRuntime {
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(data.position, 3));
  geometry.setAttribute('normal', new THREE.Float32BufferAttribute(data.normal, 3));
  geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(data.aPhase, 1));
  geometry.setAttribute('aScale', new THREE.Float32BufferAttribute(data.aScale, 1));
  geometry.setAttribute('aVertical', new THREE.Float32BufferAttribute(data.aVertical, 1));

  const pointColors = new Float32Array(data.count * 3);
  const pointColor = new THREE.Color();
  const colorAttribute = new THREE.Float32BufferAttribute(pointColors, 3);
  const preset = getParticlePreset(stage);
  const look = getLook(preset.look);
  const updateColors = (nextStage: ParticleStage) => {
    const nextPreset = getParticlePreset(nextStage);
    const nextLook = getLook(nextPreset.look);
    const nextCoreColor = new THREE.Color(nextLook.coreColor);
    const nextAccentColor = new THREE.Color(nextLook.accentColor);
    const toneValue = cssColor(colorRoot, nextPreset.particleColorVar, '');
    const nextToneColor = toneValue ? new THREE.Color(toneValue) : nextCoreColor.clone();
    for (let index = 0; index < data.count; index += 1) {
      pointColor.copy(nextCoreColor).lerp(nextAccentColor, data.colorMix[index]).lerp(nextToneColor, 0.08);
      pointColor.toArray(pointColors, index * 3);
    }
    colorAttribute.needsUpdate = true;
  };
  updateColors(stage);
  geometry.setAttribute('color', colorAttribute);

  const center = [
    (data.bounds.min[0] + data.bounds.max[0]) * 0.5,
    (data.bounds.min[1] + data.bounds.max[1]) * 0.5,
    (data.bounds.min[2] + data.bounds.max[2]) * 0.5,
  ] as const;
  const extent = Math.max(
    data.bounds.max[0] - data.bounds.min[0],
    data.bounds.max[1] - data.bounds.min[1],
    data.bounds.max[2] - data.bounds.min[2],
    0.25,
  );

  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: !isCompact,
    depth: true,
    stencil: false,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0, 0);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isCompact ? 1.5 : 2));

  const scene = new THREE.Scene();
  const group = new THREE.Group();
  scene.add(group);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.01, 100);
  camera.position.set(center[0], center[1], center[2] + extent * (framing === 'focus' ? 2.35 : 3.0));
  camera.lookAt(center[0], center[1], center[2]);

  const materials: ShaderMaterial[] = [];
  const points: Points[] = [];
  const makeMaterial = (halo: boolean) => {
    const uniforms: Uniforms = {
      uTime: { value: 0 },
      uOpacity: { value: halo ? (framing === 'focus' ? 0.16 : 0.10) : 0.96 },
      uPointSize: { value: halo ? look.haloSize : look.coreSize },
      uDrift: { value: look.drift },
      uHalo: { value: halo ? 1 : 0 },
      uTint: { value: new THREE.Color(halo ? look.haloColor : look.accentColor) },
      uMotionMode: { value: 0 },
      uMotionSpeed: { value: 1 },
      uPulseRate: { value: 1 },
      uMotionStrength: { value: 0 },
      uPulseAmount: { value: halo ? (framing === 'focus' ? 0.18 : 0.10) : 0.055 },
      uReveal: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({
      uniforms: uniforms as unknown as Record<string, { value: unknown }>,
      vertexShader: vesselVertexShader,
      fragmentShader: vesselFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      vertexColors: true,
      toneMapped: false,
    });
    materials.push(material);
    return material;
  };

  const halo = new THREE.Points(geometry, makeMaterial(true));
  halo.renderOrder = 1;
  halo.frustumCulled = false;
  const core = new THREE.Points(geometry, makeMaterial(false));
  core.renderOrder = 2;
  core.frustumCulled = false;
  points.push(halo, core);
  group.add(halo, core);

  const runtime: VesselRuntime = {
    renderer,
    scene,
    camera,
    geometry,
    materials,
    points,
    setReveal(value) {
      const next = clamp(value);
      materials.forEach((material) => {
        (material.uniforms.uReveal as { value: number }).value = next;
      });
    },
    setStage(nextStage, nextFraming) {
      const nextPreset = getParticlePreset(nextStage);
      const nextLook = getLook(nextPreset.look);
      const nextMotion = getMotion(nextPreset.motion);
      updateColors(nextStage);
      materials.forEach((material, index) => {
        const materialUniforms = material.uniforms as unknown as Uniforms;
        const haloLayer = index === 0;
        materialUniforms.uPointSize.value = haloLayer ? nextLook.haloSize : nextLook.coreSize;
        materialUniforms.uDrift.value = nextLook.drift;
        materialUniforms.uMotionMode.value = nextMotion.mode;
        materialUniforms.uMotionSpeed.value = nextMotion.speed;
        materialUniforms.uPulseRate.value = nextMotion.pulseRate;
        materialUniforms.uMotionStrength.value = nextMotion.strength *
          (haloLayer ? (nextFraming === 'focus' ? 0.42 : 0.12) : 1);
        materialUniforms.uOpacity.value = haloLayer ? (nextFraming === 'focus' ? 0.16 : 0.10) : 0.96;
        materialUniforms.uPulseAmount.value = haloLayer ? (nextFraming === 'focus' ? 0.18 : 0.10) : 0.055;
        const tint = materialUniforms.uTint.value as InstanceType<ThreeModule['Color']>;
        tint.setHex(haloLayer ? nextLook.haloColor : nextLook.accentColor);
      });
      group.userData.rotationSpeed = nextMotion.rotationSpeed;
    },
    render(time) {
      materials.forEach((material) => {
        (material.uniforms.uTime as { value: number }).value = time;
      });
      group.rotation.y = time * Number(group.userData.rotationSpeed ?? 0);
      renderer.render(scene, camera);
    },
    resize() {
      const width = Math.max(1, canvas.clientWidth);
      const height = Math.max(1, canvas.clientHeight);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    },
    dispose() {
      geometry.dispose();
      materials.forEach((material) => material.dispose());
      renderer.dispose();
    },
  };

  runtime.setStage(stage, framing);
  runtime.resize();
  return runtime;
}

function getLook(name: ReturnType<typeof getParticlePreset>['look']) {
  // Kept behind a function so the runtime has one place to resolve look data.
  // The import is intentionally type/value-safe and contains the extracted ints.
  return particleLookTable[name];
}

function getMotion(name: ReturnType<typeof getParticlePreset>['motion']) {
  return particleMotionTable[name];
}

export function ParticleVessel({
  model,
  stage = 'origin',
  reveal,
  framing = 'wide',
  className,
  fallbackSrc,
  fallbackAlt = '青花造境器物粒子效果静态图',
}: ParticleVesselProps) {
  const profile = useDeviceProfile();
  const selectedPreset = getParticlePreset(stage);
  const selectedModel = model ?? selectedPreset.model;
  const canUseThree = profile.ready && !profile.static && profile.tier === 'high';
  const stageRef = useRef(stage);
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef<VesselRuntime | null>(null);
  const visibleRef = useRef(false);
  const revealRef = useRef(clamp(reveal ?? 0));
  const failedConfigRef = useRef<string | null>(null);
  const configKey = `${selectedModel}:${framing}:${canUseThree}:${profile.isCompact}`;

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas || !canUseThree || failedConfigRef.current === configKey) return;

    let disposed = false;
    let loading = false;
    let rafId = 0;
    const controller = new AbortController();
    let resizeObserver: ResizeObserver | undefined;

    const stop = () => {
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
    };
    const start = () => {
      if (rafId || !runtimeRef.current || !visibleRef.current || document.hidden) return;
      const frame = (time: number) => {
        rafId = 0;
        if (disposed || !runtimeRef.current || !visibleRef.current || document.hidden) return;
        runtimeRef.current.render(time * 0.001);
        rafId = requestAnimationFrame(frame);
      };
      rafId = requestAnimationFrame(frame);
    };
    const disposeRuntime = () => {
      stop();
      resizeObserver?.disconnect();
      resizeObserver = undefined;
      runtimeRef.current?.dispose();
      runtimeRef.current = null;
    };
    const fail = () => {
      disposeRuntime();
      if (!disposed) failedConfigRef.current = configKey;
    };
    const onContextLost = (event: Event) => {
      event.preventDefault();
      fail();
    };
    canvas.addEventListener('webglcontextlost', onContextLost, false);

    const boot = async () => {
      if (loading || runtimeRef.current || disposed || !visibleRef.current || document.hidden) return;
      loading = true;
      try {
        // This is intentionally inside the visibility callback. Three and the
        // point-cloud bytes are absent from the initial route and are never
        // requested by low-tier or reduced-motion visitors.
        const THREE = await import('three');
        if (disposed || !visibleRef.current || document.hidden) return;
        const maxPoints = framing === 'focus' ? 15000 : 8000;
        const data = await loadPointCloud(DATA_ROOT, selectedModel, profile.isCompact ? Math.floor(maxPoints * 0.6) : maxPoints, controller.signal);
        if (disposed || !visibleRef.current || document.hidden) return;
        const nextRuntime = buildRuntime(THREE, canvas, data, stageRef.current, framing, profile.isCompact, root);
        nextRuntime.setReveal(revealRef.current);
        runtimeRef.current = nextRuntime;
        resizeObserver = new ResizeObserver(() => runtimeRef.current?.resize());
        resizeObserver.observe(root);
        start();
      } catch (error) {
        if (!disposed && !(error instanceof DOMException && error.name === 'AbortError')) fail();
      } finally {
        loading = false;
      }
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        visibleRef.current = Boolean(entry?.isIntersecting);
        if (visibleRef.current) void boot();
        else stop();
      },
      { threshold: 0.01 },
    );
    observer.observe(root);
    const onVisibilityChange = () => {
      if (document.hidden) stop();
      else if (visibleRef.current) start();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      disposed = true;
      controller.abort();
      observer.disconnect();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      canvas.removeEventListener('webglcontextlost', onContextLost);
      disposeRuntime();
    };
  }, [canUseThree, configKey, framing, profile.isCompact, selectedModel]);

  useEffect(() => {
    if (reveal !== undefined) {
      revealRef.current = clamp(reveal);
      runtimeRef.current?.setReveal(revealRef.current);
      return;
    }
    const root = rootRef.current;
    if (!root || !canUseThree) return;
    const updateReveal = () => {
      if (document.hidden) return;
      const rect = root.getBoundingClientRect();
      const travel = Math.max(1, window.innerHeight + rect.height);
      const progress = (window.innerHeight * 0.84 - rect.top) / travel * 1.7;
      revealRef.current = clamp(progress);
      runtimeRef.current?.setReveal(revealRef.current);
    };
    updateReveal();
    window.addEventListener('scroll', updateReveal, { passive: true });
    window.addEventListener('resize', updateReveal, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateReveal);
      window.removeEventListener('resize', updateReveal);
    };
  }, [canUseThree, reveal]);

  useEffect(() => {
    runtimeRef.current?.setStage(stage, framing);
  }, [framing, stage]);

  return (
    <div
      ref={rootRef}
      className={cx('relative w-full min-w-0 overflow-hidden bg-[var(--tone-surface)]', className)}
      style={{ aspectRatio: '1 / 1' }}
      data-qinghua-vessel="true"
      data-qinghua-model={selectedModel}
      data-qinghua-stage={stage}
    >
      {fallbackSrc ? (
        <img
          src={fallbackSrc}
          alt={fallbackAlt}
          loading="lazy"
          decoding="async"
          draggable={false}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-end p-5 md:p-7" aria-hidden="true">
          <span className="type-label-sm text-[var(--tone-mute)]">QINGHUA / PARTICLE VESSEL</span>
        </div>
      )}
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 h-full w-full" />
    </div>
  );
}

export default ParticleVessel;
