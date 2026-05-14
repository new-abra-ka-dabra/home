import { useState } from "react";
import { useLocation } from "wouter";
import { Briefcase, CheckCircle, Phone, Mail, ChevronRight, Package, Users, Truck, Send, Loader2 } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

const inquirySchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  company: z.string().min(2, "Company name required"),
  phone: z.string().min(10, "Enter a valid phone number"),
  email: z.string().email("Enter a valid email"),
  brandsInterested: z.string().min(1, "Please mention the brands you need"),
  message: z.string().min(10, "Please describe your requirements"),
});

type InquiryForm = z.infer<typeof inquirySchema>;

const highlights = [
  { Icon: Package, label: "Bulk Orders",      desc: "Minimum order quantities for all major brands"       },
  { Icon: Users,   label: "Corporate Pricing", desc: "Special rates for businesses, schools & enterprises" },
  { Icon: Truck,   label: "Doorstep Delivery", desc: "Bulk orders delivered directly to your location"     },
];

const perks = [
  "Competitive wholesale pricing on all mobile brands",
  "Flexible payment terms for registered businesses",
  "Dedicated account manager for B2B clients",
  "Priority support & after-sales service",
  "Bulk accessories & screen protector deals",
  "Custom branding & bundling options available",
];

const mobileBrands  = ["Apple", "Samsung", "Xiaomi / Redmi", "Google Pixel", "Motorola", "Vivo", "Sony", "Realme", "Nokia", "Itel"];
const accessoryBrands = ["Stuffcool", "Spigen", "Portronics", "Boat", "Bose", "Ambrane", "Membrane", "Lito", "Neopack"];

type SubmitState = "idle" | "submitting" | "success" | "error";

