// Daruma kecil untuk Dōjō. eyes: 0 = belum ada target, 1 = target dipasang, 2 = tercapai.
export default function DarumaIcon({ eyes = 1, color = '#e8453c', className = 'w-16 h-16' }: { eyes?: 0 | 1 | 2; color?: string; className?: string }) {
  return (
    <svg viewBox="0 0 200 220" className={className} aria-hidden="true">
      <ellipse cx="100" cy="208" rx="62" ry="7" fill="#000" opacity="0.08" />
      <path d="M100 12 C150 12 182 58 182 112 C182 170 148 206 100 206 C52 206 18 170 18 112 C18 58 50 12 100 12 Z" fill={color} />
      <ellipse cx="66" cy="52" rx="22" ry="12" fill="#fff" opacity="0.22" transform="rotate(-25 66 52)" />
      <ellipse cx="100" cy="94" rx="54" ry="47" fill="#fff8f0" />
      <path d="M60 70 Q75 57 90 66" fill="none" stroke="#1d1d1f" strokeWidth="6" strokeLinecap="round" />
      <path d="M110 66 Q125 57 140 70" fill="none" stroke="#1d1d1f" strokeWidth="6" strokeLinecap="round" />
      <circle cx="77" cy="90" r="13" fill="#fff" stroke="#1d1d1f" strokeWidth="2.5" />
      {eyes >= 1 && <circle cx="77" cy="90" r="8.5" fill="#1d1d1f" />}
      <circle cx="123" cy="90" r="13" fill="#fff" stroke="#1d1d1f" strokeWidth="2.5" />
      {eyes >= 2 && <circle cx="123" cy="90" r="8.5" fill="#1d1d1f" />}
      <path d="M80 114 Q90 106 100 113 Q110 106 120 114" fill="none" stroke="#3a3a3c" strokeWidth="4" strokeLinecap="round" />
      <path d="M94 124 Q100 128 106 124" fill="none" stroke="#3a3a3c" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
