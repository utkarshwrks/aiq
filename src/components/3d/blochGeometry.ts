import * as THREE from 'three';
import { anglesToVector } from '@/lib/quantum';

/**
 * Geometry for the Bloch sphere's graticule. The sphere is drawn as a
 * cartographic globe - parallels and meridians rather than a shaded
 * surface - because that is both the honest representation of a state
 * space and the exact motif the rest of the product uses.
 *
 * All of this is pure and memoisable: it depends on nothing but the
 * segment counts, so a scene computes it once and never again.
 */

/** Points along a circle of constant theta (a parallel of latitude). */
export function parallel(theta: number, segments = 128): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const phi = (i / segments) * Math.PI * 2;
    const { x, y, z } = anglesToVector({ theta, phi });
    points.push(new THREE.Vector3(x, z, y));
  }
  return points;
}

/** Points along a great circle of constant phi (a meridian). */
export function meridian(phi: number, segments = 128): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const theta = (i / segments) * Math.PI * 2;
    const x = Math.sin(theta) * Math.cos(phi);
    const y = Math.sin(theta) * Math.sin(phi);
    const z = Math.cos(theta);
    points.push(new THREE.Vector3(x, z, y));
  }
  return points;
}

/**
 * The full graticule: parallels every 30 degrees of latitude excluding
 * the poles, and meridians every 30 degrees of longitude. The equator is
 * returned separately so it can be drawn with more weight.
 */
export function graticule() {
  const parallels: THREE.Vector3[][] = [];
  for (let deg = 30; deg <= 150; deg += 30) {
    if (deg === 90) continue;
    parallels.push(parallel((deg * Math.PI) / 180));
  }

  const meridians: THREE.Vector3[][] = [];
  for (let deg = 0; deg < 180; deg += 30) {
    meridians.push(meridian((deg * Math.PI) / 180));
  }

  return {
    parallels,
    meridians,
    equator: parallel(Math.PI / 2),
  };
}

/**
 * Three.js is Y-up; the Bloch convention is Z-up. Every conversion in the
 * scenes goes through this one function so the swap is stated once
 * instead of being open-coded at each call site.
 */
export function blochToWorld(v: { x: number; y: number; z: number }): THREE.Vector3 {
  return new THREE.Vector3(v.x, v.z, v.y);
}

/**
 * The arc on the sphere's surface from the north pole to the current
 * state, which is what makes the polar angle legible as a swept angle
 * rather than as a number in a readout.
 */
export function polarArc(theta: number, phi: number, segments = 48): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const t = (i / segments) * theta;
    points.push(blochToWorld(anglesToVector({ theta: t, phi })));
  }
  return points;
}

/** The equatorial arc sweeping the azimuth from +X to the state's phi. */
export function azimuthArc(phi: number, radius = 0.42, segments = 48): THREE.Vector3[] {
  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i += 1) {
    const p = (i / segments) * phi;
    points.push(new THREE.Vector3(Math.cos(p) * radius, 0, Math.sin(p) * radius));
  }
  return points;
}
