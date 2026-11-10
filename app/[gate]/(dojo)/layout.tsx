import { requireDojo } from '@/lib/dojo/dal';
import { ensureSeeded } from '@/lib/dojo/bootstrap';
import { getTodayStateCached } from '@/lib/dojo/engine/core';
import DojoShell from '@/components/dojo/DojoShell';
import 'highlight.js/styles/github.css';

export default async function DojoLayout({ children, params }: { children: React.ReactNode; params: Promise<{ gate: string }> }) {
  const { gate } = await params;
  await requireDojo(gate);
  await ensureSeeded();
  const st = await getTodayStateCached();
  const chip = { jp: st.streaks.jp.current, dsa: st.streaks.dsa.current, jpSafe: st.streaks.jp.status === 'aman', dsaSafe: st.streaks.dsa.status === 'aman' };
  return (
    <DojoShell gate={gate} chip={chip}>
      {children}
    </DojoShell>
  );
}
