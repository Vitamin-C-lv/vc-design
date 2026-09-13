export type ParticleModel = 'clay' | 'pulling' | 'bisque';
export type ParticleStage =
  | 'origin'
  | 'pulling'
  | 'trimming'
  | 'painting'
  | 'glazing'
  | 'firing'
  | 'finished';

export interface ParticleLook {
  coreColor: number;
  accentColor: number;
  haloColor: number;
  coreSize: number;
  haloSize: number;
  drift: number;
}

export interface ParticleMotion {
  mode: number;
  speed: number;
  pulseRate: number;
  strength: number;
  rotationSpeed: number;
}

export interface ParticleStagePreset {
  model: ParticleModel;
  look: keyof typeof particleLooks;
  motion: keyof typeof particleMotions;
  /** A site tone token, resolved at runtime so the component stays theme-aware. */
  particleColorVar: string;
}

/** Values copied from the extracted production material factory. */
export const particleLooks = {
  clay: {
    coreColor: 15777661,
    accentColor: 9095613,
    haloColor: 14261581,
    coreSize: 5.4,
    haloSize: 12.5,
    drift: 0.012,
  },
  raw: {
    coreColor: 15185789,
    accentColor: 11984340,
    haloColor: 14067043,
    coreSize: 5.2,
    haloSize: 12.0,
    drift: 0.011,
  },
  bisque: {
    coreColor: 15657437,
    accentColor: 9422523,
    haloColor: 14006393,
    coreSize: 5.0,
    haloSize: 11.5,
    drift: 0.009,
  },
  painted: {
    coreColor: 7842256,
    accentColor: 15197144,
    haloColor: 5014196,
    coreSize: 5.3,
    haloSize: 12.5,
    drift: 0.012,
  },
  glazed: {
    coreColor: 13102822,
    accentColor: 15985368,
    haloColor: 7256499,
    coreSize: 5.6,
    haloSize: 13.2,
    drift: 0.014,
  },
  fired: {
    coreColor: 3767993,
    accentColor: 15261640,
    haloColor: 5218256,
    coreSize: 5.8,
    haloSize: 13.8,
    drift: 0.013,
  },
} satisfies Record<string, ParticleLook>;

/** Values copied from the extracted production motion factory. */
export const particleMotions = {
  awakening: { mode: 0, speed: 0.72, pulseRate: 1.15, strength: 2.3, rotationSpeed: 0.05 },
  'spiral-rise': { mode: 1, speed: 1.08, pulseRate: 1.75, strength: 3.5, rotationSpeed: 0.24 },
  'lathe-rings': { mode: 2, speed: 0.92, pulseRate: 1.45, strength: 2.7, rotationSpeed: -0.10 },
  'ink-sweep': { mode: 3, speed: 0.84, pulseRate: 1.32, strength: 3.2, rotationSpeed: 0.07 },
  'glaze-cascade': { mode: 4, speed: 0.70, pulseRate: 1.08, strength: 2.8, rotationSpeed: 0.03 },
  'heat-turbulence': { mode: 5, speed: 1.52, pulseRate: 2.80, strength: 4.2, rotationSpeed: 0.10 },
  constellation: { mode: 6, speed: 0.38, pulseRate: 0.72, strength: 1.8, rotationSpeed: -0.05 },
} satisfies Record<string, ParticleMotion>;

export const particleStagePresets = {
  origin: { model: 'clay', look: 'clay', motion: 'awakening', particleColorVar: 'var(--tone-fg-2)' },
  pulling: { model: 'pulling', look: 'raw', motion: 'spiral-rise', particleColorVar: 'var(--tone-fg-2)' },
  trimming: { model: 'bisque', look: 'bisque', motion: 'lathe-rings', particleColorVar: 'var(--tone-fg)' },
  painting: { model: 'bisque', look: 'painted', motion: 'ink-sweep', particleColorVar: 'var(--tone-accent)' },
  glazing: { model: 'bisque', look: 'glazed', motion: 'glaze-cascade', particleColorVar: 'var(--tone-fg-2)' },
  firing: { model: 'bisque', look: 'fired', motion: 'heat-turbulence', particleColorVar: 'var(--tone-accent)' },
  finished: { model: 'bisque', look: 'fired', motion: 'constellation', particleColorVar: 'var(--tone-fg)' },
} satisfies Record<ParticleStage, ParticleStagePreset>;

export function getParticlePreset(stage: ParticleStage): ParticleStagePreset {
  return particleStagePresets[stage];
}
