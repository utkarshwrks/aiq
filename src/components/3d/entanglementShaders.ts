/**
 * Shaders for EntanglementParticles.
 *
 * The whole point of this scene is that two clusters of particles respond
 * as one. That correlation is expressed structurally: a particle in the
 * left cluster and its partner in the right cluster are driven by the
 * *same* seed attribute, so they can never drift out of step, and a
 * perturbation applied to either side is by construction visible in both.
 *
 * Positions are computed in the vertex shader from per-instance
 * attributes rather than written into an instance matrix on the CPU. That
 * keeps the per-frame cost at one uniform upload regardless of particle
 * count, which is what makes a few thousand particles affordable.
 */

export const ENTANGLEMENT_VERTEX = /* glsl */ `
  uniform float uTime;
  uniform float uPerturb;
  uniform float uSeparation;

  attribute vec3 aSeed;
  attribute float aCluster;

  varying float vSpin;
  varying float vDepth;

  const float TAU = 6.28318530718;

  void main() {
    // Shared orbital phase. Both members of a pair read the same aSeed,
    // so their motion is identical up to the mirror below.
    float rate = 0.12 + aSeed.y * 0.22;
    float ang = aSeed.x * TAU + uTime * rate;
    float phi = aSeed.y * 3.14159265;
    float radius = 0.34 + aSeed.z * 0.52;

    // A perturbation swells the shell. Applied to both clusters at once,
    // because that is the claim the scene is making.
    radius *= 1.0 + uPerturb * (0.22 + aSeed.z * 0.34);

    vec3 local = vec3(
      radius * sin(phi) * cos(ang),
      radius * cos(phi) * (0.82 + 0.18 * sin(uTime * 0.35 + aSeed.x * TAU)),
      radius * sin(phi) * sin(ang)
    );

    // Mirror the right-hand cluster so the pair reads as a reflection.
    local.x *= aCluster;

    vec3 centre = vec3(aCluster * uSeparation, 0.0, 0.0);
    vec3 instancePos = centre + local;

    // Spin readout. Partners are anti-correlated: the same seed produces
    // opposite spins on the two clusters, which is the measurement
    // correlation a Bell pair exhibits.
    float base = step(0.5, fract(aSeed.x * 7.31 + aSeed.y * 3.17));
    vSpin = aCluster > 0.0 ? 1.0 - base : base;

    vec4 mvPosition = modelViewMatrix * vec4(instancePos, 1.0);
    mvPosition.xyz += position;
    vDepth = -mvPosition.z;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

/*
 * No explicit precision qualifier here. three.js prepends a matching
 * precision preamble to both stages; declaring mediump in the fragment
 * shader alone makes uPerturb mediump in one stage and highp in the
 * other, which is a link-time validation failure, not a warning.
 */
export const ENTANGLEMENT_FRAGMENT = /* glsl */ `
  uniform vec3 uSpinUp;
  uniform vec3 uSpinDown;
  uniform float uPerturb;

  varying float vSpin;
  varying float vDepth;

  void main() {
    vec3 colour = mix(uSpinDown, uSpinUp, vSpin);

    // Particles further from the camera recede rather than all sitting at
    // the same weight, which is what gives the cloud any volume at all.
    // The floor is deliberately high: below roughly 0.4 the accents stop
    // reading as teal and violet and collapse into indistinct dark dots.
    float fog = clamp(1.0 - (vDepth - 2.6) / 9.0, 0.42, 1.0);
    float energy = 0.72 + 0.28 * uPerturb;

    gl_FragColor = vec4(colour * energy * fog, 1.0);
  }
`;
