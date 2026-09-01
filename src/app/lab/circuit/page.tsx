import { QuantumCircuitScene } from '@/components/3d/lazy';
import { DeferredScene } from '@/components/3d/DeferredScene';
import { Panel } from '@/components/ui/Panel';

export default function CircuitLabPage() {
  return (
    <div className="grid gap-6">
      <Panel className="h-[32rem] overflow-hidden">
        <DeferredScene subject="quantum circuit">
          <QuantumCircuitScene selectable />
        </DeferredScene>
      </Panel>
    </div>
  );
}
