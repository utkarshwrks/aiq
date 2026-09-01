import { EntanglementParticles } from '@/components/3d/lazy';
import { Panel } from '@/components/ui/Panel';

export default function EntanglementLabPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel className="h-[30rem] overflow-hidden">
        <EntanglementParticles />
      </Panel>
      <Panel className="h-[30rem] overflow-hidden">
        <EntanglementParticles variant="ambient" />
      </Panel>
    </div>
  );
}
