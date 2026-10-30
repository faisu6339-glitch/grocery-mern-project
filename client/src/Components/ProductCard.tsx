
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  ShoppingCart,
  Star,
  Eye,
  Check,
  ImageOff,
} from "lucide-react";

export interface Product {
  _id: string;
  name: string;
  slug?: string;
  description?: string;
  image?: string;
  images?: string[];
  price: number;
  originalPrice?: number;
  rating?: number;
  numReviews?: number;
  category?: string;
  brand?: string;
  stock?: number;
  isNew?: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(price);

const ProductCard = ({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: ProductCardProps) => {
  const [imageError, setImageError] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const image = product.image || product.images?.[0];
  const rating = Math.min(5, Math.max(0, product.rating ?? 0));
  const stock = product.stock ?? 0;
  const inStock = stock > 0;

  const discount =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(
          ((product.originalPrice - product.price) /
            product.originalPrice) *
            100
        )
      : 0;

  const productUrl = `/products/${product.slug || product._id}`;

  const handleAddToCart = () => {
    if (!inStock || !onAddToCart) return;

    onAddToCart(product);
    setAddedToCart(true);

    window.setTimeout(() => {
      setAddedToCart(false);
    }, 1500);
  };

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white transition duration-300 hover:-translate-y-1 hover:border-[#087EBC]/40 hover:shadow-xl">
      {/* Image section */}
      <div className="relative overflow-hidden bg-[#F7F9FC]">
        <Link
          to={productUrl}
          aria-label={`View ${product.name}`}
          className="flex aspect-square items-center justify-center p-5"
        >
          {image && !imageError ? (
            <img
              src={image}
              alt={product.name}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageOff size={42} strokeWidth={1.3} />
              <span className="text-xs">Image unavailable</span>
            </div>
          )}
        </Link>

        {/* Discount and new badges */}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-2">
          {discount > 0 && (
            <span className="rounded-md bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
              -{discount}%
            </span>
          )}

          {product.isNew && (
            <span className="rounded-md bg-[#087EBC] px-2.5 py-1 text-xs font-bold text-white">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          type="button"
          aria-label={
            isWishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          aria-pressed={isWishlisted}
          onClick={() => onToggleWishlist?.(product)}
          className={`absolute right-3 top-3 flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm transition hover:scale-105 ${
            isWishlisted
              ? "text-red-500"
              : "text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart
            size={19}
            fill={isWishlisted ? "currentColor" : "none"}
          />
        </button>

        {/* Quick view */}
        <Link
          to={productUrl}
          aria-label={`View details for ${product.name}`}
          className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-white text-[#142D4E] opacity-0 shadow-md transition duration-300 hover:bg-[#087EBC] hover:text-white group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
        >
          <Eye size={19} />
        </Link>
      </div>

      {/* Product details */}
      <div className="flex flex-1 flex-col p-4">
        {product.category && (
          <p className="mb-1 text-xs font-medium uppercase tracking-wide text-[#087EBC]">
            {product.category}
          </p>
        )}

        {product.brand && (
          <p className="mb-1 text-xs text-gray-500">{product.brand}</p>
        )}

        <Link to={productUrl}>
          <h3 className="line-clamp-2 min-h-12 text-sm font-bold leading-6 text-[#142D4E] transition hover:text-[#087EBC] sm:text-base">
            {product.name}
          </h3>
        </Link>

        {/* Rating */}
        <div className="mt-2 flex items-center gap-1.5">
          <div
            className="flex items-center gap-0.5"
            aria-label={`Rating ${rating} out of 5`}
          >
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                size={13}
                fill={star <= Math.round(rating) ? "#F59E0B" : "none"}
                className={
                  star <= Math.round(rating)
                    ? "text-amber-500"
                    : "text-gray-300"
                }
              />
            ))}
          </div>

          <span className="text-xs text-gray-500">
            {product.rating != null ? rating.toFixed(1) : "No ratings"}
            {product.numReviews != null && ` (${product.numReviews})`}
          </span>
        </div>

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-baseline gap-2">
          <span className="text-lg font-extrabold text-[#142D4E]">
            {formatPrice(product.price)}
          </span>

          {discount > 0 && product.originalPrice != null && (
            <span className="text-xs text-gray-400 line-through">
              {formatPrice(product.originalPrice)}
            </span>
          )}
        </div>

        {/* Stock status */}
        <div className="mt-2">
          {inStock ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
              <Check size={13} />
              In stock
            </span>
          ) : (
            <span className="text-xs font-medium text-red-600">
              Out of stock
            </span>
          )}
        </div>

        {/* Add to cart */}
        <button
          type="button"
          disabled={!inStock || !onAddToCart}
          onClick={handleAddToCart}
          className={`mt-auto flex w-full items-center justify-center gap-2 rounded-lg px-3 py-3 text-sm font-bold transition ${
            !inStock || !onAddToCart
              ? "mt-4 cursor-not-allowed bg-gray-100 text-gray-400"
              : addedToCart
                ? "mt-4 bg-green-600 text-white"
                : "mt-4 bg-[#142D4E] text-white hover:bg-[#087EBC]"
          }`}
        >
          {addedToCart ? (
            <>
              <Check size={17} />
              Added to Cart
            </>
          ) : (
            <>
              <ShoppingCart size={17} />
              {!inStock
                ? "Out of Stock"
                : onAddToCart
                  ? "Add to Cart"
                  : "Cart Unavailable"}
            </>
          )}
        </button>
      </div>
    </article>
  );
};

export default ProductCard;
