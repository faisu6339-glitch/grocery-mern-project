
import { Link } from "react-router-dom";
import {
  ArrowRight,
  Drill,
  Hammer,
  Wrench,
  Settings,
  Zap,
  ShieldCheck,
} from "lucide-react";

const toolCategories = [
  {
    title: "Power Drills",
    description: "Drilling tools for home and professional projects.",
    icon: Drill,
    query: "power drills",
    badge: "Popular",
  },
  {
    title: "Angle Grinders",
    description: "Reliable tools for cutting, grinding, and polishing.",
    icon: Settings,
    query: "angle grinders",
    badge: "Professional",
  },
  {
    title: "Hand Tools",
    description: "Essential tools for everyday electrical work.",
    icon: Wrench,
    query: "hand tools",
    badge: "Essential",
  },
  {
    title: "Hammers & Accessories",
    description: "Workshop essentials for repair and installation.",
    icon: Hammer,
    query: "hammers and tool accessories",
    badge: "Workshop",
  },
];

const PowerTools = () => {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#087EBC]">
              <Zap size={14} />
              Built for Every Job
            </span>

            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#142D4E] sm:text-3xl lg:text-4xl">
              Power & Hand Tools
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600 sm:text-base">
              Discover practical tools for electrical installation,
              maintenance, workshops, and DIY projects.
            </p>
          </div>

          <Link
            to="/products?category=Power%20%26%20Hand%20Tools"
            className="inline-flex w-fit items-center gap-2 font-semibold text-[#087EBC] transition hover:text-[#142D4E]"
          >
            Explore all tools
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Promotional banner */}
        <div className="relative mb-8 overflow-hidden rounded-2xl bg-[#142D4E] p-6 sm:p-8 lg:p-10">
          <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-[#087EBC]/30 blur-2xl" />
          <div className="absolute -bottom-20 right-1/3 h-40 w-40 rounded-full bg-amber-400/20 blur-2xl" />

          <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-amber-400">
                Workshop Essentials
              </span>

              <h3 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
                The right tool for every task.
              </h3>

              <p className="mt-3 text-sm leading-6 text-blue-100 sm:text-base">
                Find tools and accessories for installation, repairs,
                maintenance, and professional projects.
              </p>

              <Link
                to="/products?category=Power%20%26%20Hand%20Tools"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-[#142D4E] transition hover:bg-amber-300"
              >
                Shop Tools
                <ArrowRight size={17} />
              </Link>
            </div>

            <div className="hidden h-36 w-36 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 md:flex">
              <Drill size={76} strokeWidth={1.3} className="text-amber-400" />
            </div>
          </div>
        </div>

        {/* Tool category cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {toolCategories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
                key={category.title}
                to={`/search?q=${encodeURIComponent(category.query)}`}
                className="group rounded-2xl border border-gray-200 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-[#087EBC]/40 hover:shadow-lg"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-blue-50 text-[#087EBC] transition group-hover:bg-[#087EBC] group-hover:text-white">
                    <Icon size={28} strokeWidth={1.7} />
                  </div>

                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                    {category.badge}
                  </span>
                </div>

                <h3 className="mt-5 font-bold text-[#142D4E] transition group-hover:text-[#087EBC]">
                  {category.title}
                </h3>

                <p className="mt-2 min-h-12 text-sm leading-6 text-gray-500">
                  {category.description}
                </p>

                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#087EBC]">
                  Browse category
                  <ArrowRight
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </span>
              </Link>
            );
          })}
        </div>

        {/* Trust note */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 border-t border-gray-100 pt-6 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#087EBC]" />
            Quality-focused selection
          </span>
          <span className="flex items-center gap-2">
            <Wrench size={18} className="text-[#087EBC]" />
            For DIY and professional use
          </span>
        </div>
      </div>
    </section>
  );
};

export default PowerTools;
