import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  MapPin,
  Package,
  ShieldCheck,
  Truck,
  CreditCard,
  CheckCircle,
  LoaderCircle,
} from "lucide-react";

import { useCart } from "../Context/CartContext";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);

interface ShippingAddress {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  postalCode: string;
  landmark: string;
}

const CheckOut = () => {
  const navigate = useNavigate();

  const { cartItems, cartTotal, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("COD");

  const [shippingAddress, setShippingAddress] =
    useState<ShippingAddress>({
      fullName: "",
      phone: "",
      addressLine: "",
      city: "",
      state: "",
      postalCode: "",
      landmark: "",
    });

  const shippingFee = cartTotal >= 2000 ? 0 : 99;
  const totalAmount = cartTotal + shippingFee;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    setShippingAddress((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handlePlaceOrder = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      navigate("/products");
      return;
    }

    const requiredFields: (keyof ShippingAddress)[] = [
      "fullName",
      "phone",
      "addressLine",
      "city",
      "state",
      "postalCode",
    ];

    const missingField = requiredFields.find(
      (field) => !shippingAddress[field].trim()
    );

    if (missingField) {
      toast.error("Please complete all required delivery details.");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(shippingAddress.phone.trim())) {
      toast.error("Enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(shippingAddress.postalCode.trim())) {
      toast.error("Enter a valid 6-digit PIN code.");
      return;
    }

    if (paymentMethod !== "COD") {
      toast.error("Currently, only Cash on Delivery is supported.");
      return;
    }

    // Use the same token key that your login flow stores.
    const token =
      localStorage.getItem("token") ||
      localStorage.getItem("authToken");

    if (!token) {
      toast.error("Please log in before placing your order.");
      navigate("/login", {
        state: { from: "/checkout" },
      });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        items: cartItems.map(({ product, quantity }) => ({
          productId: product._id,
          quantity,
        })),
        shippingAddress: {
          ...shippingAddress,
          fullName: shippingAddress.fullName.trim(),
          phone: shippingAddress.phone.trim(),
          addressLine: shippingAddress.addressLine.trim(),
          city: shippingAddress.city.trim(),
          state: shippingAddress.state.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          landmark: shippingAddress.landmark.trim(),
        },
        paymentMethod: "COD",
      };

      const response = await axios.post(
        `${API_URL}/orders`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const order = response.data.order || response.data;

      // Clear the cart only after the backend confirms success.
      clearCart();

      toast.success("Your order has been placed successfully!");

      navigate("/orders", {
        replace: true,
        state: {
          orderId: order.orderId || order._id,
        },
      });
    } catch (error) {
      console.error("Place order error:", error);

      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const message = error.response?.data?.message;

        if (status === 401 || status === 403) {
          toast.error("Your session may have expired. Please log in again.");
          navigate("/login", {
            state: { from: "/checkout" },
          });
        } else {
          toast.error(
            message || "Unable to place your order. Please try again."
          );
        }
      } else {
        toast.error("Something went wrong while placing your order.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <main className="min-h-[65vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <Package size={52} className="mx-auto text-gray-400" />

          <h1 className="mt-4 text-2xl font-bold text-[#142D4E]">
            Your cart is empty
          </h1>

          <p className="mt-2 text-gray-500">
            Add products to your cart before checking out.
          </p>

          <Link
            to="/products"
            className="mt-6 inline-flex rounded-lg bg-[#087EBC] px-6 py-3 font-bold text-white hover:bg-[#06699D]"
          >
            Continue Shopping
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 sm:px-8">
      <div className="mx-auto max-w-7xl">
        <Link
          to="/cart"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#087EBC] hover:underline"
        >
          <ArrowLeft size={18} />
          Back to Cart
        </Link>

        <h1 className="text-3xl font-extrabold text-[#142D4E]">
          Checkout
        </h1>

        <p className="mt-2 text-gray-500">
          Enter your delivery details to place your order.
        </p>

        <form
          onSubmit={handlePlaceOrder}
          className="mt-8 grid items-start gap-8 lg:grid-cols-3"
        >
          {/* Delivery details */}
          <section className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-sky-50 p-3 text-[#087EBC]">
                  <MapPin size={23} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#142D4E]">
                    Delivery Address
                  </h2>
                  <p className="text-sm text-gray-500">
                    Where should we deliver your order?
                  </p>
                </div>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label
                    htmlFor="fullName"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Full Name *
                  </label>

                  <input
                    id="fullName"
                    name="fullName"
                    autoComplete="name"
                    value={shippingAddress.fullName}
                    onChange={handleChange}
                    placeholder="Enter recipient's full name"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none transition focus:border-[#087EBC] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Mobile Number *
                  </label>

                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    value={shippingAddress.phone}
                    onChange={handleChange}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#087EBC] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="postalCode"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    PIN Code *
                  </label>

                  <input
                    id="postalCode"
                    name="postalCode"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={shippingAddress.postalCode}
                    onChange={handleChange}
                    placeholder="6-digit PIN code"
                    maxLength={6}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#087EBC] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="addressLine"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    House No., Street and Area *
                  </label>

                  <textarea
                    id="addressLine"
                    name="addressLine"
                    autoComplete="street-address"
                    value={shippingAddress.addressLine}
                    onChange={handleChange}
                    placeholder="House number, street, locality"
                    rows={3}
                    maxLength={300}
                    required
                    className="w-full resize-y rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#087EBC] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="city"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    City *
                  </label>

                  <input
                    id="city"
                    name="city"
                    autoComplete="address-level2"
                    value={shippingAddress.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#087EBC] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="state"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    State *
                  </label>

                  <input
                    id="state"
                    name="state"
                    autoComplete="address-level1"
                    value={shippingAddress.state}
                    onChange={handleChange}
                    placeholder="Enter state"
                    maxLength={100}
                    required
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#087EBC] focus:ring-2 focus:ring-sky-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="landmark"
                    className="mb-2 block text-sm font-semibold text-gray-700"
                  >
                    Landmark (Optional)
                  </label>

                  <input
                    id="landmark"
                    name="landmark"
                    value={shippingAddress.landmark}
                    onChange={handleChange}
                    placeholder="Nearby shop, school, or landmark"
                    maxLength={150}
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-[#087EBC] focus:ring-2 focus:ring-sky-100"
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-700">
                  <CreditCard size={23} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#142D4E]">
                    Payment Method
                  </h2>
                  <p className="text-sm text-gray-500">
                    Choose how you want to pay.
                  </p>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-xl border-2 border-[#087EBC] bg-sky-50 p-4">
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === "COD"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mt-1 accent-[#087EBC]"
                />

                <div className="flex-1">
                  <p className="font-bold text-[#142D4E]">
                    Cash on Delivery (COD)
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Pay when your order arrives.
                  </p>
                </div>

                <CheckCircle className="text-[#087EBC]" size={21} />
              </label>

              <p className="mt-4 text-xs text-gray-500">
                Online payment is not enabled yet.
              </p>
            </div>
          </section>

          {/* Order summary */}
          <aside className="h-fit rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
            <h2 className="text-xl font-bold text-[#142D4E]">
              Order Summary
            </h2>

            <div className="mt-5 max-h-72 space-y-4 overflow-y-auto">
              {cartItems.map(({ product, quantity }) => (
                <div
                  key={product._id}
                  className="flex gap-3"
                >
                  <img
                    src={product.image || product.images?.[0] || ""}
                    alt={product.name}
                    className="h-16 w-16 shrink-0 rounded-lg bg-gray-50 object-contain"
                  />

                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-2 text-sm font-semibold text-[#142D4E]">
                      {product.name}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      Quantity: {quantity}
                    </p>

                    <p className="mt-1 text-sm font-bold">
                      {formatPrice(product.price * quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="my-5 border-t border-gray-200" />

            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-3 text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(cartTotal)}</span>
              </div>

              <div className="flex justify-between gap-3 text-gray-600">
                <span>Shipping</span>
                <span>
                  {shippingFee === 0 ? "Free" : formatPrice(shippingFee)}
                </span>
              </div>
            </div>

            <div className="my-5 border-t border-gray-200" />

            <div className="flex justify-between gap-3 text-lg font-extrabold text-[#142D4E]">
              <span>Total</span>
              <span>{formatPrice(totalAmount)}</span>
            </div>

            <button
              type="submit"
              disabled={loading || cartItems.length === 0}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-4 font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={20} className="animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} />
                  Place Order
                </>
              )}
            </button>

            <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-gray-500">
              <Truck size={17} className="mt-0.5 shrink-0" />
              <p>
                Your order details will be submitted securely to the store.
              </p>
            </div>

            <Link
              to="/cart"
              className="mt-5 block text-center text-sm font-medium text-gray-500 hover:text-[#087EBC]"
            >
              Return to Cart
            </Link>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default CheckOut;
