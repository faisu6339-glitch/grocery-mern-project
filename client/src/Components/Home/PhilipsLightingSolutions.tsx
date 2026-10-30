
import { Link } from "react-router-dom";
import {
  Lightbulb,
  House,
  Building2,
  Factory,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const lightingSolutions = [
  {
    title: "Residential Lighting",
    subtitle: "Comfort and ambience for your home",
    description:
      "Explore bulbs, ceiling lights, decorative lighting, and lighting options for everyday living.",
    icon: House,
    color: "bg-amber-100 text-amber-700",
    query: "Philips residential lighting",
  },
  {
    title: "Commercial Lighting",
    subtitle: "Lighting for offices and retail spaces",
    description:
      "Browse panel lights, downlights, and other options for offices, shops, and commercial interiors.",
    icon: Building2,
    color: "bg-sky-100 text-sky-700",
    query: "Philips commercial lighting",
  },
  {
    title: "Industrial Lighting",
    subtitle: "Solutions for industrial environments",
    description:
      "Explore lighting options for warehouses, workshops, and industrial facilities.",
    icon: Factory,
    color: "bg-emerald-100 text-emerald-700",
    query: "Philips industrial lighting",
  },
];

const PhilipsLightingSolutions = () => {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Lightbulb size={15} />
            Lighting Collection
          </span>

          <h2 className="mt-4 text-3xl font-extrabold leading-tight text-[#142D4E] sm:text-4xl">
            Philips Lighting Solutions for Residential, Commercial & Industrial Projects
          </h2>

          <p className="mt-4 leading-7 text-slate-600">
            Explore lighting products and options for different spaces,
            applications, and project requirements.
          </p>
        </div>

        {/* Solution cards */}
        <div className="grid gap-5 md:grid-cols-3">
          {lightingSolutions.map((solution) => {
            const Icon = solution.icon;

            return (
              <article
                key={solution.title}
                className="group flex flex-col rounded-2xl border border-slate-200 bg-[#FAF7F2] p-6 transition duration-300 hover:-translate-y-1 hover:border-amber-200 hover:bg-white hover:shadow-lg sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-2xl ${solution.color}`}
                  >
                    <Icon size={28} />
                  </div>

                  <Lightbulb
                    size={25}
                    className="text-slate-300 transition group-hover:text-amber-400"
                  />
                </div>

                <h3 className="mt-5 text-xl font-bold text-[#142D4E]">
                  {solution.title}
                </h3>

                <p className="mt-2 text-sm font-semibold text-[#087EBC]">
                  {solution.subtitle}
                </p>

                <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">
                  {solution.description}
                </p>

                <div className="mt-5 flex items-start gap-2 text-xs leading-5 text-slate-500">
                  <CheckCircle2
                    size={16}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  Select products according to your project requirements.
                </div>

                <Link
                  to={`/search?q=${encodeURIComponent(solution.query)}`}
                  className="mt-6 inline-flex items-center gap-2 font-bold text-[#087EBC] transition hover:gap-3"
                >
                  Explore Lighting
                  <ArrowRight size={17} />
                </Link>
              </article>
            );
          })}
        </div>

        {/* Project enquiry banner */}
        <div className="mt-8 flex flex-col gap-4 rounded-2xl bg-[#142D4E] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h3 className="text-xl font-bold text-white">
              Planning a lighting project?
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-300">
              Contact our team to discuss product availability and project
              requirements.
            </p>
          </div>

          <Link
            to="/bulk-quote"
            className="inline-flex w-fit shrink-0 items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-[#142D4E] transition hover:bg-amber-300"
          >
            Request a Quote
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default PhilipsLightingSolutions;