export default function B2B() {
  const [, setLocation] = useLocation();
  const [submitState, setSubmitState] = useState<SubmitState>("idle");

  const form = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
    defaultValues: { name: "", company: "", phone: "", email: "", brandsInterested: "", message: "" },
  });

  const openMailto = (data: InquiryForm) => {
    const subject = encodeURIComponent(`B2B Inquiry from ${data.company}`);
    const body = encodeURIComponent(
      `Name: ${data.name}\nCompany: ${data.company}\nPhone: ${data.phone}\nEmail: ${data.email}\nBrands Interested: ${data.brandsInterested}\n\nMessage:\n${data.message}`
    );
    window.open(`mailto:hirji.newabrakadabra@gmail.com?subject=${subject}&body=${body}`, "_blank");
  };

  const onSubmit = async (data: InquiryForm) => {
    setSubmitState("submitting");
    // Always open mail app with all data pre-filled
    openMailto(data);
    // Also save to DB silently in background
    try {
      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } catch {
      // Ignore — mail app is already open
    }
    setSubmitState("success");
    form.reset();
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-20 overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0" style={{ background: "radial-gradient(ellipse 60% 30% at 50% 0%, hsl(45 75% 50% / 0.12) 0%, transparent 65%)" }} />

      <div className="relative max-w-2xl mx-auto px-4 pt-14">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-5" style={{ background: "linear-gradient(135deg,hsl(45 75% 18%),hsl(45 75% 28%))" }}>
            <Briefcase className="w-6 h-6 text-[hsl(45_75%_62%)]" />
          </div>
          <p className="text-xs tracking-[0.3em] uppercase text-[hsl(45_75%_50%)] mb-3">Wholesale &amp; Corporate</p>
          <h1 className="text-4xl font-serif font-bold gold-text">Bulk B2B Deals</h1>
          <div className="mt-4 h-px w-24 mx-auto" style={{ background: "linear-gradient(90deg, transparent, hsl(45 75% 50% / 0.6), transparent)" }} />
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
            We supply mobiles and accessories in bulk to businesses, corporates, schools, and resellers across Mumbai. Get the best wholesale rates with dedicated support.
          </p>
        </div>

        {/* Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {highlights.map(({ Icon, label, desc }) => (
            <div key={label} className="gold-border-glow bg-card rounded-2xl p-5 text-center flex flex-col items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg,hsl(45 75% 14%),hsl(45 75% 24%))" }}>
                <Icon className="w-5 h-5 text-[hsl(45_75%_62%)]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Perks */}
        <div className="gold-border-glow bg-card rounded-2xl p-6 mb-8">
          <h2 className="text-base font-serif font-semibold text-[hsl(45_75%_70%)] mb-4">Why Buy From Us?</h2>
          <ul className="flex flex-col gap-3">
            {perks.map((p) => (
              <li key={p} className="flex items-start gap-3 text-sm text-foreground">
                <CheckCircle className="w-4 h-4 text-[hsl(45_75%_50%)] flex-shrink-0 mt-0.5" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Brand chips */}
        <div className="mb-10">
          {[{ title: "Mobile Brands", list: mobileBrands }, { title: "Accessories & Screen Protectors", list: accessoryBrands }].map(({ title, list }) => (
            <div key={title} className="mb-6">
              <h2 className="text-sm font-semibold text-[hsl(45_75%_62%)] mb-3 flex items-center gap-2">
                <span className="h-px flex-1" style={{ background: "hsl(45 75% 50% / 0.3)" }} />
                {title}
                <span className="h-px flex-1" style={{ background: "hsl(45 75% 50% / 0.3)" }} />
              </h2>
              <div className="flex flex-wrap gap-2 justify-center">
                {list.map((b) => (
                  <span key={b} className="text-xs font-medium px-3 py-1.5 rounded-full" style={{ background: "hsl(45 75% 50% / 0.08)", border: "1px solid hsl(45 75% 50% / 0.22)", color: "hsl(45 60% 78%)" }}>
                    {b}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* ── Inquiry Form ── */}
        <div className="rounded-3xl p-px mb-6" style={{ background: "linear-gradient(135deg,#b8942a,#fde68a,#b8942a)" }}>
          <div className="bg-card rounded-3xl p-7">
            <h3 className="text-xl font-serif font-semibold text-foreground mb-1">Send an Enquiry</h3>
            <p className="text-sm text-muted-foreground mb-6">Fill in your details and we will get back to you within a few hours.</p>

            {submitState === "success" ? (
              <div className="flex flex-col items-center gap-4 py-8 text-center">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: "hsl(45 75% 50% / 0.15)" }}>
                  <CheckCircle className="w-7 h-7 text-[hsl(45_75%_62%)]" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">Enquiry Received!</p>
                  <p className="text-sm text-muted-foreground mt-1">We will contact you shortly on the details provided.</p>
                </div>
                <button
                  onClick={() => setSubmitState("idle")}
                  className="text-sm text-[hsl(45_75%_62%)] hover:underline mt-2"
                >
                  Send another enquiry
                </button>
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="name" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">Your Name</FormLabel>
                        <FormControl>
                          <Input data-testid="input-name" placeholder="Harish Patel" className="bg-background border-[hsl(45_20%_22%)] focus:border-[hsl(45_75%_50%)] focus:ring-[hsl(45_75%_50%_/_0.2)]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="company" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">Company / Shop Name</FormLabel>
                        <FormControl>
                          <Input data-testid="input-company" placeholder="ABC Mobiles" className="bg-background border-[hsl(45_20%_22%)] focus:border-[hsl(45_75%_50%)] focus:ring-[hsl(45_75%_50%_/_0.2)]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField control={form.control} name="phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">Phone / WhatsApp</FormLabel>
                        <FormControl>
                          <Input data-testid="input-phone" placeholder="+91 98765 43210" type="tel" className="bg-background border-[hsl(45_20%_22%)] focus:border-[hsl(45_75%_50%)]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="email" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">Email</FormLabel>
                        <FormControl>
                          <Input data-testid="input-email" placeholder="you@company.com" type="email" className="bg-background border-[hsl(45_20%_22%)] focus:border-[hsl(45_75%_50%)]" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <FormField control={form.control} name="brandsInterested" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">Brands / Products Interested In</FormLabel>
                      <FormControl>
                        <Input data-testid="input-brands" placeholder="e.g. Samsung, Apple, Boat earphones..." className="bg-background border-[hsl(45_20%_22%)] focus:border-[hsl(45_75%_50%)]" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )} />

                  <FormField control={form.control} name="message" render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground uppercase tracking-wider">Message / Requirements</FormLabel>
                      <FormControl>
                        <Textarea
                          data-testid="input-message"
                          placeholder="Tell us about your quantity requirements, budget, delivery location..."
                          rows={4}
                          className="bg-background border-[hsl(45_20%_22%)] focus:border-[hsl(45_75%_50%)] resize-none"
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                              form.handleSubmit(onSubmit)();
                            }
                          }}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                      <p className="text-[11px] text-muted-foreground mt-1">Press Ctrl+Enter to send</p>
                    </FormItem>
                  )} />

                  <button
                    type="submit"
                    data-testid="button-submit-inquiry"
                    disabled={submitState === "submitting"}
                    className="flex items-center justify-center gap-2 rounded-xl px-8 py-4 font-semibold text-sm transition-opacity hover:opacity-90 disabled:opacity-60"
                    style={{ background: "linear-gradient(135deg,#b8942a 0%,#f0c040 50%,#b8942a 100%)", color: "#0f0f0f" }}
                  >
                    {submitState === "submitting" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Sending…</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Enquiry</>
                    )}
                  </button>
                </form>
              </Form>
            )}
          </div>
        </div>

        {/* Quick contact options */}
        <div className="flex flex-col gap-3 mb-8">
          <a
            href="https://wa.me/919892139878?text=Hi%2C%20I%20am%20interested%20in%20bulk%20B2B%20deals"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="link-b2b-whatsapp"
            className="flex items-center justify-center gap-2 gold-border-glow rounded-xl px-6 py-3.5 text-sm font-medium text-[hsl(45_75%_62%)] hover:text-[hsl(45_75%_75%)] transition-colors"
          >
            <SiWhatsapp className="w-4 h-4" />
            Or WhatsApp us directly
          </a>
          <a
            href="tel:+919892139878"
            data-testid="link-b2b-call"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-[hsl(45_75%_50%)] transition-colors"
          >
            <Phone className="w-4 h-4" />
            +91 9892139878
          </a>
          <a
            href="mailto:hirji.newabrakadabra@gmail.com?subject=B2B Bulk Order Enquiry"
            data-testid="link-b2b-email"
            className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-[hsl(45_75%_50%)] transition-colors"
          >
            <Mail className="w-4 h-4" />
            hirji.newabrakadabra@gmail.com
          </a>
        </div>

        <button
          onClick={() => setLocation("/contact")}
          data-testid="link-b2b-full-contact"
          className="w-full flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-[hsl(45_75%_50%)] transition-colors"
        >
          View all contact details <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
