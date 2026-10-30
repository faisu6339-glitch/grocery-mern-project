import { useEffect, useState } from "react";
import axios from "axios";
import { ArrowRight, Flame, PackageSearch } from "lucide-react";
import { Link } from "react-router-dom";

import ProductCard, { type Product } from "../ProductCard";
import { useCart } from "../../Context/CartContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const PopularProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { addToCart } = useCart();

  useEffect(() => {
    const controller = new AbortController();

    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(false);

        const response = await axios.get(`${API_URL}/products/featured`, {
          params: { limit: 8 },
          signal: controller.signal,
        });

        let items = Array.isArray(response.data?.products)
          ? response.data.products
          : [];

        // Older catalog entries may not have isFeatured set. Keep the section
        // useful by showing the newest products when there are no featured ones.
        if (items.length === 0) {
          const fallback = await axios.get(`${API_URL}/products`, {
            params: { limit: 8 },
            signal: controller.signal,
          });
          items = Array.isArray(fallback.data?.products)
            ? fallback.data.products
            : [];
        }

        setProducts(items);
      } catch (requestError) {
        if (controller.signal.aborted) return;
        console.error("Popular products error:", requestError);
        setError(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    };

    void loadProducts();
    return () => controller.abort();
  }, []);

  return (
    <section className="bg-[#FAF7F2] py-14 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-orange-700">
              <Flame size={14} />
              Customer favorites
            </span>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[#142D4E] sm:text-3xl lg:text-4xl">
              Popular Products
            </h2>
            <p className="mt-2 text-sm text-gray-600 sm:text-base">
              Explore our featured products selected for you.
            </p>
          </div>
          <Link
            to="/products"
            className="inline-flex w-fit items-center gap-2 font-semibold text-[#087EBC] transition hover:text-[#142D4E]"
          >
            View all products <ArrowRight size={18} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="h-72 animate-pulse rounded-2xl bg-white shadow-sm" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white px-6 py-10 text-center text-gray-600 shadow-sm">
            <PackageSearch className="mx-auto mb-3 text-gray-400" size={36} />
            <p>Popular products could not be loaded. Please try again later.</p>
          </div>
        ) : products.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-10 text-center text-gray-600 shadow-sm">
            <PackageSearch className="mx-auto mb-3 text-gray-400" size={36} />
            <p>Popular products are coming soon.</p>
            <p className="mt-1 text-sm">Featured items will appear here when available.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} onAddToCart={addToCart} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default PopularProducts;
