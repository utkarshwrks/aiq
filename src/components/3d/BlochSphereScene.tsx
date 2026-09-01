'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Line, Html, OrbitControls } from '@react-three/drei';
import {
  CARDINAL_STATES,
  vectorToAngles,
  type BlochAngles,
} from '@/lib/quantum';
import {
  azimuthArc,
  blochToWorld,
  graticule,
  polarArc,
} from './blochGeometry';

const TEAL = '#2fd9c4';
const AMBER = '#e8a845';
const VIOLET = '#8c7cf0';
const GRID = '#1e2b33';
const ORIGIN = new THREE.Vector3(0, 0, 0);

type BlochSphereSceneProps = {
  angles: BlochAngles;
  onChange: (angles: BlochAngles) => void;
  /** Suppresses the axis labels for the small hero variant. */
  showLabels?: boolean;
};

/**
 * The scene graph for the Bloch sphere. Everything that touches three.js
 * lives here; the surrounding component owns the state and the readouts,
 * which keeps the numeric display in the DOM where it can be read by
 * assistive technology and selected by the user.
 */
export function BlochSphereScene({
  angles,
  onChange,
  showLabels = true,
}: BlochSphereSceneProps) {
  const { camera, raycaster, pointer } = useThree();
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  // The graticule never changes, so it is built once for the lifetime of
  // the scene rather than on every state update.
  const { parallels, meridians, equator } = useMemo(() => graticule(), []);
  const unitSphere = useMemo(
    () => new THREE.Sphere(new THREE.Vector3(0, 0, 0), 1),
    [],
  );

  const tip = useMemo(
    () =>
      blochToWorld({
        x: Math.sin(angles.theta) * Math.cos(angles.phi),
        y: Math.sin(angles.theta) * Math.sin(angles.phi),
        z: Math.cos(angles.theta),
      }),
    [angles.theta, angles.phi],
  );

  const arcPolar = useMemo(
    () => polarArc(angles.theta, angles.phi),
    [angles.theta, angles.phi],
  );
  const arcAzimuth = useMemo(() => azimuthArc(angles.phi), [angles.phi]);

  // Projection of the state onto the equatorial plane, which is what
  // makes the azimuth readable as a bearing.
  const projection = useMemo(
    () => new THREE.Vector3(tip.x, 0, tip.z),
    [tip],
  );

  const scratch = useRef(new THREE.Vector3());

  useFrame(() => {
    if (!dragging) return;

    raycaster.setFromCamera(pointer, camera);
    const hit = scratch.current;

    if (raycaster.ray.intersectSphere(unitSphere, hit)) {
      hit.normalize();
    } else {
      // Pointer is outside the sphere's silhouette. Projecting the ray's
      // closest approach keeps the drag continuous past the limb instead
      // of freezing the vector at the edge.
      raycaster.ray.closestPointToPoint(ORIGIN, hit);
      hit.normalize();
    }

    // World is Y-up; the Bloch frame is Z-up.
    onChange(vectorToAngles({ x: hit.x, y: hit.z, z: hit.y }));
  });

  const beginDrag = useCallback((event: ThreeEvent<PointerEvent>) => {
    event.stopPropagation();
    setDragging(true);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const end = () => setDragging(false);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [dragging]);

  useEffect(() => {
    document.body.style.cursor = dragging
      ? 'grabbing'
      : hovering
        ? 'grab'
        : '';
    return () => {
      document.body.style.cursor = '';
    };
  }, [dragging, hovering]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[3, 4, 3]} intensity={18} color={TEAL} distance={14} />

      {/* --- Graticule ------------------------------------------------ */}
      {parallels.map((points, i) => (
        <Line
          key={`par-${i}`}
          points={points}
          color={GRID}
          lineWidth={1}
          transparent
          opacity={0.85}
        />
      ))}
      {meridians.map((points, i) => (
        <Line
          key={`mer-${i}`}
          points={points}
          color={GRID}
          lineWidth={1}
          transparent
          opacity={0.7}
        />
      ))}
      <Line points={equator} color={TEAL} lineWidth={1.4} transparent opacity={0.4} />

      {/* --- Axes ----------------------------------------------------- */}
      <Line
        points={[new THREE.Vector3(0, -1.32, 0), new THREE.Vector3(0, 1.32, 0)]}
        color={TEAL}
        lineWidth={1}
        transparent
        opacity={0.5}
        dashed
        dashSize={0.05}
        gapSize={0.04}
      />
      <Line
        points={[new THREE.Vector3(-1.32, 0, 0), new THREE.Vector3(1.32, 0, 0)]}
        color={GRID}
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.04}
      />
      <Line
        points={[new THREE.Vector3(0, 0, -1.32), new THREE.Vector3(0, 0, 1.32)]}
        color={GRID}
        lineWidth={1}
        dashed
        dashSize={0.05}
        gapSize={0.04}
      />

      {/* --- Swept angles --------------------------------------------- */}
      <Line points={arcPolar} color={AMBER} lineWidth={1.6} transparent opacity={0.8} />
      <Line points={arcAzimuth} color={VIOLET} lineWidth={1.6} transparent opacity={0.75} />
      <Line
        points={[ORIGIN, projection, tip]}
        color={VIOLET}
        lineWidth={1}
        transparent
        opacity={0.35}
        dashed
        dashSize={0.04}
        gapSize={0.03}
      />

      {/* --- State vector --------------------------------------------- */}
      <Line points={[ORIGIN, tip]} color={TEAL} lineWidth={3} />
      <mesh
        position={tip}
        onPointerDown={beginDrag}
        onPointerOver={() => setHovering(true)}
        onPointerOut={() => setHovering(false)}
      >
        <sphereGeometry args={[dragging || hovering ? 0.07 : 0.055, 24, 24]} />
        <meshBasicMaterial color={TEAL} />
      </mesh>
      {/* Generous invisible grab target, so the vector tip is reachable
          on touch without making the visible marker clumsy. */}
      <mesh position={tip} onPointerDown={beginDrag} visible={false}>
        <sphereGeometry args={[0.18, 12, 12]} />
      </mesh>

      <mesh>
        <sphereGeometry args={[0.028, 16, 16]} />
        <meshBasicMaterial color="#e8eef2" />
      </mesh>

      {/* --- Basis labels --------------------------------------------- */}
      {showLabels &&
        CARDINAL_STATES.map((state) => (
          <Html
            key={state.label}
            position={blochToWorld(state.vector).multiplyScalar(1.26)}
            center
            // No distanceFactor: an instrument's labels are set at a
            // constant size, not scaled by how far the geometry happens
            // to be from the camera.
            zIndexRange={[10, 0]}
            style={{ pointerEvents: 'none' }}
          >
            <span
              className="data select-none whitespace-nowrap text-[0.6875rem] text-ink-faint"
              aria-hidden
            >
              {state.label}
            </span>
          </Html>
        ))}

      <OrbitControls
        enablePan={false}
        enableZoom={false}
        enabled={!dragging}
        autoRotate={!dragging && !hovering}
        autoRotateSpeed={0.35}
        minPolarAngle={Math.PI * 0.12}
        maxPolarAngle={Math.PI * 0.88}
        makeDefault
      />
    </>
  );
}
