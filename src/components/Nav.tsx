import { useState } from "react";
import { useLocation } from "wouter";
import { X, Menu, Home, Image, Briefcase, Phone, Table2 } from "lucide-react";

const links = [
  { label: "Home",       path: "/",           Icon: Home      },
  { label: "Price List", path: "/pricelist",  Icon: Table2    },
  { label: "Gallery",    path: "/gallery",    Icon: Image     },
  { label: "B2B Deals",  path: "/b2b",        Icon: Briefcase },
  { label: "Contact",    path: "/contact",    Icon: Phone     },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useLocation();

  const navigate = (path: string) => {
    setLocation(path);
    setOpen(false);
  };

  return (
    <>
      {/* Hamburger button */}
      <button
        data-testid="button-menu-toggle"
        onClick={() => setOpen(true)}
        className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full flex items-center justify-center transition-all"
        style={{
          background: "hsl(0 0% 10%)",
          border: "1px solid hsl(45 75% 50% / 0.35)",
          boxShadow: "0 2px 16px hsl(45 75% 50% / 0.2)",
        }}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-[hsl(45_75%_62%)]" />
      </button>

      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full z-50 flex flex-col"
        style={{
          width: "min(280px, 85vw)",
          background: "hsl(0 0% 8%)",
          borderLeft: "1px solid hsl(45 75% 50% / 0.2)",
          boxShadow: "-8px 0 32px hsl(0 0% 0% / 0.6)",
          transform: open ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(.4,0,.2,1)",
        }}
      >
        {/* Drawer header */}
        <div
          className="flex items-center justify-between px-6 py-5 border-b"
          style={{ borderColor: "hsl(45 75% 50% / 0.15)" }}
        >
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-[hsl(45_75%_50%)]">Menu</p>
            <p className="text-base font-serif font-semibold gold-text mt-0.5">New Abra Ka Dabra</p>
          </div>
          <button
            data-testid="button-menu-close"
            onClick={() => setOpen(false)}
            className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 flex flex-col gap-1">
          {links.map(({ label, path, Icon }) => {
            const active = location === path;
            return (
              <button
                key={path}
                data-testid={`nav-link-${label.toLowerCase().replace(/\s+/g, "-")}`}
                onClick={() => navigate(path)}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-left transition-all"
                style={{
                  background: active ? "hsl(45 75% 50% / 0.12)" : "transparent",
                  borderLeft: active ? "2px solid hsl(45 75% 50%)" : "2px solid transparent",
                }}
              >
                <Icon
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: active ? "hsl(45 75% 62%)" : "hsl(45 20% 50%)" }}
                />
                <span
                  className="text-sm font-medium"
                  style={{ color: active ? "hsl(45 75% 80%)" : "hsl(45 20% 65%)" }}
                >
                  {label}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Drawer footer */}
        <div
          className="px-6 py-5 border-t"
          style={{ borderColor: "hsl(45 75% 50% / 0.15)" }}
        >
          <p className="text-[11px] text-muted-foreground">
            Shop No. 70, Galleria Mall, Powai
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Open 10AM – 10PM · All Days</p>
        </div>
      </div>
    </>
  );
}
