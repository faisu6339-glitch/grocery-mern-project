
import { Link } from "react-router-dom";
import {
  Cable,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

const cableProducts = [
  {
    name: "House Wiring Cables",
    description: "Wiring solutions for homes and apartments.",
    icon: Cable,
    color: "bg-sky-100 text-sky-700",
    subcategory: "House Wiring Cables",
    featured: true,
  },
  {
    name: "Power Cables",
    description: "Power distribution for electrical installations.",
    icon: Zap,
    color: "bg-amber-100 text-amber-700",
    subcategory: "Power Cables",
    featured: false,
  },
  {
    name: "Industrial Cables",
    description: "Cable options for demanding project environments.",
    icon: ShieldCheck,
    color: "bg-emerald-100 text-emerald-700",
    subcategory: "Industrial Cables",
    featured: false,
  },
];

const categoryUrl = (subcategory?: string) => {
  const params = new URLSearchParams();

  params.set("category", "Cables & Wires");

  if (subcategory) {
    params.set("subcategory", subcategory);
  }

  return `/products?${params.toString()}`;
};

const SpecialCables = () => {
  return (
    <section className="bg-white py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Introduction */}
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#087EBC]">
              <Cable size={15} />
              Cable Collection
            </span>

            <h2 className="mt-4 text-3xl font-extrabold leading-tight text-[#142D4E] sm:text-4xl">
              Special Cables for Every Electrical Project
            </h2>

            <p className="mt-4 max-w-xl leading-7 text-slate-600">
              Explore cable options for residential wiring, commercial
              installations, and industrial electrical applications. Find
              products suited to your project's specifications.
            </p>

            <ul className="mt-6 space-y-3">
              {[
                "Options for residential and commercial wiring",
                "Products for different electrical applications",
                "Specifications to help you choose the right cable",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-slate-600"
                >
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-emerald-600"
                  />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              to={categoryUrl()}
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-[#087EBC] px-6 py-3 font-bold text-white transition hover:bg-[#06699D]"
            >
              Explore Cables
              <ArrowRight size={18} />
            </Link>
          </div>

          {/* Clickable cable categories */}
          <div className="grid gap-4 sm:grid-cols-2">
            {cableProducts.map((product) => {
              const Icon = product.icon;

              return (
                <Link
                  key={product.name}
                  to={categoryUrl(product.subcategory)}
                  className={`group rounded-2xl border border-slate-200 bg-[#FAF7F2] p-5 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg ${
                    product.featured ? "sm:col-span-2" : ""
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${product.color}`}
                  >
                    <Icon size={25} />
                  </div>

                  <h3 className="mt-4 font-bold text-[#142D4E] transition group-hover:text-[#087EBC]">
                    {product.name}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    {product.description}
                  </p>

                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#087EBC]">
                    Browse products
                    <ArrowRight
                      size={16}
                      className="transition group-hover:translate-x-1"
                    />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialCables;
