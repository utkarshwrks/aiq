import type { Metadata } from 'next';
import { PageShell } from '@/components/layout/PageShell';
import { GlossaryIndex } from '@/components/panels/GlossaryIndex';
import { Readout } from '@/components/ui/Readout';
import { GLOSSARY } from '@/content/glossary';

export const metadata: Metadata = {
  title: 'Glossary',
  description:
    'A searchable A to Z of quantum computing terminology, with explicit notes wherever a term is routinely used loosely.',
};

export default function GlossaryPage() {
  const withNotes = GLOSSARY.filter((entry) => entry.note).length;

  return (
    <PageShell
      plate="07"
      eyebrow="Terminology"
      title="Glossary"
      lede="Definitions written to be read cold, without the surrounding page. Where a term is routinely used loosely, the entry says so - a glossary that repeats the ambient confusion is worse than none."
      aside={
        <div className="flex gap-8">
          <Readout label="Terms" value={GLOSSARY.length} align="right" />
          <Readout
            label="With corrections"
            value={withNotes}
            tone="amber"
            align="right"
          />
        </div>
      }
    >
      <GlossaryIndex />
    </PageShell>
  );
}
