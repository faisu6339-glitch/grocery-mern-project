import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  UserRound,
  ShoppingCart,
  Menu,
  X,
  ChevronDown,
  ChevronRight,
  LogOut,
  Package,
  MapPin,
  Building2,
  Tag,
  Phone,
  Info,
  Mail,
  Zap,
  Sparkles,
  Store,
} from "lucide-react";
import { useCart } from "../Context/CartContext";

interface User {
  _id?: string;
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  profileImage?: string;
}

const categories = [
  {
    name: "Circuit Protection",
    icon: "⚡",
    items: ["MCB", "MCCB", "RCCB", "RCBO", "Fuse & Fuse Holders", "Surge Protection"],
  },
  {
    name: "Switches & Sockets",
    icon: "🔌",
    items: ["Modular Switches", "Power Sockets", "Industrial Sockets", "USB Sockets", "Switch Plates"],
  },
  {
    name: "Cables & Wires",
    icon: "〰️",
    items: ["House Wires", "Power Cables", "Flexible Cables", "Armoured Cables", "Cable Accessories"],
  },
  {
    name: "Lighting",
    icon: "💡",
    items: ["LED Bulbs", "Panel Lights", "Flood Lights", "Street Lights", "Emergency Lights"],
  },
  {
    name: "Conduits & Trunking",
    icon: "🔧",
    items: ["PVC Conduits", "Metal Conduits", "Cable Trays", "Trunking", "Cable Glands"],
  },
  {
    name: "Industrial Control",
    icon: "⚙️",
    items: ["Contactors", "Relays", "Push Buttons", "Timers", "Motor Starters"],
  },
  {
    name: "Safety & Security",
    icon: "🛡️",
    items: ["Fire Alarm Systems", "CCTV", "Smoke Detectors", "Access Control", "Emergency Systems"],
  },
  {
    name: "Tools & Accessories",
    icon: "🧰",
    items: ["Electrical Tools", "Testing Instruments", "Terminals", "Connectors", "Installation Accessories"],
  },
];

const navigationLinks = [
  { label: "Request a Quote", to: "/contact", icon: Tag },
  { label: "For Businesses", to: "/contact", icon: Building2 },
  { label: "New Arrivals", to: "/products", icon: Sparkles },
  { label: "Shop by Brand", to: "/search?q=Philips", icon: Zap },
  { label: "Enquiries", to: "/contact", icon: Mail },
  { label: "About Us", to: "/about", icon: Info },
  { label: "Contact Us", to: "/contact", icon: Phone },
  { label: "Deals & Offers", to: "/deals", icon: Tag },
];

const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) return null;

    const parsed = JSON.parse(storedUser);

    if (typeof parsed === "string") {
      return { name: parsed };
    }

    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
};

