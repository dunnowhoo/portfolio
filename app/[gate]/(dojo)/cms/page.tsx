import CmsEditor from '@/components/dojo/cms/CmsEditor';
import { requireDojo } from '@/lib/dojo/dal';
import { getEditorState } from '@/lib/site/cms';

export default async function CmsPage({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  const { draft, meta } = await getEditorState();
  return <CmsEditor gate={gate} initial={draft} meta={meta} />;
}
