
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Package,
  ShoppingBag,
  RefreshCw,
  ArrowRight,
  CalendarDays,
  Truck,
  CreditCard,
  CircleCheck,
  Clock,
  XCircle,
} from "lucide-react";

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

interface OrderItem {
  product?: string;
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  _id: string;
  orderId: string;
  customerId?: string;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    addressLine: string;
    city: string;
    state: string;
    postalCode: string;
    landmark?: string;
  };
  createdAt: string;
}

const formatPrice = (price: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(price);

const formatDate = (date: string) =>
  new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getStatusStyle = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700";
    case "cancelled":
      return "bg-red-100 text-red-700";
    case "shipped":
      return "bg-blue-100 text-blue-700";
    case "processing":
    case "confirmed":
      return "bg-amber-100 text-amber-700";
    default:
      return "bg-sky-100 text-sky-700";
  }
};

const MyOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const token =
        localStorage.getItem("token") ||
        localStorage.getItem("authToken");

      if (!token) {
        setError("Please log in to view your orders.");
        return;
      }

      const response = await axios.get(
        `${API_URL}/orders/my-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders(response.data.orders || []);
    } catch (err) {
      console.error("Fetch my orders error:", err);

      if (axios.isAxiosError(err)) {
        if (
          err.response?.status === 401 ||
          err.response?.status === 403
        ) {
          setError("Your session has expired. Please log in again.");
        } else {
          setError(
            err.response?.data?.message ||
              "Unable to load your orders."
          );
        }
      } else {
        setError("Something went wrong while loading orders.");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <RefreshCw
            size={38}
            className="mx-auto animate-spin text-[#087EBC]"
          />
          <p className="mt-4 font-semibold text-[#142D4E]">
            Loading your orders...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-[60vh] bg-gray-50 px-4 py-16">
        <div className="mx-auto max-w-xl rounded-2xl bg-white p-8 text-center shadow-sm">
          <XCircle size={48} className="mx-auto text-red-500" />

          <h1 className="mt-4 text-2xl font-bold text-[#142D4E]">
            Unable to Load Orders
          </h1>

          <p className="mt-3 text-gray-600">{error}</p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={fetchOrders}
              className="inline-flex items-center gap-2 rounded-lg bg-[#087EBC] px-5 py-3 font-semibold text-white hover:bg-[#06699D]"
            >
              <RefreshCw size={17} />
              Try Again
            </button>

            <Link
              to="/login"
              className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-[#142D4E]"
            >
              Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-6xl">
        {/* Page heading */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-[#142D4E]">
              My Orders
            </h1>

            <p className="mt-2 text-gray-500">
              Track your purchases and view order details.
            </p>
          </div>

          <button
            type="button"
            onClick={fetchOrders}
            className="inline-flex items-center justify-center gap-2 self-start rounded-lg border border-gray-300 bg-white px-4 py-3 font-semibold text-[#142D4E] hover:bg-gray-100 sm:self-auto"
          >
            <RefreshCw size={17} />
            Refresh Orders
          </button>
        </div>

        {/* Empty state */}
        {orders.length === 0 ? (
          <div className="mt-10 rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
            <ShoppingBag
              size={58}
              className="mx-auto text-gray-300"
            />

            <h2 className="mt-5 text-2xl font-bold text-[#142D4E]">
              No Orders Yet
            </h2>

            <p className="mt-3 text-gray-500">
              Your orders will appear here after you place an order.
            </p>

            <Link
              to="/products"
              className="mt-7 inline-flex items-center gap-2 rounded-lg bg-[#087EBC] px-6 py-3 font-bold text-white hover:bg-[#06699D]"
            >
              Start Shopping
              <ArrowRight size={18} />
            </Link>
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            <div className="rounded-xl border border-sky-100 bg-sky-50 p-4">
              <p className="font-semibold text-[#142D4E]">
                You have {orders.length} order(s).
              </p>
            </div>

            {orders.map((order) => (
              <article
                key={order._id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
              >
                {/* Order header */}
                <div className="flex flex-col justify-between gap-4 border-b border-gray-100 p-5 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-sm text-gray-500">
                      Order ID
                    </p>

                    <h2 className="mt-1 break-all text-lg font-extrabold text-[#142D4E]">
                      {order.orderId || order._id}
                    </h2>

                    <p className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                      <CalendarDays size={16} />
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-2 text-sm font-bold capitalize ${getStatusStyle(
                        order.status || "placed"
                      )}`}
                    >
                      {order.status === "delivered" ? (
                        <CircleCheck size={16} />
                      ) : order.status === "cancelled" ? (
                        <XCircle size={16} />
                      ) : (
                        <Clock size={16} />
                      )}

                      {order.status || "placed"}
                    </span>

                    <Link
                      to={`/orders/${encodeURIComponent(
                        order.orderId || order._id
                      )}`}
                      className="inline-flex items-center gap-1 font-semibold text-[#087EBC] hover:underline"
                    >
                      View Details
                      <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                {/* Ordered products */}
                <div className="space-y-4 p-5">
                  {order.items.map((item, index) => (
                    <div
                      key={`${item.productId}-${index}`}
                      className="flex flex-col gap-3 sm:flex-row sm:items-center"
                    >
                      <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-gray-50">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full rounded-xl object-contain"
                          />
                        ) : (
                          <Package
                            size={30}
                            className="text-gray-400"
                          />
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-[#142D4E]">
                          {item.name}
                        </h3>

                        <p className="mt-1 text-sm text-gray-500">
                          Product ID: {item.productId}
                        </p>

                        <p className="mt-1 text-sm text-gray-600">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>

                      <p className="font-bold text-[#142D4E]">
                        {formatPrice(
                          item.subtotal ??
                            item.price * item.quantity
                        )}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Delivery and payment */}
                <div className="grid gap-5 border-t border-gray-100 bg-gray-50 p-5 md:grid-cols-2">
                  <div>
                    <h3 className="flex items-center gap-2 font-bold text-[#142D4E]">
                      <Truck size={18} />
                      Delivery Address
                    </h3>

                    <div className="mt-3 space-y-1 text-sm leading-6 text-gray-600">
                      <p className="font-semibold text-gray-800">
                        {order.shippingAddress?.fullName}
                      </p>

                      <p>{order.shippingAddress?.phone}</p>
                      <p>{order.shippingAddress?.addressLine}</p>

                      <p>
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.state} -{" "}
                        {order.shippingAddress?.postalCode}
                      </p>

                      {order.shippingAddress?.landmark && (
                        <p>
                          Landmark: {order.shippingAddress.landmark}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="flex items-center gap-2 font-bold text-[#142D4E]">
                      <CreditCard size={18} />
                      Payment Details
                    </h3>

                    <div className="mt-3 space-y-3 text-sm">
                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Subtotal
                        </span>
                        <span>{formatPrice(order.subtotal)}</span>
                      </div>

                      <div className="flex justify-between gap-3">
                        <span className="text-gray-500">
                          Shipping
                        </span>
                        <span>
                          {order.shippingFee === 0
                            ? "Free"
                            : formatPrice(order.shippingFee)}
                        </span>
                      </div>

                      <div className="flex justify-between gap-3 border-t border-gray-200 pt-3 font-extrabold text-[#142D4E]">
                        <span>Total</span>
                        <span>{formatPrice(order.totalAmount)}</span>
                      </div>

                      <p className="text-gray-600">
                        Method: {order.paymentMethod || "COD"}
                      </p>

                      <p className="text-gray-600">
                        Payment: {order.paymentStatus || "pending"}
                      </p>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
};

export default MyOrders;
