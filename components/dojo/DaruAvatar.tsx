import { daruSrc, daruTier, DARU_GEAR } from '@/lib/dojo/daru';

// Avatar Daru sesuai level (berganti perlengkapan setiap naik sabuk).
export default function DaruAvatar({ level, tier, className = 'h-28 w-28', eager = false, alt }: { level?: number; tier?: number; className?: string; eager?: boolean; alt?: string }) {
  const t = tier ?? daruTier(level ?? 1);
  return (
    <img
      src={daruSrc(t)}
      alt={alt ?? `Daru: ${DARU_GEAR[t].name}`}
      width={512}
      height={512}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      className={`select-none object-contain ${className}`}
    />
  );
}
