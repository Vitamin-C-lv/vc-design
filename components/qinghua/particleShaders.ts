/** Extracted verbatim from EXTRACTED_VESSEL_SHADER.md (Se / Ce). */
export const vesselVertexShader = `
  uniform float uTime;
  uniform float uPointSize;
  uniform float uDrift;
  uniform float uMotionMode;
  uniform float uMotionSpeed;
  uniform float uPulseRate;
  uniform float uPulseAmount;
  uniform float uMotionStrength;
  uniform float uReveal;
  attribute float aPhase;
  attribute float aScale;
  attribute float aVertical;
  varying vec3 vColor;
  varying float vPulse;
  varying float vFresnel;
  varying float vLight;
  varying float vLayer;
  varying float vReveal;

  vec3 animatePoint(vec3 source, vec3 surfaceNormal) {
    float time = uTime * uMotionSpeed;
    float strength = uDrift * uMotionStrength;
    vec3 animated = source;

    if (uMotionMode < 0.5) {
      float breath = sin(time * 1.25 + aPhase) * strength * 1.6;
      animated += surfaceNormal * breath;
      animated.y += sin(time * 0.52 + source.x * 2.2 + aPhase) * strength * 0.45;
    } else if (uMotionMode < 1.5) {
      float spiral = time * 1.4 + source.y * 4.2 + aPhase;
      animated.x += cos(spiral) * strength * 1.55;
      animated.z += sin(spiral) * strength * 1.55;
      animated.y += sin(time * 1.8 + aPhase) * strength * 0.75;
    } else if (uMotionMode < 2.5) {
      float ring = sin(source.y * 12.0 - time * 2.6 + aPhase * 0.16);
      animated += surfaceNormal * ring * strength * 1.8;
    } else if (uMotionMode < 3.5) {
      float stroke = sin(source.x * 5.8 + source.y * 3.4 - time * 2.2 + aPhase * 0.38);
      animated.x += stroke * strength * 1.55;
      animated.y += cos(source.y * 4.2 - time + aPhase) * strength * 0.72;
      animated += surfaceNormal * stroke * strength * 0.42;
    } else if (uMotionMode < 4.5) {
      float fall = 0.5 + 0.5 * sin(source.y * 7.5 + time * 2.1 + aPhase * 0.25);
      animated.y -= fall * strength * 1.35;
      animated += surfaceNormal * cos(time + source.y * 5.0) * strength * 0.55;
    } else if (uMotionMode < 5.5) {
      float heat = sin(time * 3.2 + source.y * 7.0 + aPhase);
      animated.x += heat * strength * 2.0;
      animated.y += abs(sin(time * 2.4 + aPhase)) * strength * 1.55;
      animated.z += cos(time * 2.7 + source.x * 5.0) * strength * 1.1;
    } else if (uMotionMode < 6.5) {
      float orbit = time * 0.72 + aPhase;
      animated.x += cos(orbit) * strength * 0.78;
      animated.z += sin(orbit) * strength * 0.78;
      animated += surfaceNormal * sin(time + aPhase) * strength * 0.46;
    } else if (uMotionMode < 7.5) {
      float wheel = sin(source.y * 18.0 - time * 4.0 + aPhase * 0.12);
      animated.x += cos(time + aPhase) * strength * 0.58;
      animated.z += sin(time + aPhase) * strength * 0.58;
      animated.y += wheel * strength * 0.22;
    } else if (uMotionMode < 8.5) {
      float tide = sin(source.x * 4.0 + source.z * 4.8 - time * 1.2);
      animated += surfaceNormal * tide * strength * 0.54;
    } else {
      float ember = abs(sin(time * 2.8 + source.y * 7.0 + aPhase));
      animated.y += ember * strength * 0.82;
      animated.x += sin(time * 2.0 + aPhase) * strength * 0.45;
    }
    return animated;
  }

  void main() {
    float pulse = 1.0 + uPulseAmount * sin(uTime * uPulseRate + aPhase);
    vec3 animated = animatePoint(position, normal);
    vec4 mvPosition = modelViewMatrix * vec4(animated, 1.0);
    vec3 viewNormal = normalize(normalMatrix * normal);
    vec3 viewDirection = normalize(-mvPosition.xyz);
    float fresnel = pow(1.0 - abs(dot(viewNormal, viewDirection)), 1.45);
    float light = 0.34 + 0.66 * max(
      dot(viewNormal, normalize(vec3(-0.4, 0.7, 0.58))),
      0.0
    );
    float regionEnergy = 0.82 + 0.18 * (
      0.5 + 0.5 * sin(position.y * 2.2 + position.x * 1.5 + position.z * 2.8)
    );
    gl_PointSize = uPointSize * aScale * pulse * (0.9 + fresnel * 0.34)
      * (6.0 / max(1.0, -mvPosition.z));
    gl_Position = projectionMatrix * mvPosition;
    vColor = color;
    vPulse = pulse;
    vFresnel = fresnel;
    vLight = light * regionEnergy;
    vLayer = aVertical;
    vReveal = uReveal;
  }
`;

export const vesselFragmentShader = `
  uniform float uOpacity;
  uniform float uHalo;
  uniform vec3 uTint;
  varying vec3 vColor;
  varying float vPulse;
  varying float vFresnel;
  varying float vLight;
  varying float vLayer;
  varying float vReveal;

  void main() {
    float radius = distance(gl_PointCoord, vec2(0.5));
    float core = smoothstep(0.34, 0.02, radius);
    float glow = smoothstep(0.5, 0.04, radius) * 0.5;
    float lightEnergy = 0.68 + vLight * 0.42 + vFresnel * 0.62;
    float layer = vLayer * 0.88 + 0.06;
    float revealMask = smoothstep(layer - 0.055, layer + 0.015, vReveal);
    float lossEdge = 1.0 - smoothstep(0.0, 0.075, abs(vReveal - layer));
    float alpha = mix(core, glow, uHalo) * uOpacity * vPulse * lightEnergy;
    alpha *= revealMask;
    vec3 regional = vColor * (0.7 + vLight * 0.48);
    vec3 edge = mix(regional, vec3(1.0, 0.95, 0.78), vFresnel * 0.72);
    vec3 lossColor = vec3(1.0, 0.68, 0.24);
    vec3 color = mix(mix(edge, uTint, uHalo * 0.5), lossColor, lossEdge * 0.72);
    gl_FragColor = vec4(color, alpha);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`;
