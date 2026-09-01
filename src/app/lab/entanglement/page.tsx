import { EntanglementParticles } from '@/components/3d/lazy';
import { DeferredScene } from '@/components/3d/DeferredScene';
import { Panel } from '@/components/ui/Panel';

export default function EntanglementLabPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel className="h-[30rem] overflow-hidden">
        <DeferredScene subject="entangled pair">
          <EntanglementParticles />
        </DeferredScene>
      </Panel>
      <Panel className="h-[30rem] overflow-hidden">
        <DeferredScene subject="entangled pair">
          <EntanglementParticles variant="ambient" />
        </DeferredScene>
      </Panel>
    </div>
  );
}
