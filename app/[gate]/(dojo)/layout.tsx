import { requireDojo } from '@/lib/dojo/dal';
import { ensureSeeded } from '@/lib/dojo/bootstrap';
import DojoShell from '@/components/dojo/DojoShell';
import 'highlight.js/styles/github.css';

export default async function DojoLayout({ children, params }: { children: React.ReactNode; params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  await ensureSeeded();
  return <DojoShell gate={gate}>{children}</DojoShell>;
}
