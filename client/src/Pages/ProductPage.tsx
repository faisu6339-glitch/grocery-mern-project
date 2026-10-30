
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { useCart } from "../Context/CartContext";
import type { Product } from "../Components/ProductCard";
import {
  ArrowLeft,
  ShoppingCart,
  ShieldCheck,
  Truck,
  Package,
  Star,
  ChevronRight,
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
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const formatPrice = (value: number) =>
  `₹${Number(value || 0).toLocaleString("en-IN")}`;

const normalize = (value?: string) =>
  (value || "").trim().toLowerCase();

const ProductPage = () => {
  const { id } = useParams<{ id: string }>();

  // Hooks must be called inside the component, at its top level.
  const { addToCart, cartItems } = useCart();

  const [product, setProduct] = useState<ProductItem | null>(null);
  const [similarProducts, setSimilarProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const controller = new AbortController();

    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError("");
        setProduct(null);
        setSimilarProducts([]);

        if (!id) {
          setError("Invalid product ID.");
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_URL}/products`, {
          signal: controller.signal,
        });

        const products: ProductItem[] = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.products)
            ? response.data.products
            : [];

        const currentProduct = products.find((item) => item._id === id);

        if (!currentProduct) {
          setError("Product not found.");
          return;
        }

        setProduct(currentProduct);
        setQuantity(1);

        const related = products
          .filter(
            (item) =>
              item._id !== currentProduct._id &&
              normalize(item.category) === normalize(currentProduct.category)
          )
          .sort((a, b) => {
            const currentBrand = normalize(currentProduct.brand);
            const aSameBrand =
              currentBrand !== "" && normalize(a.brand) === currentBrand;
            const bSameBrand =
              currentBrand !== "" && normalize(b.brand) === currentBrand;

            if (aSameBrand === bSameBrand) return 0;
            return aSameBrand ? -1 : 1;
          })
          .slice(0, 8);

        setSimilarProducts(related);
      } catch (err) {
        if (controller.signal.aborted) return;

        console.error("Product details error:", err);
        setError("Unable to load product details. Please try again.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchProduct();

    return () => controller.abort();
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-[60vh] bg-[#FAF7F2] px-4 py-20 text-center">
        <p className="text-lg font-semibold text-[#142D4E]">
          Loading product details...
        </p>
      </main>
    );
  }

  if (error || !product) {
    return (
      <main className="min-h-[60vh] bg-[#FAF7F2] px-4 py-20 text-center">
        <Package size={48} className="mx-auto text-slate-400" />

        <h1 className="mt-4 text-2xl font-bold text-[#142D4E]">
          {error || "Product not found"}
        </h1>

        <Link
          to="/products"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-3 font-bold text-white"
        >
          <ArrowLeft size={18} />
          Back to Products
        </Link>
      </main>
    );
  }

  const price = Number(product.price) || 0;
  const originalPrice = Number(product.originalPrice) || 0;
  const stock = Math.max(0, Number(product.stock) || 0);

  const discount =
    originalPrice > price
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : Number(product.discount) || 0;

  const existingCartQuantity =
    cartItems.find((item) => item.product._id === product._id)?.quantity || 0;

  const remainingStock = Math.max(0, stock - existingCartQuantity);
  const canAddQuantity = quantity <= remainingStock && remainingStock > 0;

  const handleAddToCart = () => {
    if (stock <= 0) {
      toast.error("This product is out of stock.");
      return;
    }

    if (quantity > remainingStock) {
      toast.error(
        remainingStock > 0
          ? `Only ${remainingStock} more item(s) can be added.`
          : "You already have the maximum available stock in your cart."
      );
      return;
    }

    // Use the existing CartContext function for the selected quantity.
    for (let i = 0; i < quantity; i++) {
      addToCart(product as Product);
    }

    toast.success(
      `${quantity} ${quantity === 1 ? "item" : "items"} added to cart!`
    );
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Breadcrumb */}
        <nav className="mb-8 flex flex-wrap items-center gap-2 text-sm text-slate-500">
          <Link to="/" className="hover:text-sky-600">
            Home
          </Link>

          <ChevronRight size={15} />

          <Link
            to={`/products?category=${encodeURIComponent(product.category)}`}
            className="hover:text-sky-600"
          >
            {product.category}
          </Link>

          <ChevronRight size={15} />

          <span className="font-medium text-[#142D4E]">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Product Image */}
          <div className="relative flex min-h-[320px] items-center justify-center rounded-3xl border border-slate-200 bg-white p-6 sm:min-h-[520px] sm:p-10">
            {discount > 0 && (
              <span className="absolute left-5 top-5 rounded-lg bg-rose-500 px-3 py-2 text-sm font-bold text-white">
                {discount}% OFF
              </span>
            )}

            <img
              src={product.image || "/placeholder.png"}
              alt={product.name}
              className="max-h-[480px] w-full object-contain"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = "/placeholder.png";
              }}
            />
          </div>

          {/* Product Information */}
          <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
              {product.brand || product.category}
            </p>

            <h1 className="mt-3 text-3xl font-extrabold leading-tight text-[#142D4E] sm:text-4xl">
              {product.name}
            </h1>

            {product.productId && (
              <p className="mt-3 text-sm text-slate-400">
                Product ID: {product.productId}
              </p>
            )}

            {Number(product.rating) > 0 && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Star
                  size={18}
                  className="fill-amber-400 text-amber-400"
                />
                <span className="font-semibold text-[#142D4E]">
                  {product.rating}
                </span>
                <span className="text-slate-500">
                  ({product.reviews || 0} reviews)
                </span>
              </div>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-extrabold text-[#142D4E]">
                {formatPrice(price)}
              </span>

              {originalPrice > price && (
                <>
                  <span className="text-lg text-slate-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>

                  <span className="rounded-lg bg-emerald-50 px-2 py-1 text-sm font-bold text-emerald-700">
                    Save {formatPrice(originalPrice - price)}
                  </span>
                </>
              )}
            </div>

            <div className="mt-6 border-t border-slate-100 pt-6">
              <h2 className="font-bold text-[#142D4E]">
                Product Description
              </h2>

              <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                {product.description || "No description available."}
              </p>
            </div>

            <div className="mt-6 space-y-3 text-sm">
              <p className="flex items-center gap-2 text-slate-600">
                <Package size={18} className="text-sky-600" />
                Category: {product.category}
                {product.subcategory ? ` / ${product.subcategory}` : ""}
              </p>

              <p
                className={`flex items-center gap-2 font-semibold ${
                  stock > 0 ? "text-emerald-600" : "text-rose-600"
                }`}
              >
                <ShieldCheck size={18} />
                {stock > 0 ? `${stock} available in stock` : "Out of stock"}
              </p>

              {existingCartQuantity > 0 && (
                <p className="text-sm text-slate-500">
                  Already in cart: {existingCartQuantity}
                </p>
              )}

              <p className="flex items-center gap-2 text-slate-600">
                <Truck size={18} className="text-sky-600" />
                Delivery options available at checkout
              </p>
            </div>

            {/* Quantity Selector */}
            <div className="mt-7 flex items-center gap-4">
              <span className="text-sm font-semibold text-[#142D4E]">
                Quantity
              </span>

              <div className="flex items-center rounded-xl border border-slate-200">
                <button
                  type="button"
                  aria-label="Decrease quantity"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-lg disabled:opacity-40"
                >
                  −
                </button>

                <span className="min-w-10 text-center font-semibold">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Increase quantity"
                  disabled={quantity >= remainingStock}
                  onClick={() =>
                    setQuantity((q) => Math.min(remainingStock, q + 1))
                  }
                  className="px-4 py-2 text-lg disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              type="button"
              disabled={!canAddQuantity}
              onClick={handleAddToCart}
              className="mt-7 flex w-full items-center justify-center gap-3 rounded-xl bg-[#087EBC] px-6 py-4 font-bold text-white transition hover:bg-[#06699D] disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              <ShoppingCart size={20} />
              {stock <= 0
                ? "Out of Stock"
                : remainingStock <= 0
                  ? "Maximum Stock in Cart"
                  : "Add to Cart"}
            </button>

            <p className="mt-4 text-center text-xs text-slate-500">
              Secure shopping · Product ID verified by the store
            </p>
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts.length > 0 && (
          <section className="mt-16 border-t border-slate-200 pt-10 sm:mt-20">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-sky-600">
                  You may also like
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-[#142D4E] sm:text-3xl">
                  Similar Products
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Explore more products from {product.category}.
                </p>
              </div>

              <Link
                to={`/products?category=${encodeURIComponent(product.category)}`}
                className="inline-flex items-center gap-1 font-semibold text-[#087EBC] hover:underline"
              >
                View All <ChevronRight size={18} />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {similarProducts.map((item) => {
                const itemPrice = Number(item.price) || 0;
                const itemOriginalPrice = Number(item.originalPrice) || 0;

                const itemDiscount =
                  itemOriginalPrice > itemPrice
                    ? Math.round(
                        ((itemOriginalPrice - itemPrice) /
                          itemOriginalPrice) *
                          100
                      )
                    : Number(item.discount) || 0;

                return (
                  <article
                    key={item._id}
                    className="group overflow-hidden rounded-2xl border border-slate-200 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link
                      to={`/products/${item._id}`}
                      className="relative flex h-52 items-center justify-center bg-white p-5"
                    >
                      {itemDiscount > 0 && (
                        <span className="absolute left-3 top-3 z-10 rounded-md bg-rose-500 px-2 py-1 text-xs font-bold text-white">
                          {itemDiscount}% OFF
                        </span>
                      )}

                      <img
                        src={item.image || "/placeholder.png"}
                        alt={item.name}
                        loading="lazy"
                        className="h-full w-full object-contain transition duration-300 group-hover:scale-105"
                      />
                    </Link>

                    <div className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-sky-600">
                        {item.brand || item.category}
                      </p>

                      <Link to={`/products/${item._id}`}>
                        <h3 className="mt-2 line-clamp-2 min-h-12 font-bold text-[#142D4E] transition hover:text-sky-600">
                          {item.name}
                        </h3>
                      </Link>

                      {Number(item.rating) > 0 && (
                        <div className="mt-2 flex items-center gap-1 text-sm text-slate-600">
                          <Star
                            size={15}
                            className="fill-amber-400 text-amber-400"
                          />
                          <span>{item.rating}</span>
                          <span className="text-slate-400">
                            ({item.reviews || 0})
                          </span>
                        </div>
                      )}

                      <div className="mt-4 flex items-center justify-between gap-2">
                        <div>
                          <p className="font-extrabold text-[#142D4E]">
                            {formatPrice(itemPrice)}
                          </p>

                          {itemOriginalPrice > itemPrice && (
                            <p className="text-xs text-slate-400 line-through">
                              {formatPrice(itemOriginalPrice)}
                            </p>
                          )}
                        </div>

                        <Link
                          to={`/products/${item._id}`}
                          aria-label={`View ${item.name}`}
                          className="rounded-xl bg-[#087EBC] p-3 text-white transition hover:bg-[#06699D]"
                        >
                          <ChevronRight size={20} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </main>
  );
};

export default ProductPage;
