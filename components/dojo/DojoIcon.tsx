import { dojoIconSrc, type DojoIconName } from '@/lib/dojo/icons';

// Ikon ilustrasi pengganti emoji. Tanpa `label` dianggap dekoratif (alt kosong).
export default function DojoIcon({ name, className = 'h-5 w-5', label, muted = false }: { name: DojoIconName; className?: string; label?: string; muted?: boolean }) {
  return (
    <img
      src={dojoIconSrc(name)}
      alt={label ?? ''}
      width={128}
      height={128}
      decoding="async"
      draggable={false}
      className={`inline-block shrink-0 select-none object-contain align-middle ${muted ? 'opacity-40 grayscale' : ''} ${className}`}
    />
  );
}
