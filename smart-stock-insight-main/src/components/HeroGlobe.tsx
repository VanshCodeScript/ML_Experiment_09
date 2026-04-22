import { useEffect, useRef } from "react";

type GlobeCountryPoint = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  clanCount: number;
};

type GlobeElement = GlobeCountryPoint | { type: "label"; label: string; lat: number; lng: number };

const SCRIPT_URLS = [
  "https://unpkg.com/three",
  "https://unpkg.com/globe.gl",
] as const;

const scriptCache = new Map<string, Promise<void>>();

const COUNTRY_POINTS: GlobeCountryPoint[] = [
  { id: "india", name: "India", lat: 20.59, lng: 78.96, clanCount: 132 },
  { id: "usa", name: "USA", lat: 39.82, lng: -98.57, clanCount: 98 },
  { id: "uk", name: "United Kingdom", lat: 55.37, lng: -3.43, clanCount: 76 },
  { id: "brazil", name: "Brazil", lat: -14.23, lng: -51.92, clanCount: 66 },
  { id: "uae", name: "UAE", lat: 23.42, lng: 53.85, clanCount: 54 },
  { id: "japan", name: "Japan", lat: 36.2, lng: 138.25, clanCount: 62 },
];

const FLAG_BY_ID: Record<string, string> = {
  india: "IN",
  usa: "US",
  uk: "UK",
  brazil: "BR",
  uae: "AE",
  japan: "JP",
};

const loadScript = (url: string): Promise<void> => {
  const cached = scriptCache.get(url);
  if (cached) return cached;

  const promise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector(`script[data-hero-globe-src=\"${url}\"]`) as HTMLScriptElement | null;
    if (existing) {
      if (existing.dataset.loaded === "true") {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error(`Failed to load ${url}`)), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.dataset.heroGlobeSrc = url;
    script.dataset.loaded = "false";
    script.onload = () => {
      script.dataset.loaded = "true";
      resolve();
    };
    script.onerror = () => reject(new Error(`Failed to load ${url}`));
    document.body.appendChild(script);
  });

  scriptCache.set(url, promise);
  return promise;
};

const HeroGlobe = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let mounted = true;
    let resizeHandler: (() => void) | null = null;

    const run = async () => {
      try {
        await Promise.all(SCRIPT_URLS.map((src) => loadScript(src)));
        if (!mounted || !containerRef.current) return;

        const GlobeCtor = (window as any).Globe;
        if (!GlobeCtor) return;

        const mapLabels: GlobeElement[] = [
          { type: "label", label: "North Atlantic Ocean", lat: 27, lng: -35 },
          { type: "label", label: "Indian Ocean", lat: -16, lng: 74 },
          { type: "label", label: "Russia", lat: 57, lng: 80 },
          { type: "label", label: "Brazil", lat: -10, lng: -52 },
        ];

        const markerData: GlobeElement[] = [...COUNTRY_POINTS, ...mapLabels];
        const origin = COUNTRY_POINTS[0];
        const arcData = COUNTRY_POINTS.slice(1).map((item) => ({
          startLat: origin.lat,
          startLng: origin.lng,
          endLat: item.lat,
          endLng: item.lng,
          color: ["rgba(56, 189, 248, 0.85)", "rgba(244, 114, 182, 0.9)"],
        }));

        const globe = GlobeCtor()(containerRef.current)
          .backgroundColor("rgba(0,0,0,0)")
          .showAtmosphere(true)
          .atmosphereColor("#99b9ff")
          .atmosphereAltitude(0.2)
          .globeImageUrl("https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
          .bumpImageUrl("https://unpkg.com/three-globe/example/img/earth-topology.png")
          .arcColor("color")
          .arcDashLength(0.45)
          .arcDashGap(0.9)
          .arcDashAnimateTime(2400)
          .arcsData(arcData)
          .ringsData(COUNTRY_POINTS.map((country) => ({ ...country, altitude: 0.01, radius: 0.6 })))
          .ringColor(() => "rgba(251,146,60,0.9)")
          .ringMaxRadius("radius")
          .ringPropagationSpeed(() => 1.2)
          .ringRepeatPeriod(() => 1400)
          .ringAltitude("altitude")
          .htmlElementsData(markerData)
          .htmlElement((item: GlobeElement) => {
            if ("type" in item && item.type === "label") {
              const label = document.createElement("div");
              label.className = "hero-globe-label";
              label.textContent = item.label;
              return label;
            }

            const marker = document.createElement("div");
            marker.className = "hero-globe-marker";

            const flag = document.createElement("div");
            flag.className = "hero-globe-flag";
            flag.textContent = FLAG_BY_ID[item.id] || "--";

            const bubble = document.createElement("div");
            bubble.className = "hero-globe-bubble";
            bubble.textContent = String(item.clanCount);

            marker.appendChild(flag);
            marker.appendChild(bubble);
            return marker;
          })
          .htmlLat((item: GlobeElement) => item.lat)
          .htmlLng((item: GlobeElement) => item.lng)
          .htmlAltitude((item: GlobeElement) => (("type" in item && item.type === "label") ? 0.01 : 0.03))
          .pointOfView({ lat: 18, lng: 10, altitude: 1.78 }, 0);

        const controls = globe.controls();
        controls.autoRotate = true;
        controls.autoRotateSpeed = 0.45;
        controls.enablePan = false;

        resizeHandler = () => {
          if (!containerRef.current) return;
          globe.width(containerRef.current.clientWidth);
          globe.height(containerRef.current.clientHeight);
        };

        resizeHandler();
        window.addEventListener("resize", resizeHandler);
      } catch {
        // Ignore script loading failures to keep landing page usable.
      }
    };

    run();

    return () => {
      mounted = false;
      if (resizeHandler) window.removeEventListener("resize", resizeHandler);
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  return <div ref={containerRef} className="h-full w-full" />;
};

export default HeroGlobe;
