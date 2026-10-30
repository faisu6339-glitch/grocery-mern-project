
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Zap,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";

const slides = [
  {
    badge: "WELCOME TO ELECTROSTORE",
    title: "Power Your Home with Smarter Appliances",
    description:
      "Discover quality electrical appliances, modern lighting, and everyday essentials at great prices.",
    buttonText: "Shop Now",
    link: "/product",
    secondaryText: "Explore Deals",
    secondaryLink: "/deals",
    label: "SMART LIVING",
    visualTitle: "Smart Living Starts Here",
    visualDescription: "Everything you need to power your home.",
    icon: Zap,
    background: "from-sky-100 via-white to-amber-100",
  },
  {
    badge: "UPGRADE YOUR HOME",
    title: "Make Every Corner Shine Brighter",
    description:
      "Explore modern lighting, energy-efficient LED bulbs, and lighting solutions for every room.",
    buttonText: "Explore Lighting",
    link: "/search?q=lighting",
    secondaryText: "View Products",
    secondaryLink: "/product",
    label: "BRIGHTER SPACES",
    visualTitle: "Light Up Your World",
    visualDescription: "Discover lighting for every space.",
    icon: Sparkles,
    background: "from-amber-100 via-white to-orange-100",
  },
  {
    badge: "QUALITY YOU CAN TRUST",
    title: "Reliable Electrical Essentials for Every Project",
    description:
      "Find cables, switches, sockets, and electrical accessories for your home or business.",
    buttonText: "Shop Essentials",
    link: "/product",
    secondaryText: "Browse Categories",
    secondaryLink: "/search?q=electrical",
    label: "BUILT FOR EVERYDAY",
    visualTitle: "Power Every Project",
    visualDescription: "Discover dependable electrical essentials.",
    icon: ShieldCheck,
    background: "from-emerald-100 via-white to-sky-100",
  },
];

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const nextSlide = () => {
    setCurrentSlide((current) => (current + 1) % slides.length);
  };

  const previousSlide = () => {
    setCurrentSlide(
      (current) => (current - 1 + slides.length) % slides.length
    );
  };

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, []);

  const slide = slides[currentSlide];
  const SlideIcon = slide.icon;

  return (
    <section className="overflow-hidden bg-[#FAF7F2]">
      <div
        className={`relative bg-gradient-to-br ${slide.background} transition-colors duration-500`}
      >
        <div className="mx-auto grid min-h-[500px] max-w-7xl items-center gap-10 px-12 py-12 sm:px-16 md:grid-cols-2 md:py-16 lg:px-20">
          {/* Left content */}
          <div key={slide.title} className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-extrabold tracking-wider text-[#087EBC] shadow-sm sm:text-sm">
              <Zap size={16} />
              {slide.badge}
            </span>

            <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-[#142D4E] sm:text-5xl lg:text-6xl">
              {slide.title}
            </h1>

            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">
              {slide.description}
            </p>

            {/* Action buttons */}
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to={slide.link}
                className="inline-flex items-center gap-2 rounded-xl bg-[#087EBC] px-5 py-3.5 font-bold text-white shadow-md transition hover:bg-[#06699D]"
              >
                {slide.buttonText}
                <ArrowRight size={18} />
              </Link>

              <Link
                to={slide.secondaryLink}
                className="inline-flex items-center gap-2 rounded-xl border border-[#142D4E]/30 bg-white/60 px-5 py-3.5 font-bold text-[#142D4E] transition hover:bg-white"
              >
                {slide.secondaryText}
              </Link>
            </div>

            {/* Trust highlights */}
            <div className="mt-8 flex flex-wrap gap-x-5 gap-y-3 text-sm font-medium text-slate-600">
              <span className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-emerald-600" />
                Quality Products
              </span>

              <span className="flex items-center gap-2">
                <Truck size={18} className="text-[#087EBC]" />
                Reliable Delivery
              </span>
            </div>
          </div>

          {/* Right promotional visual */}
          <div
            key={`${slide.label}-visual`}
            className="relative mx-auto w-full max-w-lg"
          >
            <div className="absolute -right-5 -top-5 h-32 w-32 rounded-full bg-amber-200/60 blur-2xl" />
            <div className="absolute -bottom-5 -left-5 h-32 w-32 rounded-full bg-sky-200/70 blur-2xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/80 bg-white/70 p-7 shadow-xl backdrop-blur-sm sm:p-10">
              <span className="absolute right-4 top-4 rounded-full bg-amber-400 px-3 py-1.5 text-[10px] font-extrabold tracking-wider text-[#142D4E] sm:right-5 sm:top-5 sm:text-xs">
                {slide.label}
              </span>

              <div className="flex min-h-[250px] flex-col items-center justify-center text-center sm:min-h-[290px]">
                <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-[#142D4E] text-white shadow-lg sm:h-36 sm:w-36">
                  <SlideIcon
                    size={76}
                    strokeWidth={1.5}
                    className="sm:hidden"
                  />
                  <SlideIcon
                    size={96}
                    strokeWidth={1.5}
                    className="hidden sm:block"
                  />
                </div>

                <h2 className="mt-7 text-2xl font-extrabold text-[#142D4E] sm:text-3xl">
                  {slide.visualTitle}
                </h2>

                <p className="mt-3 max-w-xs text-sm leading-6 text-slate-600">
                  {slide.visualDescription}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Previous arrow */}
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous slide"
          className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-white/90 text-[#142D4E] shadow-md transition hover:bg-[#087EBC] hover:text-white sm:left-5 sm:h-11 sm:w-11"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Next arrow */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white bg-white/90 text-[#142D4E] shadow-md transition hover:bg-[#087EBC] hover:text-white sm:right-5 sm:h-11 sm:w-11"
        >
          <ArrowRight size={20} />
        </button>

        {/* Slide indicators */}
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {slides.map((item, index) => (
            <button
              key={item.badge}
              type="button"
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-current={currentSlide === index ? "true" : undefined}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                currentSlide === index
                  ? "w-8 bg-[#087EBC]"
                  : "w-2.5 bg-[#142D4E]/30 hover:bg-[#142D4E]/60"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;
