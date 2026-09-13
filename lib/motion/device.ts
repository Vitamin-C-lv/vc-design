'use client';

import { useEffect, useState } from 'react';

/**
 * Device capability profile.
 *
 * The brief requires the *same brand language with a different arrangement* per
 * device, plus automatic degradation on weak hardware. This hook is the single
 * source of truth for those decisions so individual sections never invent their
 * own heuristics.
 */
export interface DeviceProfile {
  /** False during SSR and the first paint — render the steady state, not a guess. */
  ready: boolean;
  /** The visitor asked the OS for reduced motion. */
  reducedMotion: boolean;
  /** Coarse pointer: phones and tablets. */
  isTouch: boolean;
  /** Narrow layout (below Tailwind's `lg`). */
  isCompact: boolean;
  /**
   * `low` disables parallax, pinning, scrubbing and marquees. It is set by
   * explicit signals only — reduced motion, save-data, very few cores, very
   * little memory. A modern phone on a fast network stays `high`, because the
   * desktop and mobile experiences should feel equally alive where possible.
   */
  tier: 'high' | 'low';
  /** True when animation should be suppressed entirely. */
  static: boolean;
}

const SERVER_PROFILE: DeviceProfile = {
  ready: false,
  reducedMotion: false,
  isTouch: false,
  isCompact: false,
  tier: 'high',
  static: false,
};

function detect(): DeviceProfile {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const isCompact = window.innerWidth <= 1023;

  const nav = navigator as Navigator & {
    deviceMemory?: number;
    connection?: { saveData?: boolean; effectiveType?: string };
  };

  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const saveData = nav.connection?.saveData === true;
  const slowNetwork =
    nav.connection?.effectiveType === 'slow-2g' || nav.connection?.effectiveType === '2g';

  const low = reducedMotion || saveData || slowNetwork || cores <= 2 || memory <= 2;

  return {
    ready: true,
    reducedMotion,
    isTouch,
    isCompact,
    tier: low ? 'low' : 'high',
    static: reducedMotion,
  };
}

export function useDeviceProfile(): DeviceProfile {
  const [profile, setProfile] = useState<DeviceProfile>(SERVER_PROFILE);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setProfile(detect()));
    };

    update();

    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const pointer = window.matchMedia('(pointer: coarse)');
    motion.addEventListener('change', update);
    pointer.addEventListener('change', update);
    window.addEventListener('resize', update, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      motion.removeEventListener('change', update);
      pointer.removeEventListener('change', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return profile;
}