const Navbar = () => {
  const navigate = useNavigate();
  const { cartCount } = useCart();

  const [user, setUser] = useState<User | null>(getStoredUser);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const syncUser = () => setUser(getStoredUser());

    window.addEventListener("storage", syncUser);
    window.addEventListener("userUpdated", syncUser);

    return () => {
      window.removeEventListener("storage", syncUser);
      window.removeEventListener("userUpdated", syncUser);
    };
  }, []);

  const closeMenus = () => {
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");

    setUser(null);
    closeMenus();

    window.dispatchEvent(new Event("userUpdated"));
    navigate("/login");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const query = searchQuery.trim();
    if (!query) return;

    closeMenus();
    navigate(`/search?q=${encodeURIComponent(query)}`);
    setSearchQuery("");
  };

  const searchFor = (query: string) => {
    closeMenus();
    navigate(`/search?q=${encodeURIComponent(query)}`);
  };

  const displayName = user?.name?.trim() || "My Account";

  const initials =
    displayName === "My Account"
      ? "U"
      : displayName
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0])
          .join("")
          .toUpperCase();

  const avatar = user?.avatar || user?.profileImage;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white shadow-sm">
      {/* Main header */}
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          onClick={closeMenus}
          className="flex shrink-0 items-center gap-2"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#087EBC] text-white">
            <Zap size={25} fill="currentColor" />
          </div>

          <div>
            <span className="block text-xl font-extrabold tracking-tight text-[#142D4E]">
              Electro<span className="text-[#087EBC]">Store</span>
            </span>
            <span className="hidden text-[10px] font-medium uppercase tracking-[0.2em] text-slate-500 sm:block">
              Electrical Supplies
            </span>
          </div>
        </Link>

        {/* Desktop search */}
        <form
          onSubmit={handleSearch}
          className="hidden max-w-xl flex-1 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-[#087EBC] md:flex"
        >
          <Search size={19} className="shrink-0 text-slate-400" />

          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search electrical products, brands..."
            className="w-full bg-transparent px-3 py-3 text-sm outline-none placeholder:text-slate-400"
          />

          <button
            type="submit"
            className="rounded-lg bg-[#087EBC] px-4 py-2 text-sm font-semibold text-white hover:bg-[#06699D]"
          >
            Search
          </button>
        </form>

        {/* Desktop account and cart */}
        <div className="hidden items-center gap-2 lg:flex">
          <div className="relative">
            {user ? (
              <button
                type="button"
                onClick={() => setUserMenuOpen((open) => !open)}
                aria-expanded={userMenuOpen}
                className="flex max-w-48 items-center gap-2 rounded-xl px-2 py-2 hover:bg-slate-50"
              >
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#087EBC] text-sm font-bold text-white">
                    {initials}
                  </span>
                )}

                <span className="min-w-0 text-left">
                  <span className="block text-xs text-slate-500">
                    Welcome back
                  </span>
                  <span className="block max-w-28 truncate text-sm font-bold text-[#142D4E]">
                    {displayName}
                  </span>
                </span>

                <ChevronDown size={15} />
              </button>
            ) : (
              <Link
                to="/login"
                onClick={closeMenus}
                className="flex items-center gap-2 rounded-xl px-2 py-2 hover:bg-slate-50"
              >
                <UserRound size={23} />
                <span>
                  <span className="block text-xs text-slate-500">
                    Welcome
                  </span>
                  <span className="block text-sm font-bold">
                    Login / Register
                  </span>
                </span>
              </Link>
            )}

            {user && userMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white py-2 shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="truncate font-bold">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {user.email || "Logged in"}
                  </p>
                </div>

                <Link
                  to="/orders"
                  onClick={closeMenus}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <Package size={18} />
                  My Orders
                </Link>

                <Link
                  to="/addresses"
                  onClick={closeMenus}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <MapPin size={18} />
                  My Addresses
                </Link>

                <Link
                  to="/cart"
                  onClick={closeMenus}
                  className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-slate-50"
                >
                  <ShoppingCart size={18} />
                  My Cart ({cartCount})
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 border-t border-slate-100 px-4 py-3 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </div>
            )}
          </div>

          <Link
            to="/cart"
            onClick={closeMenus}
            aria-label={`Shopping cart, ${cartCount} items`}
            className="relative rounded-xl p-3 text-[#142D4E] hover:bg-slate-50 hover:text-[#087EBC]"
          >
            <ShoppingCart size={23} />
            {cartCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-400 px-1 text-xs font-bold text-[#142D4E]">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            )}
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
          className="rounded-lg p-2 text-[#142D4E] hover:bg-slate-100 lg:hidden"
        >
          {mobileMenuOpen ? <X size={25} /> : <Menu size={25} />}
        </button>
      </div>

      {/* Desktop navigation */}
      <nav className="hidden border-t border-slate-100 lg:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-5">
            <button
              type="button"
              onClick={() => setMegaMenuOpen((open) => !open)}
              onMouseEnter={() => setMegaMenuOpen(true)}
              aria-expanded={megaMenuOpen}
              className="flex shrink-0 items-center gap-2 py-4 text-sm font-bold text-[#142D4E] hover:text-[#087EBC]"
            >
              <Menu size={18} />
              Shop by Category
              <ChevronDown
                size={15}
                className={megaMenuOpen ? "rotate-180" : ""}
              />
            </button>

            {navigationLinks.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                onClick={closeMenus}
                className="whitespace-nowrap py-4 text-sm font-medium text-slate-600 hover:text-[#087EBC]"
              >
                {label}
              </Link>
            ))}
          </div>

          <Link
            to="/contact"
            onClick={closeMenus}
            className="my-2 shrink-0 rounded-lg bg-amber-400 px-4 py-2 text-sm font-bold text-[#142D4E] hover:bg-amber-300"
          >
            Bulk Order? Get a Quote
          </Link>
        </div>

        {/* Desktop category mega menu */}
        {megaMenuOpen && (
          <div
            onMouseLeave={() => setMegaMenuOpen(false)}
            className="absolute left-0 right-0 top-full border-t border-slate-200 bg-white shadow-2xl"
          >
            <div className="mx-auto grid max-w-7xl grid-cols-12 gap-0 px-4 sm:px-6 lg:px-8">
              <div className="col-span-3 border-r border-slate-100 py-5 pr-3">
                <h3 className="mb-3 px-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Product Categories
                </h3>

                {categories.map((category, index) => (
                  <button
                    key={category.name}
                    type="button"
                    onMouseEnter={() => setActiveCategory(index)}
                    onClick={() => setActiveCategory(index)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-3 text-left text-sm ${
                      activeCategory === index
                        ? "bg-sky-50 font-bold text-[#087EBC]"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span>{category.icon}</span>
                      {category.name}
                    </span>
                    <ChevronRight size={15} />
                  </button>
                ))}
              </div>

              <div className="col-span-5 border-r border-slate-100 px-6 py-5">
                <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                  {categories[activeCategory].name}
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {categories[activeCategory].items.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => searchFor(item)}
                      className="rounded-lg border border-slate-100 px-4 py-3 text-left text-sm text-slate-700 hover:border-sky-200 hover:bg-sky-50 hover:text-[#087EBC]"
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => searchFor(categories[activeCategory].name)}
                  className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#087EBC] hover:underline"
                >
                  View all {categories[activeCategory].name}
                  <ChevronRight size={16} />
                </button>
              </div>

              <div className="col-span-4 space-y-4 py-5 pl-5">
                <Link
                  to="/deals"
                  onClick={closeMenus}
                  className="block rounded-xl bg-[#142D4E] p-5 text-white hover:bg-[#1b3d66]"
                >
                  <span className="mb-2 inline-flex rounded-md bg-amber-400 px-2 py-1 text-xs font-extrabold text-[#142D4E]">
                    SPECIAL OFFERS
                  </span>
                  <h3 className="text-lg font-extrabold">
                    Electrical Deals & Offers
                  </h3>
                  <p className="mt-1 text-sm text-slate-300">
                    Explore available products and offers.
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-amber-300">
                    Shop deals <ChevronRight size={16} />
                  </span>
                </Link>

                <Link
                  to="/contact"
                  onClick={closeMenus}
                  className="block rounded-xl border border-slate-200 p-5 hover:border-sky-200 hover:bg-sky-50"
                >
                  <Building2 size={25} className="mb-3 text-[#087EBC]" />
                  <h3 className="font-bold">Buying for a Business?</h3>
                  <p className="mt-1 text-sm text-slate-500">
                    Contact us about bulk orders and product requirements.
                  </p>
                  <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-[#087EBC]">
                    Contact us <ChevronRight size={15} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="max-h-[80vh] overflow-y-auto border-t border-slate-200 bg-white px-4 pb-5 pt-4 shadow-lg lg:hidden">
          {/* Mobile search */}
          <form
            onSubmit={handleSearch}
            className="mb-4 flex items-center rounded-lg border border-slate-200 px-3"
          >
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products or brands..."
              className="w-full px-3 py-3 text-sm outline-none"
            />
            <button
              type="submit"
              className="text-sm font-bold text-[#087EBC]"
            >
              Search
            </button>
          </form>

          {/* Mobile account */}
          {user ? (
            <div className="mb-4 rounded-xl bg-slate-50 p-3">
              <div className="flex items-center gap-3">
                {avatar ? (
                  <img
                    src={avatar}
                    alt="Profile"
                    className="h-11 w-11 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#087EBC] font-bold text-white">
                    {initials}
                  </span>
                )}

                <div className="min-w-0">
                  <p className="truncate font-bold">{displayName}</p>
                  <p className="truncate text-xs text-slate-500">
                    {user.email || "Logged in"}
                  </p>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Link
                  to="/orders"
                  onClick={closeMenus}
                  className="rounded-lg bg-white px-3 py-2 text-center text-sm font-medium"
                >
                  My Orders
                </Link>

                <Link
                  to="/addresses"
                  onClick={closeMenus}
                  className="rounded-lg bg-white px-3 py-2 text-center text-sm font-medium"
                >
                  My Addresses
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="col-span-2 flex items-center justify-center gap-2 rounded-lg border border-red-100 bg-white px-3 py-2 text-sm font-semibold text-red-600"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              onClick={closeMenus}
              className="mb-4 flex items-center gap-3 rounded-lg bg-slate-50 p-3 font-semibold"
            >
              <UserRound size={22} />
              Login / Register
            </Link>
          )}

          {/* Mobile quick links */}
          <div className="mb-4 flex gap-5 border-b border-slate-100 pb-4">
            <Link
              to="/cart"
              onClick={closeMenus}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <ShoppingCart size={19} />
              Cart ({cartCount})
            </Link>

            <Link
              to="/products"
              onClick={closeMenus}
              className="flex items-center gap-2 text-sm font-medium"
            >
              <Store size={19} />
              All Products
            </Link>
          </div>

          {/* Mobile categories */}
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
            Shop by Category
          </h3>

          <div className="space-y-1">
            {categories.map((category, index) => (
              <div key={category.name} className="overflow-hidden rounded-lg">
                <button
                  type="button"
                  onClick={() =>
                    setActiveCategory((current) =>
                      current === index ? -1 : index
                    )
                  }
                  aria-expanded={activeCategory === index}
                  className="flex w-full items-center justify-between px-3 py-3 text-left text-sm font-semibold hover:bg-slate-50"
                >
                  <span className="flex items-center gap-3">
                    <span>{category.icon}</span>
                    {category.name}
                  </span>

                  <ChevronDown
                    size={16}
                    className={
                      activeCategory === index ? "rotate-180" : ""
                    }
                  />
                </button>

                {activeCategory === index && (
                  <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3">
                    {category.items.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => searchFor(item)}
                        className="rounded-md bg-white px-3 py-2 text-left text-xs text-slate-700 hover:text-[#087EBC]"
                      >
                        {item}
                      </button>
                    ))}

                    <button
                      type="button"
                      onClick={() => searchFor(category.name)}
                      className="col-span-2 rounded-md bg-white px-3 py-2 text-left text-xs font-bold text-[#087EBC]"
                    >
                      View all {category.name}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Mobile page links */}
          <div className="mt-4 border-t border-slate-100 pt-3">
            {navigationLinks.map(({ label, to, icon: Icon }) => (
              <Link
                key={label}
                to={to}
                onClick={closeMenus}
                className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Icon size={18} className="text-[#087EBC]" />
                {label}
              </Link>
            ))}

            <Link
              to="/contact"
              onClick={closeMenus}
              className="mt-2 flex items-center gap-3 rounded-lg bg-amber-400 px-3 py-3 text-sm font-bold text-[#142D4E]"
            >
              <Tag size={18} />
              Bulk Order? Get a Quote
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;