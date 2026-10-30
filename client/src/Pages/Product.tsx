
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  ArrowRight,
  PackageSearch,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

interface ProductItem {
  _id: string;
  productId?: string;
  name: string;
  description?: string;
  category: string;
  subcategory?: string;
  brand?: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  image: string;
  rating?: number;
  reviews?: number;
  stock?: number;
  isFeatured?: boolean;
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const Product = () => {
  const [searchParams] = useSearchParams();

  const category = searchParams.get("category") || "";
  const subcategory = searchParams.get("subcategory") || "";

  const [allProducts, setAllProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const controller = new AbortController();

    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(`${API_URL}/products`, {
          signal: controller.signal,
        });

        const data = response.data;

        if (!data.success || !Array.isArray(data.products)) {
          throw new Error("Invalid products response from server.");
        }

        setAllProducts(data.products);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Failed to fetch products:", err);

        setError(
          axios.isAxiosError(err)
            ? "Unable to load products. Check whether your backend is running."
            : "Unable to load products. Please try again."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProducts();

    return () => controller.abort();
  }, []);

  const filteredProducts = useMemo(() => {
    const filtered = allProducts.filter((product) => {
      const matchesCategory =
        !category ||
        product.category?.trim().toLowerCase() ===
          category.trim().toLowerCase();

      const matchesSubcategory =
        !subcategory ||
        product.subcategory?.trim().toLowerCase() ===
          subcategory.trim().toLowerCase();

      return matchesCategory && matchesSubcategory;
    });

    switch (sortBy) {
      case "price-low":
        return [...filtered].sort((a, b) => a.price - b.price);

      case "price-high":
        return [...filtered].sort((a, b) => b.price - a.price);

      case "name":
        return [...filtered].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

      case "newest":
      default:
        return filtered;
    }
  }, [allProducts, category, subcategory, sortBy]);

  const pageTitle = subcategory || category || "All Products";

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <div className="mb-6 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-sky-600">
            Home
          </Link>

          <span>/</span>

          <span className="font-medium text-slate-800">
            {pageTitle}
          </span>
        </div>

        {/* Heading */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#142D4E] sm:text-4xl">
              {pageTitle}
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              Explore quality electrical products and appliances
              available in our store.
            </p>
          </div>

          <Link
            to="/"
            className="inline-flex w-fit items-center gap-2 font-semibold text-sky-600 hover:text-sky-800"
          >
            <ArrowLeft size={17} />
            Back to Home
          </Link>
        </div>

        {/* Toolbar */}
        <div className="mb-6 flex flex-col justify-between gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center">
          <p className="text-sm text-slate-600">
            {loading
              ? "Loading products..."
              : `${filteredProducts.length} product${
                  filteredProducts.length === 1 ? "" : "s"
                } found`}
          </p>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <SlidersHorizontal size={17} />

            <span>Sort by</span>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-slate-800 outline-none focus:border-sky-500"
            >
              <option value="newest">Newest first</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </label>
        </div>

        {/* Loading */}
        {loading && (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse rounded-2xl border border-slate-200 bg-white p-4"
              >
                <div className="aspect-square rounded-xl bg-slate-100" />
                <div className="mt-4 h-4 rounded bg-slate-100" />
                <div className="mt-3 h-4 w-2/3 rounded bg-slate-100" />
              </div>
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-white p-8 text-center">
            <p className="font-semibold text-red-600">{error}</p>

            <button
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
          </div>
        )}

        {/* Product grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <Link
                key={product._id}
                to={`/products/${product._id}`}
                className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:border-sky-200 hover:shadow-lg"
              >
                {/* Image */}
                <div className="relative flex aspect-square items-center justify-center overflow-hidden bg-white p-4">
                  {Number(product.discount) > 0 && (
                    <span className="absolute left-3 top-3 z-10 rounded-lg bg-rose-500 px-2 py-1 text-xs font-bold text-white">
                      {product.discount}% OFF
                    </span>
                  )}

                  <img
                    src={product.image}
                    alt={product.name}
                    loading="lazy"
                    className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Details */}
                <div className="p-3 sm:p-4">
                  <p className="text-xs font-medium text-slate-500">
                    {product.brand || product.category}
                  </p>

                  <h2 className="mt-2 line-clamp-2 min-h-10 text-sm font-bold text-[#142D4E] transition group-hover:text-sky-600 sm:text-base">
                    {product.name}
                  </h2>

                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-lg font-extrabold text-[#142D4E]">
                      ₹{Number(product.price).toLocaleString("en-IN")}
                    </span>

                    {Number(product.originalPrice) > Number(product.price) && (
                      <span className="text-xs text-slate-400 line-through">
                        ₹{Number(product.originalPrice).toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  {product.productId && (
                    <p className="mt-2 text-xs text-slate-400">
                      ID: {product.productId}
                    </p>
                  )}

                  <p
                    className={`mt-3 text-xs font-semibold ${
                      Number(product.stock) > 0
                        ? "text-emerald-600"
                        : "text-rose-600"
                    }`}
                  >
                    {Number(product.stock) > 0
                      ? "In Stock"
                      : "Out of Stock"}
                  </p>

                  <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-sm font-semibold text-sky-600">
                    View details
                    <ArrowRight
                      size={17}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
            <PackageSearch
              size={48}
              className="mx-auto text-slate-300"
            />

            <h2 className="mt-5 text-xl font-bold text-[#142D4E]">
              No products found
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              {category
                ? `There are currently no products in ${category}.`
                : "No products have been added yet."}
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-semibold text-white hover:bg-sky-700"
            >
              View all products
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </div>
    </main>
  );
};

export default Product;
