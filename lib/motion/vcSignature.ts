import { gsap } from './gsap';

export function playVcSignature(target: {
  v: Element;
  c: Element;
  track?: Element;
}): gsap.core.Timeline {
  const timeline = gsap.timeline();

  gsap.set(target.v, { yPercent: 110 });
  gsap.set(target.c, { xPercent: 62 });
  if (target.track) gsap.set(target.track, { '--vc-track': '0.14em' });

  timeline.to(target.v, { yPercent: 0, duration: 0.95, ease: 'power4.out' }, 0);
  timeline.to(target.c, { xPercent: 0, duration: 0.95, ease: 'power3.out' }, 0.12);
  if (target.track) {
    timeline.to(target.track, { '--vc-track': '-0.01em', duration: 1.05, ease: 'expo.out' }, 0);
  }

  return timeline;
}
