
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  Plug,
  Cable,
  Lightbulb,
  Wrench,
  Settings,
  ShieldCheck,
  BriefcaseBusiness,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

type Category = {
  name: string;
  icon: LucideIcon;
  subcategories: string[];
};

const categories: Category[] = [
  {
    name: "Circuit Protection",
    icon: Zap,
    subcategories: [
      "MCB",
      "RCCB",
      "MCCB",
      "Distribution Boards",
    ],
  },
  {
    name: "Switches & Sockets",
    icon: Plug,
    subcategories: [
      "Modular Switches",
      "Socket Outlets",
      "Switch Plates",
    ],
  },
  {
    name: "Cables & Wires",
    icon: Cable,
    subcategories: [
      "House Wires",
      "Power Cables",
      "Flexible Cables",
    ],
  },
  {
    name: "Lighting",
    icon: Lightbulb,
    subcategories: [
      "LED Bulbs",
      "Panel Lights",
      "Flood Lights",
      "Street Lights",
      "Emergency Lights",
    ],
  },
  {
    name: "Conduits & Trunking",
    icon: Wrench,
    subcategories: [
      "PVC Conduits",
      "Cable Trunking",
      "Junction Boxes",
    ],
  },
  {
    name: "Industrial Control",
    icon: Settings,
    subcategories: [
      "Contactors",
      "Relays",
      "Motor Starters",
    ],
  },
  {
    name: "Safety & Security",
    icon: ShieldCheck,
    subcategories: [
      "Voltage Testers",
      "Safety Equipment",
      "CCTV",
    ],
  },
  {
    name: "Tools & Accessories",
    icon: BriefcaseBusiness,
    subcategories: [
      "Pliers",
      "Screwdrivers",
      "Wire Strippers",
      "Electrical Connectors",
    ],
  },
];

const ProductCategories = () => {
  const [activeCategory, setActiveCategory] = useState(
    categories.find((category) => category.name === "Lighting") ||
      categories[0]
  );

  const navigate = useNavigate();

  const openCategory = (categoryName: string) => {
    navigate(
      `/products?category=${encodeURIComponent(categoryName)}`
    );
  };

  const openSubcategory = (subcategory: string) => {
    navigate(
      `/products?category=${encodeURIComponent(
        activeCategory.name
      )}&subcategory=${encodeURIComponent(subcategory)}`
    );
  };

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 overflow-hidden rounded-xl border border-slate-100 bg-white md:grid-cols-[380px_minmax(0,1fr)] lg:grid-cols-[420px_minmax(0,1fr)]">

        {/* LEFT: PRODUCT CATEGORIES */}
        <div className="border-b border-slate-100 p-4 sm:p-6 md:border-b-0 md:border-r">
          <h2 className="mb-5 px-3 text-sm font-bold uppercase tracking-wide text-slate-400">
            Product Categories
          </h2>

          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              const isActive =
                activeCategory.name === category.name;

              return (
                <button
                  key={category.name}
                  type="button"
                  onClick={() => setActiveCategory(category)}
                  aria-pressed={isActive}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-4 text-left transition-colors ${
                    isActive
                      ? "bg-sky-50 font-semibold text-sky-600"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon
                    size={19}
                    className={
                      isActive
                        ? "shrink-0 text-sky-500"
                        : "shrink-0 text-slate-400"
                    }
                  />

                  <span className="flex-1 text-sm sm:text-base">
                    {category.name}
                  </span>

                  <ChevronRight
                    size={18}
                    className="shrink-0"
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT: SUBCATEGORIES */}
        <div className="p-5 sm:p-7 lg:p-8">
          <div className="mb-5 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">
              {activeCategory.name}
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {activeCategory.subcategories.map((subcategory) => (
              <button
                key={subcategory}
                type="button"
                onClick={() => openSubcategory(subcategory)}
                className="flex min-h-14 items-center rounded-xl border border-slate-100 px-5 py-4 text-left text-sm text-slate-700 transition-all hover:border-sky-300 hover:bg-sky-50 hover:text-sky-600 sm:text-base"
              >
                {subcategory}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => openCategory(activeCategory.name)}
            className="mt-7 inline-flex items-center gap-2 font-semibold text-sky-600 transition-colors hover:text-sky-800"
          >
            View all {activeCategory.name}
            <ChevronRight size={19} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ProductCategories;
