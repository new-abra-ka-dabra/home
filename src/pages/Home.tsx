import { useLocation } from "wouter";
import {
  SiApple, SiXiaomi, SiMotorola,
  SiNokia, SiSony, SiVivo, SiGoogle, SiInstagram,
  SiBoat, SiBose
} from "react-icons/si";
import { Phone, MapPin, ChevronRight, Smartphone, Zap, Shield, Headphones } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const brands = [
  { name: "Apple",    icon: SiApple,    color: "#e0e0e0" },
  { name: "Samsung",  icon: undefined,  color: "#ffffff" },
  { name: "Xiaomi",   icon: SiXiaomi,   color: "#FF6900" },
  { name: "Google",   icon: SiGoogle,   color: "#4285F4" },
  { name: "Motorola", icon: SiMotorola, color: "#5DADE2" },
  { name: "Vivo",     icon: SiVivo,     color: "#415FFF" },
  { name: "Sony",     icon: SiSony,     color: "#cccccc" },
  { name: "Realme",   icon: undefined,  color: "#e8e8e8" },
  { name: "Nokia",    icon: SiNokia,    color: "#5DADE2" },
  { name: "Itel",     icon: undefined,  color: "#00BFFF" },
];

const accessories = [
  { name: "Stuffcool",  icon: undefined, color: "#FF6B35" },
  { name: "Spigen",     icon: undefined, color: "#e0e0e0" },
  { name: "Portronics", icon: undefined, color: "#00C4CC" },
  { name: "Boat",       icon: SiBoat,    color: "#E63946" },
  { name: "Bose",       icon: SiBose,    color: "#d4af37" },
  { name: "Ambrane",    icon: undefined, color: "#7B2FBE" },
  { name: "Honeywell",  icon: undefined, color: "#e84118" },
  { name: "Digitek",    icon: undefined, color: "#2980b9" },
  { name: "Membrane",   icon: undefined, color: "#38BDF8" },
  { name: "Lito",       icon: undefined, color: "#4ADE80" },
  { name: "Neopack",    icon: undefined, color: "#FB923C" },
];

const features = [
  { Icon: Smartphone, label: "All Top Brands",   desc: "Every major brand under one roof" },
  { Icon: Zap,        label: "Best Prices",      desc: "Competitive pricing guaranteed"   },
  { Icon: Shield,     label: "Genuine Products", desc: "100% authentic devices always"    },
];

