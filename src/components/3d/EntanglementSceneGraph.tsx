'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { mulberry32 } from '@/lib/prng';
import { useFrozen, FROZEN_TIME } from './frozen';
import {
  ENTANGLEMENT_FRAGMENT,
  ENTANGLEMENT_VERTEX,
} from './entanglementShaders';

type EntanglementSceneGraphProps = {
  /** Particles per cluster. Two clusters are drawn, so total is twice this. */
  count?: number;
  separation?: number;
  /** Disables pointer interaction for the ambient background variant. */
  interactive?: boolean;
  onPerturbChange?: (value: number) => void;
};

const SPIN_UP = new THREE.Color('#2fd9c4');
const SPIN_DOWN = new THREE.Color('#8c7cf0');

/**
 * Two GPU-instanced particle clusters that behave as a single system.
 *
 * Perturbing either cluster - by pointer, or by the keyboard control the
 * wrapper provides - swells both, because both are driven from one shared
 * uniform and one shared set of seeds. That is the illustration: you
 * cannot act on half of an entangled pair.
 */
export function EntanglementSceneGraph({
  count = 900,
  separation = 1.35,
  interactive = true,
  onPerturbChange,
}: EntanglementSceneGraphProps) {
  const material = useRef<THREE.ShaderMaterial | null>(null);
  const [target, setTarget] = useState(0);
  const current = useRef(0);

  const frozen = useFrozen();

  // Seeds are generated once, from a fixed seed. Both clusters read the
  // same array, which is precisely how the pairing is enforced; the
  // determinism additionally means the field is laid out identically on
  // every load rather than rearranging itself between visits.
  const { seeds, clusters } = useMemo(() => {
    const total = count * 2;
    const seedArray = new Float32Array(total * 3);
    const clusterArray = new Float32Array(total);

    const random = mulberry32(0x5eed);

    for (let i = 0; i < count; i += 1) {
      const sx = random();
      const sy = random();
      const sz = random();

      // Left member.
      seedArray[i * 3] = sx;
      seedArray[i * 3 + 1] = sy;
      seedArray[i * 3 + 2] = sz;
      clusterArray[i] = -1;

      // Right member: identical seed, opposite cluster sign.
      const j = count + i;
      seedArray[j * 3] = sx;
      seedArray[j * 3 + 1] = sy;
      seedArray[j * 3 + 2] = sz;
      clusterArray[j] = 1;
    }

    return { seeds: seedArray, clusters: clusterArray };
  }, [count]);

  const geometry = useMemo(() => {
    const base = new THREE.IcosahedronGeometry(0.021, 0);
    const instanced = new THREE.InstancedBufferGeometry();
    instanced.index = base.index;
    instanced.attributes['position'] = base.attributes['position'] as THREE.BufferAttribute;
    instanced.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 3));
    instanced.setAttribute('aCluster', new THREE.InstancedBufferAttribute(clusters, 1));
    instanced.instanceCount = count * 2;
    // Positions are generated in the vertex shader, so the computed
    // bounding sphere would be wrong; a generous manual one keeps the
    // cloud from being culled at the edges of the frame.
    instanced.boundingSphere = new THREE.Sphere(new THREE.Vector3(), separation + 2);
    base.dispose();
    return instanced;
  }, [seeds, clusters, count, separation]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uPerturb: { value: 0 },
      uSeparation: { value: separation },
      uSpinUp: { value: SPIN_UP },
      uSpinDown: { value: SPIN_DOWN },
    }),
    [separation],
  );

  // The correlation bundle: arcs joining the two clusters, built as a
  // single LineSegments so the whole bundle is one draw call and one
  // material whose opacity tracks the perturbation.
  const bundleGeometry = useMemo(() => {
    const positions: number[] = [];
    const arcs = 14;
    const segments = 28;

    for (let i = 0; i < arcs; i += 1) {
      const t = i / (arcs - 1);
      const lift = (t - 0.5) * 1.15;
      const depth = Math.sin(t * Math.PI) * 0.55 - 0.28;
      const curve = new THREE.QuadraticBezierCurve3(
        new THREE.Vector3(-separation * 0.62, lift * 0.6, depth * 0.4),
        new THREE.Vector3(0, lift * 1.35, depth),
        new THREE.Vector3(separation * 0.62, lift * 0.6, depth * 0.4),
      );
      const points = curve.getPoints(segments);
      for (let s = 0; s < points.length - 1; s += 1) {
        const a = points[s]!;
        const b = points[s + 1]!;
        positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      'position',
      new THREE.Float32BufferAttribute(positions, 3),
    );
    return geometry;
  }, [separation]);

  const bundleMaterial = useRef<THREE.LineBasicMaterial | null>(null);

  useFrame((_, delta) => {
    const mat = material.current;
    if (!mat) return;

    // Frozen: pin the phase instead of advancing it, so the one frame
    // that is drawn is the same frame every time.
    if (frozen) {
      mat.uniforms['uTime']!.value = FROZEN_TIME;
      mat.uniforms['uPerturb']!.value = 0;
      return;
    }

    mat.uniforms['uTime']!.value += delta;

    // Ease towards the target rather than snapping, so a perturbation
    // reads as a system settling into a new state.
    const rate = Math.min(1, delta * 4.5);
    current.current += (target - current.current) * rate;
    mat.uniforms['uPerturb']!.value = current.current;

    if (bundleMaterial.current) {
      bundleMaterial.current.opacity = 0.08 + current.current * 0.42;
    }
  });

  useEffect(() => {
    onPerturbChange?.(target);
  }, [target, onPerturbChange]);

  useEffect(() => {
    return () => {
      geometry.dispose();
    };
  }, [geometry]);

  useEffect(() => {
    return () => {
      bundleGeometry.dispose();
    };
  }, [bundleGeometry]);

  return (
    <>
      <lineSegments args={[bundleGeometry, undefined]}>
        <lineBasicMaterial
          ref={bundleMaterial}
          color="#8c7cf0"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </lineSegments>

      <instancedMesh
        args={[geometry, undefined, count * 2]}
        frustumCulled={false}
      >
        <shaderMaterial
          ref={material}
          vertexShader={ENTANGLEMENT_VERTEX}
          fragmentShader={ENTANGLEMENT_FRAGMENT}
          uniforms={uniforms}
          transparent={false}
          depthWrite
        />
      </instancedMesh>

      {/* Interaction volumes over each cluster. Touching either one
          perturbs the whole system, which is the point being made. */}
      {interactive &&
        [-separation, separation].map((x) => (
          <mesh
            key={x}
            position={[x, 0, 0]}
            visible={false}
            onPointerOver={() => setTarget(1)}
            onPointerOut={() => setTarget(0)}
          >
            <sphereGeometry args={[1.05, 12, 12]} />
          </mesh>
        ))}
    </>
  );
}
