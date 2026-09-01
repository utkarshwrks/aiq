'use client';

import dynamic from 'next/dynamic';
import { CalibrationLoader } from '@/components/ui/CalibrationLoader';

/**
 * Every 3D scene enters the application through this module.
 *
 * three.js, react-three-fiber and drei together are the single largest
 * dependency in the product. Importing them through next/dynamic with
 * ssr disabled keeps them out of every server render and out of the
 * initial route bundle; a route that does not show a scene never pays
 * for one.
 *
 * Server Components cannot call dynamic() with ssr: false, so this module
 * is a client boundary and pages import from here rather than reaching
 * for the scene components directly.
 */

export const BlochSphere = dynamic(
  () => import('./BlochSphere').then((m) => m.BlochSphere),
  {
    ssr: false,
    loading: () => <CalibrationLoader subject="Bloch sphere" />,
  },
);

export const QuantumCircuitScene = dynamic(
  () => import('./QuantumCircuitScene').then((m) => m.QuantumCircuitScene),
  {
    ssr: false,
    loading: () => <CalibrationLoader subject="quantum circuit" />,
  },
);

export const EntanglementParticles = dynamic(
  () => import('./EntanglementParticles').then((m) => m.EntanglementParticles),
  {
    ssr: false,
    loading: () => <CalibrationLoader subject="entangled pair" />,
  },
);
