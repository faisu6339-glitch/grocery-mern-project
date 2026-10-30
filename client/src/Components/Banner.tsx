
import { useEffect, useState } from "react";
import {
  X,
  Zap,
  Clock,
  ArrowRight,
  Tag,
  Truck,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";

const Banner = () => {
  const [bannerVisible, setBannerVisible] = useState(() => {
    return sessionStorage.getItem("banner_dismissed") !== "true";
  });

  const [couponCopied, setCouponCopied] = useState(false);

  const [timeLeft, setTimeLeft] = useState({
    hours: 5,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    if (!bannerVisible) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (
          prev.hours === 0 &&
          prev.minutes === 0 &&
          prev.seconds === 0
        ) {
          window.clearInterval(timer);
          return prev;
        }

        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        }

        if (prev.minutes > 0) {
          return {
            ...prev,
            minutes: prev.minutes - 1,
            seconds: 59,
          };
        }

        return {
          hours: prev.hours - 1,
          minutes: 59,
          seconds: 59,
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [bannerVisible]);

  const dismissBanner = () => {
    setBannerVisible(false);
    sessionStorage.setItem("banner_dismissed", "true");
  };

  const copyCoupon = async () => {
    try {
      await navigator.clipboard.writeText("WELCOME20");
      setCouponCopied(true);
      toast.success("Coupon code copied!");

      window.setTimeout(() => {
        setCouponCopied(false);
      }, 2000);
    } catch {
      toast.error("Unable to copy coupon. Please copy WELCOME20 manually.");
    }
  };

  const handleShopNow = () => {
    document.getElementById("products")?.scrollIntoView({
      behavior: "smooth",
    });
  };

  if (!bannerVisible) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-green-800 via-emerald-600 to-teal-600 text-white shadow-md">
      {/* Decorative Background */}
      <div className="absolute -right-10 -top-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-12 left-1/4 h-32 w-32 rounded-full bg-emerald-300/10 blur-2xl" />

      <div className="relative mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:gap-6">
        {/* Offer Information */}
        <div className="flex items-start gap-3 sm:items-center">
          {/* Discount Logo */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
            <Zap
              size={26}
              className="text-yellow-300"
              fill="currentColor"
            />
          </div>

          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-yellow-300 px-2.5 py-1 text-xs font-extrabold text-green-950">
                SPECIAL OFFER
              </span>

              <span className="text-xs font-medium text-green-50">
                Welcome to ElectroStore
              </span>
            </div>

            <p className="text-sm font-medium sm:text-base">
              Get{" "}
              <span className="font-extrabold text-yellow-300">
                20% OFF
              </span>{" "}
              your first order on electrical appliances!
            </p>

            <p className="mt-1 text-xs text-green-50 sm:text-sm">
              Use code WELCOME20 at checkout.
            </p>

            {/* Free Delivery Message */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/15">
                <Truck size={19} className="text-yellow-300" />
              </div>

              <span className="text-xs font-semibold sm:text-sm">
                Free Delivery on Your First Order
              </span>
            </div>
          </div>
        </div>

        {/* Coupon, Countdown and Shop Button */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 lg:justify-end">
          {/* Coupon Copy Button */}
          <button
            type="button"
            onClick={copyCoupon}
            className="flex items-center gap-2 rounded-lg border border-dashed border-white/60 bg-white/10 px-3 py-2 text-sm font-bold transition hover:bg-white/20"
            title="Copy coupon code"
          >
            {couponCopied ? (
              <Check size={16} />
            ) : (
              <Tag size={16} />
            )}

            {couponCopied ? "Copied!" : "WELCOME20"}
          </button>

          {/* Countdown */}
          <div className="flex items-center gap-2 text-sm">
            <Clock size={17} className="shrink-0 text-yellow-300" />

            <span className="text-green-50">Ends in</span>

            <span className="font-mono font-bold tabular-nums">
              {String(timeLeft.hours).padStart(2, "0")}:
              {String(timeLeft.minutes).padStart(2, "0")}:
              {String(timeLeft.seconds).padStart(2, "0")}
            </span>
          </div>

          {/* Shop Now Button */}
          <button
            type="button"
            onClick={handleShopNow}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-green-800 transition hover:bg-green-50"
          >
            Shop Now
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Dismiss Button */}
      <button
        type="button"
        onClick={dismissBanner}
        aria-label="Dismiss offer banner"
        className="absolute right-2 top-2 rounded-full p-1.5 text-white/80 transition hover:bg-white/15 hover:text-white sm:right-3 sm:top-3"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default Banner;
