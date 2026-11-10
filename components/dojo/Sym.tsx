// Glyph kecil dari Material Symbols (vektor, bukan emoji) untuk centang, bintang, panah, dsb.
export function Sym({ name, className = 'text-[16px]', fill = false, bold = false, label }: { name: string; className?: string; fill?: boolean; bold?: boolean; label?: string }) {
  const axes = [fill && "'FILL' 1", bold && "'wght' 700"].filter(Boolean).join(', ');
  return (
    <span
      className={`material-symbols-outlined inline-block align-[-0.2em] leading-none ${className}`}
      style={axes ? { fontVariationSettings: axes } : undefined}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {name}
    </span>
  );
}

/** Bintang penguasaan (★1–★3): terisi emas, sisanya abu-abu. */
export function Stars({ n, of = 3, size = 'text-[14px]', className = '' }: { n: number; of?: number; size?: string; className?: string }) {
  const k = Math.max(0, Math.min(of, Math.round(n)));
  return (
    <span className={`inline-flex items-center align-middle leading-none ${className}`} role="img" aria-label={`${k} dari ${of} bintang`}>
      {Array.from({ length: of }, (_, i) => (
        <span key={i} aria-hidden="true" className={`material-symbols-outlined leading-none ${size} ${i < k ? 'text-[#ffb800]' : 'text-[#d1d1d6]'}`} style={{ fontVariationSettings: "'FILL' 1" }}>
          star
        </span>
      ))}
    </span>
  );
}
