import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Clock,
  Zap,
  ArrowRight,
  ShoppingCart,
  Flame,
} from "lucide-react";

const flashProducts = [
  {
    id: 1,
    name: "Smart LED Television",
    category: "Entertainment",
    price: 24999,
    originalPrice: 32999,
    discount: 24,
    image:
      "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=600&q=80",
    label: "Best Seller",
  },
  {
    id: 2,
    name: "Front Load Washing Machine",
    category: "Laundry",
    price: 18999,
    originalPrice: 25999,
    discount: 27,
    image:
      "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80",
    label: "Hot Deal",
  },
  {
    id: 3,
    name: "Modern Microwave Oven",
    category: "Kitchen Appliances",
    price: 7499,
    originalPrice: 9999,
    discount: 25,
    image:
      "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?auto=format&fit=crop&w=600&q=80",
    label: "Limited Offer",
  },
  {
    id: 4,
    name: "Premium Air Conditioner",
    category: "Cooling",
    price: 32999,
    originalPrice: 42999,
    discount: 23,
    image:
      "https://images.unsplash.com/photo-1631545806609-3e3e7f8a1a7c?auto=format&fit=crop&w=600&q=80",
    label: "Top Deal",
  },
];

const FlashDeal = () => {
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 45,
    seconds: 30,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((previous) => {
        let { hours, minutes, seconds } = previous;

        if (seconds > 0) {
          seconds -= 1;
        } else if (minutes > 0) {
          minutes -= 1;
          seconds = 59;
        } else if (hours > 0) {
          hours -= 1;
          minutes = 59;
          seconds = 59;
        } else {
          // Restart the demo countdown when it reaches zero.
          hours = 8;
          minutes = 45;
          seconds = 30;
        }

        return { hours, minutes, seconds };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

 const formatTime = (value: number): string =>
  String(value).padStart(2, "0");

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);
  return (
    <section className="bg-gray-50 px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Section heading */}
        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-red-100 px-4 py-2 text-sm font-semibold text-red-600">
              <Flame size={17} />
              Limited Time Offers
            </div>

            <h2 className="flex items-center gap-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              <Zap className="fill-yellow-400 text-yellow-500" size={32} />
              Flash Deals
            </h2>

            <p className="mt-2 max-w-xl text-sm text-gray-500 sm:text-base">
              Grab incredible discounts on your favorite electrical appliances
              before these deals disappear.
            </p>
          </div>

          {/* Countdown */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600">
              <Clock size={20} className="text-red-500" />
              <span className="text-sm font-medium">Ends in</span>
            </div>

            <div className="flex items-center gap-2">
              {[
                { label: "HRS", value: timeLeft.hours },
                { label: "MIN", value: timeLeft.minutes },
                { label: "SEC", value: timeLeft.seconds },
              ].map((item) => (
                <div
                  key={item.label}
                  className="min-w-14 rounded-lg bg-gray-900 px-3 py-2 text-center text-white"
                >
                  <div className="text-xl font-bold tabular-nums">
                    {formatTime(item.value)}
                  </div>
                  <div className="text-[10px] tracking-wider text-gray-300">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {flashProducts.map((product) => {
            const savedAmount = product.originalPrice - product.price;
            const soldPercentage = 65;

            return (
              <div
                key={product.id}
                className="group overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Product image */}
                <div className="relative flex h-56 items-center justify-center overflow-hidden bg-gray-100 p-5">
                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain transition duration-500 group-hover:scale-110"
                  />

                  <span className="absolute left-3 top-3 rounded-md bg-red-500 px-3 py-1 text-xs font-bold text-white">
                    -{product.discount}%
                  </span>

                  <span className="absolute right-3 top-3 rounded-md bg-white px-2 py-1 text-xs font-semibold text-gray-700 shadow-sm">
                    {product.label}
                  </span>

                  <span className="absolute bottom-3 left-3 rounded-full bg-white/95 px-3 py-1 text-xs font-medium text-gray-600">
                    {product.category}
                  </span>
                </div>

                {/* Product information */}
                <div className="p-5">
                  <h3 className="min-h-12 text-base font-bold text-gray-800 transition group-hover:text-blue-600">
                    {product.name}
                  </h3>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xl font-extrabold text-gray-900">
                      {formatPrice(product.price)}
                    </span>

                    <span className="text-sm text-gray-400 line-through">
                      {formatPrice(product.originalPrice)}
                    </span>
                  </div>

                  <p className="mt-1 text-xs font-medium text-green-600">
                    You save {formatPrice(savedAmount)}
                  </p>

                  {/* Demo stock indicator */}
                  <div className="mt-4">
                    <div className="mb-2 flex justify-between text-xs text-gray-500">
                      <span>Deal popularity</span>
                      <span>{soldPercentage}%</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500"
                        style={{ width: `${soldPercentage}%` }}
                      />
                    </div>
                  </div>

                  <Link
                    to="/products"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                  >
                    <ShoppingCart size={17} />
                    Shop Deal
                    <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom banner */}
        <div className="mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-blue-700 to-indigo-700 px-6 py-6 text-white sm:flex-row sm:px-8">
          <div>
            <h3 className="text-xl font-bold">
              More savings. Better appliances.
            </h3>
            <p className="mt-1 text-sm text-blue-100">
              Explore our complete collection of electrical appliances.
            </p>
          </div>

          <Link
            to="/products"
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-blue-700 transition hover:bg-blue-50"
          >
            Explore All Products
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FlashDeal;