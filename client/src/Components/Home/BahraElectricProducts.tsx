
import { Link } from "react-router-dom";
import {
  Cable,
  Factory,
  ShieldCheck,
  ArrowRight,
  Zap,
} from "lucide-react";

const products = [
  {
    title: "Power Cables",
    description: "Browse cable options for power distribution.",
    icon: Zap,
    query: "Bahra Electric power cables",
  },
  {
    title: "Building Wires",
    description: "Explore wiring options for building installations.",
    icon: Cable,
    query: "Bahra Electric building wires",
  },
  {
    title: "Industrial Solutions",
    description: "Find cable products for industrial applications.",
    icon: Factory,
    query: "Bahra Electric industrial cables",
  },
];

const BahraElectricProducts = () => {
  return (
    <section className="bg-[#FAF7F2] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl bg-[#142D4E] shadow-xl">
          <div className="grid lg:grid-cols-2">
            {/* Brand introduction */}
            <div className="p-7 text-white sm:p-10 lg:p-12">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-sky-200">
                <ShieldCheck size={15} />
                Brand Collection
              </span>

              <h2 className="mt-5 text-3xl font-extrabold leading-tight sm:text-4xl">
                Explore Bahra Electric Products
              </h2>

              <p className="mt-4 max-w-lg leading-7 text-slate-300">
                Discover electrical cable and wiring product options for
                building, commercial, and industrial applications. Browse
                available products and compare their specifications.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  to="/search?q=Bahra%20Electric"
                  className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-3 font-bold text-[#142D4E] transition hover:bg-amber-300"
                >
                  Explore Collection
                  <ArrowRight size={18} />
                </Link>

                <Link
                  to="/bulk-quote"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/30 px-5 py-3 font-bold text-white transition hover:bg-white/10"
                >
                  Request a Quote
                </Link>
              </div>
            </div>

            {/* Product links */}
            <div className="grid content-center gap-4 bg-white p-6 sm:p-8">
              {products.map((product) => {
                const Icon = product.icon;

                return (
                  <Link
                    key={product.title}
                    to={`/search?q=${encodeURIComponent(product.query)}`}
                    className="group flex items-center gap-4 rounded-2xl border border-slate-200 p-4 transition hover:border-sky-300 hover:bg-sky-50"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-[#087EBC]">
                      <Icon size={25} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-[#142D4E]">
                        {product.title}
                      </h3>

                      <p className="mt-1 text-sm leading-5 text-slate-500">
                        {product.description}
                      </p>
                    </div>

                    <ArrowRight
                      size={19}
                      className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#087EBC]"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BahraElectricProducts;
