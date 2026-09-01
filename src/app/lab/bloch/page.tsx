import { BlochSphere } from '@/components/3d/lazy';
import { DeferredScene } from '@/components/3d/DeferredScene';
import { Panel } from '@/components/ui/Panel';

export default function BlochLabPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel className="h-[34rem] overflow-hidden">
        <DeferredScene subject="Bloch sphere">
          <BlochSphere />
        </DeferredScene>
      </Panel>
      <Panel className="h-[34rem] overflow-hidden">
        <DeferredScene subject="Bloch sphere">
          <BlochSphere showReadout={false} showLabels={false} />
        </DeferredScene>
      </Panel>
    </div>
  );
}
