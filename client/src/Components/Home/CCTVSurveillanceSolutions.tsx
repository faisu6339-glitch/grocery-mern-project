
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Camera,
  ShieldCheck,
  Eye,
  Video,
  LockKeyhole,
  Wifi,
  HardDrive,
} from "lucide-react";

const surveillanceProducts = [
  {
    title: "Security Cameras",
    description: "Explore cameras for indoor and outdoor monitoring.",
    icon: Camera,
    query: "security cameras",
  },
  {
    title: "CCTV Systems",
    description: "Discover camera systems for homes and businesses.",
    icon: Video,
    query: "CCTV systems",
  },
  {
    title: "Network Cameras",
    description: "Explore IP cameras and network surveillance options.",
    icon: Wifi,
    query: "IP network cameras",
  },
  {
    title: "Recording & Storage",
    description: "Find compatible recording devices and storage options.",
    icon: HardDrive,
    query: "CCTV DVR NVR storage",
  },
];

const CCTVSurveillanceSolutions = () => {
  return (
    <section className="bg-[#FAF7F2] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#087EBC]">
              <ShieldCheck size={14} />
              Security & Monitoring
            </span>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#142D4E] sm:text-3xl lg:text-4xl">
              CCTV & Surveillance Solutions
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Explore surveillance equipment for residential,
              commercial, and office security needs.
            </p>
          </div>

          <Link
            to="/products?category=CCTV%20%26%20Surveillance"
            className="inline-flex w-fit items-center gap-2 font-semibold text-[#087EBC] transition hover:text-[#142D4E]"
          >
            View all solutions
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Security banner */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-[#102440] via-[#142D4E] to-[#075985] p-6 sm:p-8 lg:p-10">
          <div className="absolute -right-8 -top-12 h-60 w-60 rounded-full border border-white/10" />
          <div className="absolute -right-2 -top-6 h-48 w-48 rounded-full border border-white/10" />
          <div className="absolute bottom-0 right-1/4 h-32 w-32 rounded-full bg-sky-400/10 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-sky-300">
                Smart Security
              </span>

              <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                Stay connected. Stay protected.
              </h3>

              <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
                Browse surveillance cameras, recording systems, and
                accessories to build a security setup that fits your needs.
              </p>

              <Link
                to="/products?category=CCTV%20%26%20Surveillance"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-[#142D4E] transition hover:bg-sky-100"
              >
                Explore Security Products
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 md:flex">
              <Camera size={74} strokeWidth={1.3} className="text-sky-300" />
            </div>
          </div>
        </div>

        {/* Product categories */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {surveillanceProducts.map((product) => {
            const Icon = product.icon;

            return (
              <Link
                key={product.title}
                to={`/search?q=${encodeURIComponent(product.query)}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#087EBC]/40 hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-[#087EBC] transition group-hover:bg-[#087EBC] group-hover:text-white">
                  <Icon size={28} strokeWidth={1.7} />
                </div>

                <h3 className="mt-5 font-bold text-[#142D4E] transition group-hover:text-[#087EBC]">
                  {product.title}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                  {product.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#087EBC]">
                  Explore products
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Benefits */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <ShieldCheck size={24} className="shrink-0 text-[#087EBC]" />
            <div>
              <h4 className="text-sm font-bold text-[#142D4E]">
                Security-focused selection
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                Products for different monitoring needs
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <Eye size={24} className="shrink-0 text-[#087EBC]" />
            <div>
              <h4 className="text-sm font-bold text-[#142D4E]">
                Indoor & outdoor options
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                Browse equipment for different environments
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4">
            <LockKeyhole size={24} className="shrink-0 text-[#087EBC]" />
            <div>
              <h4 className="text-sm font-bold text-[#142D4E]">
                Choose compatible systems
              </h4>
              <p className="mt-1 text-xs text-gray-500">
                Check compatibility before purchasing
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CCTVSurveillanceSolutions;
