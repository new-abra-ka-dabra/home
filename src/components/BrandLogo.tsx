interface BrandLogoProps {
  name: string;
  size?: number;
  icon?: React.ComponentType<{ style?: React.CSSProperties }>;
  color?: string;
}

// Brands that have a real logo file in public/logos/<slug>.svg
const LOCAL_LOGOS = new Set([
  "ambrane", "digitek", "google", "honeywell", "lito",
  "neopack", "portronics", "realme", "spigen", "stuffcool", "itel"
]);

// Fallback hand-crafted SVG wordmarks for brands without a file
const svgLogos: Record<string, (size: number) => React.ReactElement> = {
  Itel: (s) => (
    <svg width={s * 1.6} height={s * 0.8} viewBox="0 0 64 32" fill="none">
      <text x="0" y="25" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="22"
        fill="#00BFFF" letterSpacing="1">itel</text>
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
  const slug = name.toLowerCase();

  // 1. Use real local logo if available
  if (LOCAL_LOGOS.has(slug)) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}logos/${slug}.svg`}
        alt={`${name} logo`}
        draggable={false}
        style={{
          height: size,
          width: size * 2.5,
          objectFit: "contain",
          objectPosition: "center",
          display: "block",
        }}
      />
    );
  }

  // 2. React-icon (Apple, Samsung, Xiaomi, Motorola, Vivo, Sony, Nokia, Boat, Bose …)
  if (Icon) {
    return <Icon style={{ color, fontSize: size }} />;
  }

  // 3. Hand-crafted SVG wordmark fallback
  const svgFn = svgLogos[name];
  if (svgFn) return svgFn(size);

  // 4. Plain-text last resort
  return (
    <span
      className="font-bold text-center leading-none"
      style={{
        color: color ?? "#cccccc",
        fontSize: Math.max(10, size * 0.42),
        maxWidth: size * 2.5,
        wordBreak: "break-word",
      }}
    >
      {name}
    </span>
  );
}
