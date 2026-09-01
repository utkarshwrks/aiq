import { BlochSphere } from '@/components/3d/lazy';
import { Panel } from '@/components/ui/Panel';

export default function BlochLabPage() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Panel className="h-[34rem] overflow-hidden">
        <BlochSphere />
      </Panel>
      <Panel className="h-[34rem] overflow-hidden">
        <BlochSphere showReadout={false} showLabels={false} />
      </Panel>
    </div>
  );
}
