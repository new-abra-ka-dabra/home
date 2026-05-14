import { useState, useEffect } from "react";
import { X, ZoomIn, AlertCircle } from "lucide-react";

interface GithubFile {
  name: string;
  download_url: string;
  type: string;
}

const IMAGE_EXTS = /\.(png|jpe?g|gif|webp|svg)$/i;
const REPO_API = "https://api.github.com/repos/new-abra-ka-dabra/home/contents/gallery/";

// Recursively collect image URLs from a GitHub contents API path
function formatName(filename: string): string {
  return filename
    .replace(/\.[a-zA-Z0-9]+$/, "")   // strip any extension
    .replace(/[-_]/g, " ")             // hyphens/underscores → spaces
    .replace(/([a-z])([A-Z])/g, "$1 $2") // camelCase → spaces
    .replace(/\s+/g, " ")              // collapse multiple spaces
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase()); // Title Case
}

async function fetchImages(path = ""): Promise<{ name: string; url: string }[]> {
  const res = await fetch(`${REPO_API}${path}`);
  if (!res.ok) return [];
  const files: GithubFile[] = await res.json();
  const results: { name: string; url: string }[] = [];

  await Promise.all(
    files.map(async (f) => {
      if (f.type === "file" && IMAGE_EXTS.test(f.name) && f.download_url) {
        if (!f.name.includes("generated-icon")) {
          results.push({ name: formatName(f.name), url: f.download_url });
        }
      } else if (
        f.type === "dir" &&
        !["node_modules", ".github", "dist"].includes(f.name)
      ) {
        const sub = await fetchImages(f.name + "/");
        results.push(...sub);
      }
    })
  );
  return results;
}

export default function Gallery() {
  const [images, setImages] = useState<{ name: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    fetchImages()
      .then((imgs) => {
        setImages(imgs);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      {/* Glow */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 30% at 50% 0%, hsl(45 75% 50% / 0.10) 0%, transparent 65%)",
        }}
      />

      {/* Header */}
      <div className="relative text-center pt-14 pb-8 px-4">
        <p className="text-xs tracking-[0.3em] uppercase text-[hsl(45_75%_50%)] mb-3">Our Shop</p>
        <h1 className="text-4xl font-serif font-bold gold-text">Gallery</h1>
        <div
          className="mt-4 h-px w-24 mx-auto"
          style={{
            background: "linear-gradient(90deg, transparent, hsl(45 75% 50% / 0.6), transparent)",
          }}
        />
        <p className="mt-4 text-sm text-muted-foreground">
          A glimpse inside New Abra Ka Dabra
        </p>
      </div>

      {/* States */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div
            className="w-10 h-10 rounded-full border-2 border-transparent animate-spin"
            style={{ borderTopColor: "hsl(45 75% 50%)" }}
          />
          <p className="text-sm text-muted-foreground">Loading gallery…</p>
        </div>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <AlertCircle className="w-8 h-8" />
          <p className="text-sm">Could not load gallery. Please try again later.</p>
        </div>
      )}

      {!loading && !error && images.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
          <p className="text-sm">No images found in the gallery yet.</p>
        </div>
      )}

      {/* Image grid */}
      {!loading && images.length > 0 && (
        <div className="px-4 max-w-4xl mx-auto">
          <div className="columns-2 sm:columns-3 gap-4 space-y-4">
            {images.map(({ name, url }, i) => (
              <div
                key={url}
                data-testid={`gallery-img-${i}`}
                className="break-inside-avoid group animate-scale-in mb-4"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* Image */}
                <div
                  className="relative overflow-hidden rounded-xl cursor-zoom-in"
                  style={{ border: "1px solid hsl(45 75% 50% / 0.2)" }}
                  onClick={() => setLightbox(url)}
                >
                  <img
                    src={url}
                    alt={name}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  {/* Zoom hint on hover */}
                  <div
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{ background: "hsl(0 0% 0% / 0.3)" }}
                  >
                    <ZoomIn className="w-6 h-6 text-[hsl(45_75%_80%)]" />
                  </div>
                </div>

                {/* Always-visible caption — only when name has at least one letter */}
                {/[a-zA-Z]/.test(name) && (
                  <p
                    data-testid={`gallery-caption-${i}`}
                    className="mt-2 px-1 text-xs font-medium text-muted-foreground truncate"
                    title={name}
                  >
                    {name}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setLightbox(null)}
        >
          <button
            data-testid="button-lightbox-close"
            className="absolute top-4 right-4 w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "hsl(0 0% 15%)", border: "1px solid hsl(45 75% 50% / 0.3)" }}
            onClick={() => setLightbox(null)}
          >
            <X className="w-5 h-5 text-[hsl(45_75%_62%)]" />
          </button>
          <img
            src={lightbox}
            alt="Full size"
            className="max-w-full max-h-[90vh] rounded-2xl object-contain"
            style={{ boxShadow: "0 0 60px hsl(45 75% 50% / 0.2)" }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
