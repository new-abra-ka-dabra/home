import { useLocation } from "wouter";
import { Phone, Mail, MapPin, ArrowLeft, Clock, PhoneCall } from "lucide-react";
import { SiInstagram, SiWhatsapp } from "react-icons/si";

const contactItems = [
  {
    Icon: Phone,
    label: "Mobile",
    value: "+91 9892139878\n+91 9004149999",
    href: "tel:+919892139878",
    note: "Tap number to call",
    testId: "link-phone",
  },
  {
    Icon: PhoneCall,
    label: "Landline",
    value: "+91 22 25797924",
    href: "tel:+912225797924",
    note: "Tap number to call",
    testId: "link-landline",
  },
  {
    Icon: SiWhatsapp,
    label: "WhatsApp",
    value: "Chat with us on WhatsApp",
    href: "https://wa.me/919892139878",
    note: null,
    testId: "link-whatsapp",
  },
  {
    Icon: Mail,
    label: "Email",
    value: "hirji.newabrakadabra@gmail.com",
    href: "mailto:hirji.newabrakadabra@gmail.com",
    note: null,
    testId: "link-email",
  },
  {
    Icon: MapPin,
    label: "Location",
    value:
      "Shop No. 70, Galleria Shopping Mall,\nHiranandani Gardens, Powai,\nMumbai — 400072",
    href: "https://maps.app.goo.gl/YZdUBwiV8yLdZA5PA",
    note: "Tap to open in Maps",
    testId: "link-address",
  },
  {
    Icon: Clock,
    label: "Hours",
    value: "Open 10AM – 10PM, All Days\n(Sat & Sun too!)",
    href: null,
    note: null,
    testId: "text-hours",
  },
];

export default function Contact() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Radial glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 50% 35% at 50% 0%, hsl(45 75% 50% / 0.12) 0%, transparent 70%)",
        }}
      />

      <div className="relative max-w-lg mx-auto px-4 pt-12 pb-20">
        {/* Back */}
        <button
          data-testid="button-back-home"
          onClick={() => setLocation("/")}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-[hsl(45_75%_62%)] transition-colors mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Logo + Title */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{
              border: "2px solid hsl(45 75% 50% / 0.5)",
              boxShadow: "0 0 24px hsl(45 75% 50% / 0.2)",
              background: "#000",
              padding: "10%",
            }}
          >
            <img
              src="/home/logo.png"
              alt="New Abra Ka Dabra Logo"
              className="w-full h-full object-contain"
              data-testid="img-logo-contact"
            />
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-[hsl(45_75%_50%)] mb-2">
            Reach Out
          </p>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold gold-text">New Abra Ka Dabra</h1>
          <p className="text-sm text-muted-foreground mt-1">Harish Patel</p>
          <div
            className="mt-4 h-px w-24 mx-auto"
            style={{
              background:
                "linear-gradient(90deg, transparent, hsl(45 75% 50% / 0.6), transparent)",
            }}
          />
          <p className="mt-4 text-muted-foreground text-sm leading-relaxed">
            Mobile Phones · Tablets · Accessories · Covers
          </p>
        </div>

        {/* Contact cards */}
        <div className="flex flex-col gap-3">
          {contactItems.map(({ Icon, label, value, href, note, testId }, i) => {
            const inner = (
              <div
                className="gold-border-glow bg-card rounded-2xl flex items-start gap-4 px-4 sm:px-5 py-4 brand-card"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div
                  className="mt-0.5 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "linear-gradient(135deg,hsl(45 75% 16%),hsl(45 75% 26%))",
                  }}
                >
                  <Icon className="w-4 h-4 text-[hsl(45_75%_62%)]" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] uppercase tracking-widest text-muted-foreground mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-foreground leading-snug whitespace-pre-line break-words">
                    {value}
                  </p>
                  {note && (
                    <p className="text-[11px] text-muted-foreground italic mt-1">{note}</p>
                  )}
                </div>
              </div>
            );

            return href ? (
              <a
                key={label}
                href={href}
                target={href.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                data-testid={testId}
                className="block no-underline"
              >
                {inner}
              </a>
            ) : (
              <div key={label} data-testid={testId}>
                {inner}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="mt-8 flex flex-col gap-3">
          {/* Get Directions */}
          <div
            className="rounded-2xl p-px"
            style={{ background: "linear-gradient(135deg,#b8942a,#fde68a,#b8942a)" }}
          >
            <a
              href="https://maps.app.goo.gl/YZdUBwiV8yLdZA5PA"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-get-directions"
              className="flex items-center justify-center gap-2 bg-card rounded-2xl px-8 py-3.5 text-sm font-semibold text-[hsl(45_75%_62%)] hover:text-[hsl(45_75%_75%)] transition-colors"
            >
              <MapPin className="w-4 h-4" />
              Get Directions on Google Maps
            </a>
          </div>

          {/* Apple Maps */}
          <a
            href="https://maps.apple.com/?address=121-122,%20Central%20Avenue,%20Galleria%20Shopping%20Mall,%20Hiranandani%20Gardens,%20Powai,%20Mumbai,%20400076&ll=19.119414,72.911844&q=New%20Abra%20Ka%20Dabra"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-apple-maps"
            className="flex items-center justify-center gap-2 gold-border-glow bg-card rounded-2xl px-8 py-3.5 text-sm text-muted-foreground hover:text-[hsl(45_75%_62%)] transition-colors"
          >
            <MapPin className="w-4 h-4" />
            Open in Apple Maps
          </a>
        </div>

        {/* Instagram */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground uppercase tracking-widest">Follow Us</p>
          <a
            href="https://www.instagram.com/newabrakadabra70"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-instagram"
            className="w-12 h-12 rounded-full gold-border-glow flex items-center justify-center hover:bg-[hsl(45_75%_50%)] hover:text-black transition-all text-[hsl(45_75%_62%)]"
          >
            <SiInstagram className="w-5 h-5" />
          </a>
          <p className="text-xs text-muted-foreground italic">@newabrakadabra70</p>
        </div>
      </div>

      {/* Footer */}
      <footer
        className="text-center py-6 text-[11px] text-muted-foreground border-t"
        style={{ borderColor: "hsl(45 20% 18%)" }}
      >
        &copy; {new Date().getFullYear()} New Abra Ka Dabra. All rights reserved.
      </footer>
    </div>
  );
}
