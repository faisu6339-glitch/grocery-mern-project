
import React from "react";
import { Link } from "react-router-dom";
import {
  Lightbulb,
  Plug,
  Cable,
  Fan,
  Refrigerator,
  Microwave,
  WashingMachine,
  Tv,
  ArrowRight,
  Zap,
  ShieldCheck,
} from "lucide-react";

const categories = [
  {
    name: "Lighting",
    description: "LED bulbs, panels & lights",
    icon: Lightbulb,
    color: "bg-amber-100 text-amber-600",
    query: "lighting",
  },
  {
    name: "Switches & Sockets",
    description: "Modern switches & sockets",
    icon: Plug,
    color: "bg-sky-100 text-sky-600",
    query: "switches",
  },
  {
    name: "Cables & Wires",
    description: "Reliable electrical wiring",
    icon: Cable,
    color: "bg-rose-100 text-rose-600",
    query: "cables",
  },
  {
    name: "Fans",
    description: "Ceiling, table & exhaust fans",
    icon: Fan,
    color: "bg-emerald-100 text-emerald-600",
    query: "fans",
  },
  {
    name: "Refrigerators",
    description: "Keep food fresh for longer",
    icon: Refrigerator,
    color: "bg-indigo-100 text-indigo-600",
    query: "refrigerators",
  },
  {
    name: "Kitchen Appliances",
    description: "Microwaves & cooking essentials",
    icon: Microwave,
    color: "bg-orange-100 text-orange-600",
    query: "kitchen appliances",
  },
  {
    name: "Washing Machines",
    description: "Smart and efficient laundry",
    icon: WashingMachine,
    color: "bg-cyan-100 text-cyan-600",
    query: "washing machines",
  },
  {
    name: "Televisions",
    description: "Upgrade your entertainment",
    icon: Tv,
    color: "bg-violet-100 text-violet-600",
    query: "televisions",
  },
];

const HomeCategory: React.FC = () => {
  return (
    <section className="bg-[#FAF7F2] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-10 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#087EBC]">
              <Zap size={14} />
              Explore our collection
            </span>

            <h2 className="text-2xl font-extrabold tracking-tight text-[#142D4E] sm:text-3xl lg:text-4xl">
              Shop by Category
            </h2>

            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Discover quality electrical products and home appliances for
              every room, project, and everyday need.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex w-fit items-center gap-2 font-bold text-[#087EBC] transition hover:gap-3"
          >
            View all products
            <ArrowRight size={18} />
          </Link>
        </div>

        {/* Category grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = category.icon;

            return (
              <Link
  key={category.name}
  to={`/products?category=${encodeURIComponent(category.name)}`}
  className="group rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg sm:p-6"
>
                <div className="mb-5 flex items-start justify-between">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition duration-300 group-hover:scale-110 sm:h-14 sm:w-14 ${category.color}`}
                  >
                    <Icon size={27} strokeWidth={1.8} />
                  </div>

                  <ArrowRight
                    size={18}
                    className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-[#087EBC]"
                  />
                </div>

                <h3 className="text-sm font-bold leading-5 text-[#142D4E] transition group-hover:text-[#087EBC] sm:text-base">
                  {category.name}
                </h3>

                <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                  {category.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Trust strip */}
        <div className="mt-10 flex flex-col gap-4 rounded-2xl bg-[#142D4E] p-5 text-white sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/10">
              <ShieldCheck size={27} className="text-emerald-300" />
            </div>

            <div>
              <h3 className="font-bold sm:text-lg">
                Quality you can depend on
              </h3>
              <p className="mt-1 text-xs text-slate-300 sm:text-sm">
                Explore electrical essentials for your home and business.
              </p>
            </div>
          </div>

          <Link
            to="/deals"
            className="inline-flex w-fit items-center gap-2 rounded-lg bg-amber-400 px-5 py-3 text-sm font-bold text-[#142D4E] transition hover:bg-amber-300"
          >
            Explore deals
            <ArrowRight size={17} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomeCategory;
