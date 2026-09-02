import { Figure } from './Figure';
import {
  AmplitudeVsProbability,
  BitVsQubit,
  CircuitNotation,
  DecoherenceDecay,
  EntanglementOutcomes,
  ErrorCorrectionBlock,
  InterferencePaths,
  MeasurementCollapse,
} from './foundations';
import { ComplexityShapes, VariationalLoop } from './algorithms';

/**
 * Which figure belongs to which concept.
 *
 * A registry rather than a prop on the content entry, because the
 * content file is prose and should not import components. A concept with
 * no entry here simply renders without a figure; that is a legitimate
 * state, not a gap to be filled for symmetry.
 */
const FIGURES: Record<
  string,
  { label: string; caption: string; Drawing: () => React.JSX.Element }
> = {
  qubit: {
    label: 'Fig. 01 / State space',
    caption:
      'A bit chooses between two seats. A qubit chooses a direction, of which there are a continuum - but a measurement still returns only which pole it fell to.',
    Drawing: BitVsQubit,
  },
  superposition: {
    label: 'Fig. 02 / Amplitudes',
    caption:
      'Amplitudes are signed and can cancel; probabilities are their squared magnitudes and can only accumulate. Two amplitudes of opposite sign give the same probabilities as two of the same sign, which is precisely the information squaring throws away.',
    Drawing: AmplitudeVsProbability,
  },
  entanglement: {
    label: 'Fig. 03 / Joint outcomes',
    caption:
      'Measured in the same basis, a Bell pair never disagrees. Each qubit alone is an even coin flip; the correlation lives in the pair, and no classical set of shared instructions reproduces its strength.',
    Drawing: EntanglementOutcomes,
  },
  interference: {
    label: 'Fig. 04 / Path addition',
    caption:
      'Paths to the same outcome add as amplitudes before squaring. In phase they reinforce; in opposite phase they annihilate. Every quantum speed-up is an arrangement of the second case over the wrong answers.',
    Drawing: InterferencePaths,
  },
  gates: {
    label: 'Fig. 05 / Circuit notation',
    caption:
      'The standard drawing: one wire per qubit, time left to right, a Hadamard putting the top wire into superposition, a controlled-NOT entangling the pair, and measurement - the only irreversible step - at the end.',
    Drawing: CircuitNotation,
  },
  decoherence: {
    label: 'Fig. 06 / Loss of phase',
    caption:
      'Decoherence does not rotate the state vector to somewhere wrong. It shortens it: the qubit moves from the surface of the sphere towards the centre, and a vector of zero length is a qubit carrying no phase and no interference.',
    Drawing: DecoherenceDecay,
  },
  'error-correction': {
    label: 'Fig. 07 / Encoding cost',
    caption:
      'One logical qubit is an entangled block of many physical ones. Nine is the historical small case; a fault-tolerant machine is currently estimated at a thousand or more physical qubits per logical qubit.',
    Drawing: ErrorCorrectionBlock,
  },
  shor: {
    label: 'Fig. / Two shapes of speed-up',
    caption:
      'Factoring is the exponential case: the classical cost climbs steeply where the quantum cost stays polynomial. Search is the quadratic case, and a square root is a far smaller prize - it is the difference between breaking a scheme and needing to double a key length.',
    Drawing: ComplexityShapes,
  },
  vqe: {
    label: 'Fig. / The variational loop',
    caption:
      'Near-term algorithms put the search in a classical optimiser and keep the quantum circuit shallow enough to survive the hardware. The quantum step evaluates; it does not decide.',
    Drawing: VariationalLoop,
  },
  measurement: {
    label: 'Fig. 08 / The Born rule',
    caption:
      'The polar angle sets the two probabilities and nothing else survives. Reading the qubit returns one bit and leaves the state at whichever pole it fell to.',
    Drawing: MeasurementCollapse,
  },
};

/** Renders the figure for a concept, or nothing if it has none. */
export function ConceptFigure({
  slug,
  className,
}: {
  slug: string;
  className?: string;
}) {
  const entry = FIGURES[slug];
  if (!entry) return null;

  const { label, caption, Drawing } = entry;
  return (
    <Figure label={label} caption={caption} {...(className ? { className } : {})}>
      <Drawing />
    </Figure>
  );
}
