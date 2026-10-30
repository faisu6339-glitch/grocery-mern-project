
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  Star,
  Package,
  RotateCcw,
} from "lucide-react";

interface Product {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  subcategory?: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image?: string;
  rating?: number;
  reviews?: number;
  stock?: number;
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const formatPrice = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const SearchResult = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("q") || ""
  );
  const [category, setCategory] = useState(
    searchParams.get("category") || ""
  );
  const [brand, setBrand] = useState(
    searchParams.get("brand") || ""
  );
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [minRating, setMinRating] = useState("0");
  const [sortBy, setSortBy] = useState("relevance");

  // Fetch products from the existing backend API.
  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/products`, {
          signal: controller.signal,
        });

        const data: Product[] = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.products)
            ? response.data.products
            : [];

        setProducts(data);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Search products error:", err);
        setError("Unable to load products. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, []);

  // Sync the page with URL search parameters.
  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
    setCategory(searchParams.get("category") || "");
    setBrand(searchParams.get("brand") || "");
  }, [searchParams]);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.category).filter(Boolean))
      ).sort() as string[],
    [products]
  );

  const brands = useMemo(
    () =>
      Array.from(
        new Set(products.map((product) => product.brand).filter(Boolean))
      ).sort() as string[],
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    const min = minPrice === "" ? null : Number(minPrice);
    const max = maxPrice === "" ? null : Number(maxPrice);
    const rating = Number(minRating);

    const result = products.filter((product) => {
      const searchableText = [
        product.name,
        product.brand,
        product.category,
        product.subcategory,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const price = Number(product.price) || 0;

      return (
        (!query || searchableText.includes(query)) &&
        (!category || product.category === category) &&
        (!brand || product.brand === brand) &&
        (min === null || (Number.isFinite(min) && price >= min)) &&
        (max === null || (Number.isFinite(max) && price <= max)) &&
        (rating === 0 || Number(product.rating || 0) >= rating)
      );
    });

    if (sortBy === "price-low") {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price-high") {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === "rating") {
      result.sort(
        (a, b) => Number(b.rating || 0) - Number(a.rating || 0)
      );
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [
    products,
    searchTerm,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    sortBy,
  ]);

  const clearFilters = () => {
    setSearchTerm("");
    setCategory("");
    setBrand("");
    setMinPrice("");
    setMaxPrice("");
    setMinRating("0");
    setSortBy("relevance");
    setSearchParams({});
  };

  const submitSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (searchTerm.trim()) params.set("q", searchTerm.trim());
    if (category) params.set("category", category);
    if (brand) params.set("brand", brand);

    setSearchParams(params);
  };

  const hasActiveFilters =
    Boolean(searchTerm.trim()) ||
    Boolean(category) ||
    Boolean(brand) ||
    minPrice !== "" ||
    maxPrice !== "" ||
    minRating !== "0" ||
    sortBy !== "relevance";

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl min-w-0">
        {/* Page heading */}
        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
            Find what you need
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-[#142D4E] sm:text-4xl">
            Search Products
          </h1>

          <p className="mt-2 text-slate-600">
            Search and filter electrical appliances and accessories.
          </p>
        </div>

        {/* Search bar */}
        <form
          onSubmit={submitSearch}
          className="mb-6 flex w-full min-w-0 items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-sm"
        >
          <Search
            size={21}
            className="ml-2 shrink-0 text-slate-400"
          />

          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search products, brands, categories..."
            className="min-w-0 flex-1 bg-transparent px-2 py-2 text-[#142D4E] outline-none placeholder:text-slate-400"
            aria-label="Search products"
          />

          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              aria-label="Clear search text"
            >
              <X size={18} />
            </button>
          )}

          <button
            type="submit"
            className="shrink-0 rounded-xl bg-[#087EBC] px-4 py-2.5 font-semibold text-white hover:bg-[#06699D] sm:px-6"
          >
            Search
          </button>
        </form>

        {/* Results toolbar */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            {loading
              ? "Loading products..."
              : `${filteredProducts.length} product${filteredProducts.length === 1 ? "" : "s"} found`}
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFilters((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 font-semibold text-[#142D4E] hover:border-sky-500"
              aria-expanded={showFilters}
            >
              <SlidersHorizontal size={18} />
              Filters
            </button>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-[#142D4E]">
              <ArrowUpDown size={16} />

              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value)}
                className="max-w-44 bg-transparent outline-none"
                aria-label="Sort products"
              >
                <option value="relevance">Recommended</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A to Z</option>
              </select>
            </label>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex items-center gap-1 rounded-xl px-3 py-2.5 text-sm font-semibold text-rose-600 hover:bg-rose-50"
              >
                <RotateCcw size={15} />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Main layout */}
        <div
          className={`grid min-w-0 items-start gap-6 ${
            showFilters
              ? "grid-cols-1 lg:grid-cols-[250px_minmax(0,1fr)]"
              : "grid-cols-1"
          }`}
        >
          {/* Filters sidebar */}
          {showFilters && (
            <aside className="w-full min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-bold text-[#142D4E]">
                  Filter Products
                </h2>

                <button
                  type="button"
                  onClick={() => setShowFilters(false)}
                  className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                  aria-label="Close filters"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="mb-5">
                <label
                  htmlFor="category-filter"
                  className="mb-2 block text-sm font-semibold text-[#142D4E]"
                >
                  Category
                </label>

                <select
                  id="category-filter"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
                >
                  <option value="">All Categories</option>
                  {categories.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-5">
                <label
                  htmlFor="brand-filter"
                  className="mb-2 block text-sm font-semibold text-[#142D4E]"
                >
                  Brand
                </label>

                <select
                  id="brand-filter"
                  value={brand}
                  onChange={(event) => setBrand(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
                >
                  <option value="">All Brands</option>
                  {brands.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-[#142D4E]">
                  Price Range (₹)
                </label>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="0"
                    value={minPrice}
                    onChange={(event) => setMinPrice(event.target.value)}
                    placeholder="Min"
                    className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
                    aria-label="Minimum price"
                  />

                  <input
                    type="number"
                    min="0"
                    value={maxPrice}
                    onChange={(event) => setMaxPrice(event.target.value)}
                    placeholder="Max"
                    className="w-full min-w-0 rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-sky-500"
                    aria-label="Maximum price"
                  />
                </div>

                {minPrice !== "" &&
                  maxPrice !== "" &&
                  Number(minPrice) > Number(maxPrice) && (
                    <p className="mt-2 text-xs text-rose-600">
                      Minimum price must not exceed maximum price.
                    </p>
                  )}
              </div>

              <div className="mb-5">
                <label
                  htmlFor="rating-filter"
                  className="mb-2 block text-sm font-semibold text-[#142D4E]"
                >
                  Minimum Rating
                </label>

                <select
                  id="rating-filter"
                  value={minRating}
                  onChange={(event) => setMinRating(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-sky-500"
                >
                  <option value="0">All Ratings</option>
                  <option value="4">4 stars & above</option>
                  <option value="3">3 stars & above</option>
                  <option value="2">2 stars & above</option>
                  <option value="1">1 star & above</option>
                </select>
              </div>

              <button
                type="button"
                onClick={clearFilters}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 font-semibold text-[#142D4E] hover:bg-slate-50"
              >
                Clear All Filters
              </button>
            </aside>
          )}

          {/* Products section */}
          <section className="w-full min-w-0">
            {loading ? (
              <div className="rounded-2xl border border-slate-200 bg-white py-20 text-center">
                <div className="mx-auto mb-4 h-9 w-9 animate-spin rounded-full border-4 border-sky-200 border-t-sky-600" />
                <p className="text-slate-600">Loading products...</p>
              </div>
            ) : error ? (
              <div className="rounded-2xl border border-rose-100 bg-white px-5 py-12 text-center">
                <p className="font-semibold text-rose-600">{error}</p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="mt-4 rounded-xl bg-[#087EBC] px-5 py-2.5 font-semibold text-white hover:bg-[#06699D]"
                >
                  Try Again
                </button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white px-5 py-16 text-center">
                <Package
                  size={46}
                  className="mx-auto text-slate-300"
                />

                <h2 className="mt-4 text-xl font-bold text-[#142D4E]">
                  No products found
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Try another keyword or change your filters.
                </p>

                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-5 rounded-xl bg-[#087EBC] px-5 py-3 font-semibold text-white hover:bg-[#06699D]"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid w-full min-w-0 grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => {
                  const price = Number(product.price) || 0;
                  const originalPrice =
                    Number(product.originalPrice) || 0;

                  const discount =
                    originalPrice > price
                      ? Math.round(
                          ((originalPrice - price) / originalPrice) * 100
                        )
                      : Number(product.discount) || 0;

                  return (
                    <article
                      key={product._id}
                      className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                    >
                      <Link
                        to={`/products/${product._id}`}
                        className="relative flex h-52 w-full shrink-0 items-center justify-center overflow-hidden bg-white p-5 sm:h-56"
                      >
                        {discount > 0 && (
                          <span className="absolute left-3 top-3 z-10 rounded-lg bg-rose-500 px-2.5 py-1.5 text-xs font-bold text-white">
                            {discount}% OFF
                          </span>
                        )}

                        <img
                          src={product.image || "/placeholder.png"}
                          alt={product.name}
                          loading="lazy"
                          className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                          onError={(event) => {
                            event.currentTarget.onerror = null;
                            event.currentTarget.src = "/placeholder.png";
                          }}
                        />
                      </Link>

                      <div className="flex flex-1 flex-col p-4">
                        <p className="truncate text-xs font-semibold uppercase tracking-wider text-sky-600">
                          {product.brand || product.category || "Electrical"}
                        </p>

                        <Link
                          to={`/products/${product._id}`}
                          className="mt-2"
                        >
                          <h2 className="line-clamp-2 min-h-12 break-words font-bold text-[#142D4E] hover:text-sky-600">
                            {product.name}
                          </h2>
                        </Link>

                        {Number(product.rating) > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-sm text-slate-600">
                            <Star
                              size={15}
                              className="fill-amber-400 text-amber-400"
                            />
                            <span>{product.rating}</span>
                            <span className="text-slate-400">
                              ({product.reviews || 0})
                            </span>
                          </div>
                        )}

                        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
                          <div className="min-w-0">
                            <p className="break-words text-lg font-extrabold text-[#142D4E]">
                              {formatPrice(price)}
                            </p>

                            {originalPrice > price && (
                              <p className="text-xs text-slate-400 line-through">
                                {formatPrice(originalPrice)}
                              </p>
                            )}
                          </div>

                          <Link
                            to={`/products/${product._id}`}
                            className="shrink-0 rounded-xl bg-[#087EBC] px-3 py-2.5 text-sm font-semibold text-white hover:bg-[#06699D] sm:px-4"
                          >
                            View Product
                          </Link>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};

export default SearchResult;
