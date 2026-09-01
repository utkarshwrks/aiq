'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Line, Html } from '@react-three/drei';
import { SINGLE_QUBIT_GATES, type Gate } from '@/lib/circuits';
import { stepX, wireY } from './circuitLayout';
import type { Circuit } from '@/lib/circuits';

const TEAL = new THREE.Color('#2fd9c4');
const AMBER = new THREE.Color('#e8a845');
const VIOLET = new THREE.Color('#8c7cf0');
const IDLE = new THREE.Color('#17212a');
const EDGE = '#2b3a44';

type CircuitGateProps = {
  circuit: Circuit;
  gate: Gate;
  /** Shared mutable pulse progress, 0 to 1, written by the parent each frame. */
  pulse: React.MutableRefObject<number>;
  /** Normalised position of this gate along the wire run. */
  at: number;
};

/**
 * One gate body. Gates energise as the pulse sweeps past them: the
 * material lerps from the idle surface colour towards the accent for the
 * gate's family and decays back over roughly a fifth of the run.
 *
 * All of that happens by mutating the material in the frame loop. Driving
 * it through React state instead would re-render every gate on every
 * frame, which is exactly the kind of thing that turns a 3D hero into a
 * janky one.
 */
export function CircuitGate({ circuit, gate, pulse, at }: CircuitGateProps) {
  const material = useRef<THREE.MeshStandardMaterial | null>(null);
  const x = stepX(circuit, gate.step);

  const accent = useMemo(() => {
    if (gate.kind === 'MEASURE') return AMBER;
    if (gate.control !== undefined || gate.kind === 'SWAP') return VIOLET;
    return TEAL;
  }, [gate.kind, gate.control]);

  useFrame(() => {
    const mat = material.current;
    if (!mat) return;
    // Triangular window around the gate's position: full energy at the
    // gate, nothing more than 0.09 of the run away.
    const distance = Math.abs(pulse.current - at);
    const energy = Math.max(0, 1 - distance / 0.09);
    mat.color.copy(IDLE).lerp(accent, energy * 0.9);
    mat.emissive.copy(accent).multiplyScalar(energy * 0.6);
  });

  const targetY = wireY(circuit, gate.target);

  // --- Two-qubit gates: a vertical spine between the wires involved ---
  if (gate.control !== undefined) {
    const controlY = wireY(circuit, gate.control);
    return (
      <group>
        <Line
          points={[
            new THREE.Vector3(x, controlY, 0),
            new THREE.Vector3(x, targetY, 0),
          ]}
          color="#8c7cf0"
          lineWidth={1.4}
          transparent
          opacity={0.7}
        />
        <mesh position={[x, controlY, 0]}>
          <sphereGeometry args={[0.075, 20, 20]} />
          <meshStandardMaterial ref={material} color={IDLE} roughness={0.5} />
        </mesh>

        {gate.kind === 'CNOT' ? (
          <group position={[x, targetY, 0]}>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.16, 0.014, 12, 32]} />
              <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={0.25} />
            </mesh>
            <Line
              points={[
                new THREE.Vector3(-0.16, 0, 0),
                new THREE.Vector3(0.16, 0, 0),
              ]}
              color="#8c7cf0"
              lineWidth={1.4}
            />
            <Line
              points={[
                new THREE.Vector3(0, -0.16, 0),
                new THREE.Vector3(0, 0.16, 0),
              ]}
              color="#8c7cf0"
              lineWidth={1.4}
            />
          </group>
        ) : (
          <mesh position={[x, targetY, 0]}>
            <sphereGeometry args={[0.075, 20, 20]} />
            <meshStandardMaterial color={VIOLET} emissive={VIOLET} emissiveIntensity={0.25} />
          </mesh>
        )}
      </group>
    );
  }

  // --- SWAP: two crosses joined by a spine -----------------------------
  if (gate.kind === 'SWAP' && gate.partner !== undefined) {
    const partnerY = wireY(circuit, gate.partner);
    return (
      <group>
        <Line
          points={[
            new THREE.Vector3(x, targetY, 0),
            new THREE.Vector3(x, partnerY, 0),
          ]}
          color="#8c7cf0"
          lineWidth={1.4}
          transparent
          opacity={0.7}
        />
        {[targetY, partnerY].map((y) => (
          <group key={y} position={[x, y, 0]}>
            <Line
              points={[
                new THREE.Vector3(-0.11, -0.11, 0),
                new THREE.Vector3(0.11, 0.11, 0),
              ]}
              color="#8c7cf0"
              lineWidth={1.8}
            />
            <Line
              points={[
                new THREE.Vector3(-0.11, 0.11, 0),
                new THREE.Vector3(0.11, -0.11, 0),
              ]}
              color="#8c7cf0"
              lineWidth={1.8}
            />
          </group>
        ))}
      </group>
    );
  }

  // --- Single-qubit gates and measurement ------------------------------
  const isSingle = SINGLE_QUBIT_GATES.has(gate.kind);
  const size: [number, number, number] = isSingle
    ? [0.34, 0.34, 0.16]
    : [0.36, 0.32, 0.16];

  return (
    <group position={[x, targetY, 0]}>
      <mesh>
        <boxGeometry args={size} />
        <meshStandardMaterial
          ref={material}
          color={IDLE}
          roughness={0.55}
          metalness={0.1}
        />
      </mesh>
      {/* Hairline edging, so gate bodies read as etched plates rather
          than as solid blocks. */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...size)]} />
        <lineBasicMaterial color={EDGE} />
      </lineSegments>

      <Html center zIndexRange={[8, 0]} style={{ pointerEvents: 'none' }}>
        <span className="data select-none whitespace-nowrap text-[0.6875rem] text-ink" aria-hidden>
          {gate.kind === 'MEASURE' ? 'M' : gate.kind}
          {gate.param && <span className="text-ink-faint"> {gate.param}</span>}
        </span>
      </Html>
    </group>
  );
}
