
import {
  Truck,
  ShieldCheck,
  Headphones,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Fast Delivery",
    description:
      "Get your electrical essentials delivered conveniently to your doorstep.",
    color: "bg-sky-100 text-sky-600",
  },
  {
    icon: ShieldCheck,
    title: "Secure Shopping",
    description:
      "Enjoy a secure shopping experience from browsing to checkout.",
    color: "bg-emerald-100 text-emerald-600",
  },
  {
    icon: Headphones,
    title: "Customer Support",
    description:
      "Need help choosing a product? Our support team is here to help.",
    color: "bg-violet-100 text-violet-600",
  },
  {
    icon: RotateCcw,
    title: "Easy Returns",
    description:
      "Get assistance with eligible returns according to our return policy.",
    color: "bg-amber-100 text-amber-600",
  },
];

const Features = () => {
  return (
    <section className="border-y border-slate-200 bg-white py-12 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <div className="mb-8 text-center">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#087EBC]">
            Why Choose Us?
          </p>

          <h2 className="mt-2 text-2xl font-extrabold text-[#142D4E] sm:text-3xl">
            Shopping Made Simple
          </h2>

          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
            We make it easier to find the electrical products and appliances
            you need for your home and business.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="group rounded-2xl border border-slate-100 bg-[#FAF7F2]/50 p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:bg-white hover:shadow-lg"
              >
                <div
                  className={`mb-5 flex h-14 w-14 items-center justify-center rounded-2xl transition duration-300 group-hover:scale-110 ${feature.color}`}
                >
                  <Icon size={28} strokeWidth={1.8} />
                </div>

                <h3 className="text-lg font-bold text-[#142D4E]">
                  {feature.title}
                </h3>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>

                <div className="mt-5 flex items-center gap-2 text-xs font-bold text-[#087EBC]">
                  ElectroStore
                  <ArrowRight
                    size={15}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