export default function Home() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      {/* ── Hero ── */}
      <header className="relative flex flex-col items-center justify-center pt-16 pb-10 px-4 text-center overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: "radial-gradient(ellipse 70% 45% at 50% 0%, hsl(45 75% 50% / 0.16) 0%, transparent 70%)" }}
        />
        <div className="animate-fade-in">
          {/* Logo circle — padded so image never touches the clipped edge */}
          <div
            className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{
              border: "2px solid hsl(45 75% 50% / 0.5)",
              boxShadow: "0 0 40px hsl(45 75% 50% / 0.25)",
              background: "#000",
              padding: "10%",
            }}
          >
            <img
              src={`${import.meta.env.BASE_URL}logo.png`}
              alt="New Abra Ka Dabra Logo"
              className="w-full h-full object-contain"
              data-testid="img-logo"
            />
          </div>
        </div>

        <div className="animate-fade-in-up" style={{ animationDelay: "100ms" }}>
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="w-2 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#fde68a,#b8942a)" }} />
            <span className="text-[10px] sm:text-xs tracking-[0.22em] sm:tracking-[0.28em] uppercase text-[hsl(45_75%_50%)] font-medium">
              Mobile &amp; Electronics · Powai, Mumbai
            </span>
            <div className="w-2 h-6 rounded-full" style={{ background: "linear-gradient(180deg,#fde68a,#b8942a)" }} />
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-bold leading-tight tracking-tight gold-text">
            New Abra Ka Dabra
          </h1>
          <p className="mt-2 text-sm sm:text-lg text-muted-foreground font-medium">Harish Patel</p>
          <p className="mt-4 text-muted-foreground text-xs sm:text-sm max-w-xs sm:max-w-sm mx-auto leading-relaxed">
            Mobile Phones · Tablets · Accessories · Covers<br />
            Best deals on the latest gadgets &amp; premium accessories
          </p>
        </div>

        <div
          className="mt-7 h-px w-28 animate-fade-in"
          style={{ background: "linear-gradient(90deg, transparent, hsl(45 75% 50% / 0.6), transparent)", animationDelay: "250ms" }}
        />
      </header>

      {/* ── Feature pills ── */}
      <section className="flex flex-wrap justify-center gap-3 px-4 mb-12 animate-fade-in" style={{ animationDelay: "300ms" }}>
        {features.map(({ Icon, label, desc }) => (
          <div key={label} className="gold-border-glow flex items-center gap-3 bg-card rounded-2xl px-4 sm:px-5 py-3 w-full sm:w-auto max-w-xs sm:max-w-none">
            <Icon className="w-5 h-5 flex-shrink-0 text-[hsl(45_75%_50%)]" />
            <div className="text-left">
              <p className="text-sm font-semibold text-foreground leading-none">{label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* ── Mobile Brands ── */}
      <section className="px-4 max-w-4xl mx-auto mb-10">
        <h2 className="text-center text-xs tracking-[0.25em] uppercase text-[hsl(45_75%_50%)] mb-8 animate-fade-in" style={{ animationDelay: "350ms" }}>
          Brands We Carry
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 sm:gap-4">
          {brands.map(({ name, icon, color }, i) => (
            <div
              key={name}
              data-testid={`brand-card-${name.toLowerCase()}`}
              className="brand-card gold-border-glow bg-card rounded-2xl flex flex-col items-center justify-center gap-2 p-3 sm:p-4 cursor-default animate-scale-in"
              style={{ animationDelay: `${80 + i * 40}ms` }}
            >
              <BrandLogo name={name} color={color} size={28} icon={icon} />
              <span className="text-[10px] sm:text-[11px] text-muted-foreground font-medium tracking-wide text-center">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Accessories ── */}
      <section className="px-4 max-w-4xl mx-auto mb-16">
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-px flex-1 max-w-16" style={{ background: "hsl(45 75% 50% / 0.3)" }} />
          <div className="flex items-center gap-2">
            <Headphones className="w-4 h-4 text-[hsl(45_75%_50%)]" />
            <h2 className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.25em] uppercase text-[hsl(45_75%_50%)]">
              Accessories &amp; Screen Protectors
            </h2>
          </div>
          <div className="h-px flex-1 max-w-16" style={{ background: "hsl(45 75% 50% / 0.3)" }} />
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 sm:gap-3">
          {accessories.map(({ name, icon, color }, i) => (
            <div
              key={name}
              data-testid={`accessory-card-${name.toLowerCase()}`}
              className="brand-card animate-scale-in flex flex-col items-center justify-center gap-2 p-2.5 sm:p-3 rounded-2xl cursor-default"
              style={{ animationDelay: `${80 + i * 40}ms`, background: "hsl(0 0% 10%)", border: "1px solid hsl(45 75% 50% / 0.12)" }}
            >
              <BrandLogo name={name} color={color} size={24} icon={icon} />
              <span className="text-[9px] sm:text-[10px] text-muted-foreground font-medium tracking-wide text-center">{name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact CTA ── */}
      <section className="flex flex-col items-center pb-16 px-4 animate-fade-in-up" style={{ animationDelay: "500ms" }}>
        <div className="w-full max-w-md rounded-3xl p-px" style={{ background: "linear-gradient(135deg,#b8942a,#fde68a,#b8942a)" }}>
          <div className="bg-card rounded-3xl p-6 sm:p-8 text-center">
            <p className="text-muted-foreground text-sm mb-2">Ready to find your next device?</p>
            <h3 className="text-xl sm:text-2xl font-serif font-semibold text-foreground mb-6">Get in Touch</h3>
            <button
              data-testid="button-contact"
              onClick={() => setLocation("/contact")}
              className="contact-btn w-full flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold text-sm transition-opacity hover:opacity-90"
              style={{ background: "linear-gradient(135deg,#b8942a 0%,#f0c040 50%,#b8942a 100%)", color: "#0f0f0f" }}
            >
              Contact Us <ChevronRight className="w-4 h-4" />
            </button>
            <div className="mt-6 flex flex-col gap-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[hsl(45_75%_50%)]" />
                <span>+91 9892139878 / +91 9004149999</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-center">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-[hsl(45_75%_50%)]" />
                <span>Galleria Mall, Hiranandani Gardens, Powai</span>
              </div>
            </div>
          </div>
        </div>
        <a
          href="https://www.instagram.com/newabrakadabra70"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="link-instagram"
          className="mt-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-[hsl(45_75%_62%)] transition-colors"
        >
          <SiInstagram className="w-4 h-4" />
          @newabrakadabra70
        </a>
      </section>

      {/* ── Footer ── */}
      <footer className="text-center py-6 text-[11px] text-muted-foreground border-t" style={{ borderColor: "hsl(45 20% 18%)" }}>
        &copy; {new Date().getFullYear()} New Abra Ka Dabra. All rights reserved.
      </footer>
    </div>
  );
}
