'use client';

import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useFrozen, FROZEN_TIME } from './frozen';
import { Line, Html, OrbitControls } from '@react-three/drei';
import type { Circuit } from '@/lib/circuits';
import { CircuitGate } from './CircuitGate';
import {
  gateProgress,
  wireEndX,
  wireStartX,
  wireY,
} from './circuitLayout';

const WIRE = '#1e2b33';
const TEAL = '#2fd9c4';

type SceneGraphProps = {
  circuit: Circuit;
  /** Seconds for the pulse to traverse the full wire run. */
  duration?: number;
  /** Pause between successive traversals, in seconds. */
  dwell?: number;
};

/**
 * The circuit scene graph. Qubit wires run left to right as hairlines;
 * gates sit on them as etched bodies; a pulse of amplitude travels the
 * run and energises each gate it reaches.
 *
 * The pulse's progress is held in a ref shared with every gate, so one
 * frame-loop write drives the entire animation without a single React
 * re-render.
 */
export function QuantumCircuitSceneGraph({
  circuit,
  duration = 4.2,
  dwell = 1.1,
}: SceneGraphProps) {
  const pulse = useRef(0);
  const pulseMeshes = useRef<Array<THREE.Mesh | null>>([]);

  const startX = wireStartX(circuit);
  const endX = wireEndX(circuit);
  const width = endX - startX;

  const gates = useMemo(
    () =>
      circuit.gates.map((gate) => ({
        gate,
        at: gateProgress(circuit, gate),
      })),
    [circuit],
  );

  const cycle = duration + dwell;

  const frozen = useFrozen();

  useFrame(({ clock }) => {
    const t = (frozen ? FROZEN_TIME : clock.getElapsedTime()) % cycle;
    // Progress holds at 1 during the dwell so the last gate stays lit
    // briefly before the run restarts, rather than snapping dark.
    const progress = t < duration ? t / duration : 1;
    pulse.current = progress;

    const x = startX + progress * width;
    for (const mesh of pulseMeshes.current) {
      if (!mesh) continue;
      mesh.position.x = x;
      const material = mesh.material as THREE.MeshBasicMaterial;
      // Fade out over the dwell.
      material.opacity = t < duration ? 1 : Math.max(0, 1 - (t - duration) / dwell);
    }
  });

  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[0, 2.4, 3]} intensity={22} distance={16} color="#e8eef2" />
      <pointLight position={[-3, -1, 2]} intensity={10} distance={12} color={TEAL} />

      {Array.from({ length: circuit.qubits }, (_, i) => {
        const y = wireY(circuit, i);
        return (
          <group key={i}>
            <Line
              points={[
                new THREE.Vector3(startX, y, 0),
                new THREE.Vector3(endX, y, 0),
              ]}
              color={WIRE}
              lineWidth={1.2}
            />

            {/* Wire label, set as a register index the way a schematic
                labels its lines. */}
            <Html
              position={[startX - 0.34, y, 0]}
              center
              zIndexRange={[8, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <span className="data select-none whitespace-nowrap text-[0.6875rem] text-ink-faint" aria-hidden>
                q{i}
              </span>
            </Html>

            {/* Travelling amplitude pulse, one per wire. */}
            <mesh
              ref={(node) => {
                pulseMeshes.current[i] = node;
              }}
              position={[startX, y, 0]}
            >
              <sphereGeometry args={[0.055, 16, 16]} />
              <meshBasicMaterial color={TEAL} transparent opacity={1} />
            </mesh>
          </group>
        );
      })}

      {gates.map(({ gate, at }, i) => (
        <CircuitGate
          key={`${gate.kind}-${gate.step}-${gate.target}-${i}`}
          circuit={circuit}
          gate={gate}
          pulse={pulse}
          at={at}
        />
      ))}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI * 0.34}
        maxPolarAngle={Math.PI * 0.66}
        minAzimuthAngle={-Math.PI * 0.22}
        maxAzimuthAngle={Math.PI * 0.22}
        makeDefault
      />
    </>
  );
}
