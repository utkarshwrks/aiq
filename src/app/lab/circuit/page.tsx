import { QuantumCircuitScene } from '@/components/3d/lazy';
import { Panel } from '@/components/ui/Panel';

export default function CircuitLabPage() {
  return (
    <div className="grid gap-6">
      <Panel className="h-[32rem] overflow-hidden">
        <QuantumCircuitScene selectable />
      </Panel>
    </div>
  );
}
