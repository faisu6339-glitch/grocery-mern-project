
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  Package,
} from "lucide-react";

import { useCart } from "../Context/CartContext";

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);

const Cart = () => {
  const navigate = useNavigate();

  const {
    cartItems,
    removeFromCart,
    updateQuantity,
    cartCount,
    cartTotal,
  } = useCart();

  const [checkingOut, setCheckingOut] = useState(false);

  const shippingFee = cartTotal >= 2000 ? 0 : 99;
  const grandTotal = cartTotal + shippingFee;

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }

    if (checkingOut) return;

    setCheckingOut(true);

    try {
      navigate("/checkout");
    } catch (error) {
      console.error("Checkout navigation error:", error);
      toast.error("Unable to open checkout. Please try again.");
      setCheckingOut(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold text-[#142D4E]">
          Shopping Cart
        </h1>

        <p className="mb-8 text-gray-500">
          {cartCount} item(s) in your cart
        </p>

        {cartItems.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
            <ShoppingCart
              className="mx-auto mb-4 text-gray-400"
              size={52}
            />

            <h2 className="text-xl font-bold text-[#142D4E]">
              Your cart is empty
            </h2>

            <p className="mt-2 text-gray-500">
              Add some appliances to get started.
            </p>

            <Link
              to="/products"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#142D4E] px-5 py-3 font-semibold text-white hover:bg-[#087EBC]"
            >
              Continue Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="grid items-start gap-8 lg:grid-cols-3">
            {/* Cart items */}
            <section
              className="space-y-4 lg:col-span-2"
              aria-label="Cart items"
            >
              {cartItems.map(({ product, quantity }) => {
                const stock = Math.max(
                  0,
                  Number(product.stock) || 0
                );

                return (
                  <article
                    key={product._id}
                    className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center"
                  >
                    <Link
                      to={`/products/${product._id}`}
                      className="flex h-28 w-28 shrink-0 items-center justify-center rounded-xl bg-gray-50"
                    >
                      {product.image || product.images?.[0] ? (
                        <img
                          src={
                            product.image ||
                            product.images?.[0] ||
                            ""
                          }
                          alt={product.name}
                          className="h-full w-full rounded-xl object-contain"
                        />
                      ) : (
                        <Package
                          size={36}
                          className="text-gray-400"
                        />
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/products/${product._id}`}
                        className="font-bold text-[#142D4E] hover:text-[#087EBC]"
                      >
                        {product.name}
                      </Link>

                      <p className="mt-2 font-semibold text-gray-800">
                        {formatPrice(product.price)}
                      </p>

                      {stock === 0 && (
                        <p className="mt-1 text-sm text-red-600">
                          Currently out of stock
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap items-center gap-3">
                        {/* Quantity controls */}
                        <div className="flex items-center rounded-lg border border-gray-300">
                          <button
                            type="button"
                            aria-label={`Decrease quantity of ${product.name}`}
                            disabled={quantity <= 1}
                            onClick={() =>
                              updateQuantity(
                                product._id,
                                quantity - 1
                              )
                            }
                            className="p-2 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-8 text-center">
                            {quantity}
                          </span>

                          <button
                            type="button"
                            aria-label={`Increase quantity of ${product.name}`}
                            disabled={quantity >= stock}
                            onClick={() =>
                              updateQuantity(
                                product._id,
                                quantity + 1
                              )
                            }
                            className="p-2 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            removeFromCart(product._id)
                          }
                          className="inline-flex items-center gap-1 text-sm text-red-600 hover:text-red-800"
                        >
                          <Trash2 size={16} />
                          Remove
                        </button>
                      </div>
                    </div>

                    <p className="font-bold text-[#142D4E] sm:text-right">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </article>
                );
              })}
            </section>

            {/* Order summary */}
            <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="mb-5 text-xl font-bold text-[#142D4E]">
                Order Summary
              </h2>

              <div className="flex justify-between gap-3 text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              <div className="mt-3 flex justify-between gap-3 text-gray-600">
                <span>Shipping</span>
                <span className="font-medium">
                  {shippingFee === 0
                    ? "Free"
                    : formatPrice(shippingFee)}
                </span>
              </div>

              {cartTotal < 2000 && (
                <p className="mt-3 text-xs text-gray-500">
                  Add {formatPrice(2000 - cartTotal)} more for free
                  shipping.
                </p>
              )}

              <div className="my-5 border-t" />

              <div className="flex justify-between gap-3 text-lg font-bold text-[#142D4E]">
                <span>Total</span>
                <span>{formatPrice(grandTotal)}</span>
              </div>

              <button
                type="button"
                onClick={handleCheckout}
                disabled={checkingOut || cartItems.length === 0}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-4 py-3 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {checkingOut
                  ? "Opening Checkout..."
                  : "Proceed to Checkout"}

                {!checkingOut && <ArrowRight size={18} />}
              </button>

              <Link
                to="/products"
                className="mt-4 block text-center text-sm text-gray-500 hover:text-[#087EBC]"
              >
                Continue Shopping
              </Link>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
