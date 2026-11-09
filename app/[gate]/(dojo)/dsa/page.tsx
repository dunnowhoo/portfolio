import PathPage from '@/components/dojo/path/PathPage';
import { requireDojo } from '@/lib/dojo/dal';

export default async function Page({ params }: { params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  return <PathPage track="dsa" />;
}
