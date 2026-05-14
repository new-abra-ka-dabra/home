interface BrandLogoProps {
  name: string;
  size?: number;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  color?: string;
}

// Inline SVG wordmark logos for brands not in react-icons
const svgLogos: Record<string, (size: number) => React.ReactElement> = {
  Realme: (s) => (
    <svg width={s * 2.4} height={s * 0.8} viewBox="0 0 96 32" fill="none">
      <text x="0" y="26" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="26"
        letterSpacing="-0.5" fill="url(#rg)">realme</text>
      <defs>
        <linearGradient id="rg" x1="0" y1="0" x2="100%" y2="0">
          <stop offset="0%" stopColor="#FFCA28"/>
          <stop offset="100%" stopColor="#FF6900"/>
        </linearGradient>
      </defs>
    </svg>
  ),
  Itel: (s) => (
    <svg width={s * 1.6} height={s * 0.8} viewBox="0 0 64 32" fill="none">
      <text x="0" y="25" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="22"
        fill="#00BFFF" letterSpacing="1">itel</text>
    </svg>
  ),
  Stuffcool: (s) => (
    <svg width={s * 2.6} height={s * 0.9} viewBox="0 0 104 36" fill="none">
      <rect width="104" height="36" rx="4" fill="#FF6B35"/>
      <text x="6" y="26" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="17"
        fill="white" letterSpacing="0.3">stuffcool</text>
    </svg>
  ),
  Spigen: (s) => (
    <svg width={s * 2.2} height={s * 0.8} viewBox="0 0 88 32" fill="none">
      <text x="0" y="25" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="22"
        fill="#e0e0e0" letterSpacing="0.5">SPIGEN</text>
    </svg>
  ),
  Portronics: (s) => (
    <svg width={s * 3} height={s * 0.85} viewBox="0 0 120 34" fill="none">
      <text x="0" y="25" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="18"
        fill="#00C4CC" letterSpacing="0.3">PORTRONICS</text>
    </svg>
  ),
  Ambrane: (s) => (
    <svg width={s * 2.4} height={s * 0.85} viewBox="0 0 96 34" fill="none">
      <text x="0" y="25" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="22"
        fill="#A855F7" letterSpacing="0.3">ambrane</text>
    </svg>
  ),
  Neopack: (s) => (
    <svg width={s * 2.8} height={s * 0.85} viewBox="0 0 112 34" fill="none">
      <text x="0" y="26" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="21"
        fill="#FB923C" letterSpacing="0.3">NEOPACK</text>
    </svg>
  ),
  Lito: (s) => (
    <svg width={s * 1.4} height={s * 0.85} viewBox="0 0 56 34" fill="none">
      <rect width="56" height="34" rx="4" fill="#22C55E"/>
      <text x="7" y="25" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="20"
        fill="white" letterSpacing="0.5">lito</text>
    </svg>
  ),
  Membrane: (s) => (
    <svg width={s * 2.8} height={s * 0.85} viewBox="0 0 112 34" fill="none">
      <text x="0" y="25" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="18"
        fill="#38BDF8" letterSpacing="0.3">MEMBRANE</text>
    </svg>
  ),
};

export default function BrandLogo({ name, size = 32, icon: Icon, color }: BrandLogoProps) {
  if (Icon) {
    return <Icon style={{ color, fontSize: size }} />;
  }

  const svgFn = svgLogos[name];
  if (svgFn) {
    return svgFn(size);
  }

  // Plain text fallback
  return (
    <span
      className="font-bold text-center leading-none"
      style={{ color: color ?? "#cccccc", fontSize: Math.max(10, size * 0.42), maxWidth: size * 2.5, wordBreak: "break-word" }}
    >
      {name}
    </span>
  );
}
