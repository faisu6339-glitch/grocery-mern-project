
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Package,
  Eye,
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  MapPin,
  Phone,
  Mail,
  User,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

type OrderStatus =
  | "placed"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

type Address = {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  street?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  zipCode?: string;
  pincode?: string;
  pinCode?: string;
  country?: string;
};

type OrderItem = {
  _id?: string;
  product?: {
    _id?: string;
    name?: string;
    productId?: string;
    image?: string;
  } | string | null;
  productId?: string;
  name?: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal?: number;
};

type Order = {
  _id: string;
  orderId?: string;
  customerId?: string;
  customer?: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  items: OrderItem[];
  shippingAddress?: Address | string;
  subtotal?: number;
  shippingFee?: number;
  totalAmount: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: OrderStatus;
  createdAt: string;
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const statuses: OrderStatus[] = [
  "placed",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusStyles: Record<OrderStatus, string> = {
  placed: "bg-blue-50 text-blue-700",
  confirmed: "bg-indigo-50 text-indigo-700",
  processing: "bg-amber-50 text-amber-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date?: string) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Safely retrieve the saved shipping address.
const getShippingAddress = (order: Order): Address | null => {
  const address = order.shippingAddress;

  if (address && typeof address === "object") {
    return address;
  }

  return null;
};

const getCustomerName = (order: Order) => {
  const address = getShippingAddress(order);

  return address?.name || order.customer?.name || "Customer";
};

const getCustomerEmail = (order: Order) => {
  const address = getShippingAddress(order);

  return address?.email || order.customer?.email || "Email unavailable";
};

const getCustomerPhone = (order: Order) => {
  const address = getShippingAddress(order);

  return address?.phone || order.customer?.phone || "Phone unavailable";
};

// Supports common address field names.
const getAddressText = (order: Order) => {
  const address = order.shippingAddress;

  if (!address) return "No shipping address saved";

  if (typeof address === "string") return address;

  const parts = [
    address.addressLine1,
    address.addressLine2,
    address.address,
    address.street,
    address.city,
    address.state,
    address.postalCode ||
      address.zipCode ||
      address.pincode ||
      address.pinCode,
    address.country,
  ];

  const uniqueParts = [...new Set(parts.filter(Boolean))];

  return uniqueParts.length
    ? uniqueParts.join(", ")
    : "Address details unavailable";
};

const getItemName = (item: OrderItem) => {
  if (item.name) return item.name;

  if (item.product && typeof item.product === "object") {
    return item.product.name || "Product";
  }

  return "Product";
};

const getItemImage = (item: OrderItem) => {
  if (item.image) return item.image;

  if (item.product && typeof item.product === "object") {
    return item.product.image || "";
  }

  return "";
};

const getItemProductId = (item: OrderItem) => {
  if (item.productId) return item.productId;

  if (item.product && typeof item.product === "object") {
    return item.product.productId || "";
  }

  return "";
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/admin/orders", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
          status: statusFilter,
        },
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Could not load orders");
      }

      setOrders(data.orders || []);

      setPagination(
        data.pagination || {
          page,
          limit: 10,
          total: (data.orders || []).length,
          totalPages: 1,
        }
      );
    } catch (error: any) {
      console.error("Fetch orders error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchOrders();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timeout);
  }, [fetchOrders, search]);

  const updateStatus = async (
    order: Order,
    newStatus: OrderStatus
  ) => {
    if (order.status === newStatus) return;

    if (
      newStatus === "cancelled" &&
      !window.confirm(
        `Are you sure you want to cancel order ${
          order.orderId || order._id
        }?`
      )
    ) {
      return;
    }

    setUpdatingId(order._id);

    try {
      const response = await api.patch(
        `/admin/orders/${encodeURIComponent(
          order.orderId || order._id
        )}/status`,
        { status: newStatus }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Could not update order"
        );
      }

      toast.success("Order status updated");

      if (selectedOrder?._id === order._id) {
        setSelectedOrder((current) =>
          current ? { ...current, status: newStatus } : current
        );
      }

      await fetchOrders();
    } catch (error: any) {
      console.error("Update order status error:", error);

      toast.error(
        error.response?.data?.message || "Failed to update status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const summary = [
    {
      label: "Total Orders",
      value: pagination.total,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Placed",
      value: orders.filter((order) => order.status === "placed").length,
      icon: Clock,
      color: "bg-amber-50 text-amber-600",
    },
    {
      label: "Delivered",
      value: orders.filter((order) => order.status === "delivered").length,
      icon: CheckCircle2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      label: "Shipped",
      value: orders.filter((order) => order.status === "shipped").length,
      icon: Truck,
      color: "bg-purple-50 text-purple-600",
    },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Orders
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage customer orders and track fulfillment.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchOrders()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-100 disabled:opacity-50"
        >
          <RefreshCw
            size={16}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.label}
              className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{item.label}</p>

                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${item.color}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Orders table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search order ID or customer..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => {
              setStatusFilter(event.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-blue-500"
          >
            <option value="all">All statuses</option>

            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Order</th>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Items</th>
                <th className="px-5 py-4 font-semibold">Total</th>
                <th className="px-5 py-4 font-semibold">Payment</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-16 text-center text-gray-500"
                  >
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-16 text-center">
                    <Package
                      className="mx-auto mb-3 text-gray-300"
                      size={36}
                    />

                    <p className="font-medium text-gray-700">
                      No orders found
                    </p>

                    <p className="mt-1 text-gray-500">
                      Try another search or status filter.
                    </p>
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50/70">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-gray-900">
                        {order.orderId ||
                          order._id.slice(-8).toUpperCase()}
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        {order._id.slice(-8)}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">
                        {getCustomerName(order)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {getCustomerEmail(order)}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {getCustomerPhone(order)}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {formatDate(order.createdAt)}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {order.items?.reduce(
                        (sum, item) =>
                          sum + Number(item.quantity || 0),
                        0
                      ) || 0}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-700">
                        {order.paymentMethod || "—"}
                      </p>

                      <p className="mt-1 text-xs capitalize text-gray-500">
                        {order.paymentStatus || "pending"}
                      </p>
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                          statusStyles[order.status] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {order.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedOrder(order)}
                          title="View order and customer address"
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100"
                        >
                          <Eye size={16} />
                        </button>

                        <select
                          aria-label={`Update status for ${
                            order.orderId || order._id
                          }`}
                          value={order.status}
                          disabled={
                            updatingId === order._id ||
                            order.status === "cancelled" ||
                            order.status === "delivered"
                          }
                          onChange={(event) =>
                            void updateStatus(
                              order,
                              event.target.value as OrderStatus
                            )
                          }
                          className="max-w-[140px] rounded-lg border border-gray-200 bg-white px-2 py-2 text-xs outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              {status.charAt(0).toUpperCase() +
                                status.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-col gap-3 border-t border-gray-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-500">
            Showing{" "}
            {orders.length
              ? (page - 1) * pagination.limit + 1
              : 0}
            {"–"}
            {(page - 1) * pagination.limit + orders.length} of{" "}
            {pagination.total} orders
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>

            <span className="px-2 text-sm text-gray-600">
              Page {page} of {Math.max(1, pagination.totalPages)}
            </span>

            <button
              type="button"
              disabled={
                loading ||
                pagination.totalPages === 0 ||
                page >= pagination.totalPages
              }
              onClick={() => setPage((current) => current + 1)}
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Order details modal */}
      {selectedOrder && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="order-dialog-title"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="order-dialog-title"
                  className="text-lg font-bold text-gray-900"
                >
                  Order details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedOrder.orderId || selectedOrder._id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                aria-label="Close order details"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {/* Customer information and full address */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <User size={18} className="text-blue-600" />

                    <h3 className="font-semibold text-gray-900">
                      Customer information
                    </h3>
                  </div>

                  <p className="font-semibold text-gray-900">
                    {getCustomerName(selectedOrder)}
                  </p>

                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                    <Mail
                      size={16}
                      className="mt-0.5 shrink-0 text-gray-400"
                    />

                    <span className="break-all">
                      {getCustomerEmail(selectedOrder)}
                    </span>
                  </div>

                  <div className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                    <Phone
                      size={16}
                      className="mt-0.5 shrink-0 text-gray-400"
                    />

                    <span>{getCustomerPhone(selectedOrder)}</span>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                  <div className="mb-4 flex items-center gap-2">
                    <MapPin size={18} className="text-blue-600" />

                    <h3 className="font-semibold text-gray-900">
                      Shipping address
                    </h3>
                  </div>

                  <p className="text-sm leading-6 text-gray-700">
                    {getAddressText(selectedOrder)}
                  </p>

                  {getShippingAddress(selectedOrder)?.phone && (
                    <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={15} className="shrink-0 text-gray-400" />

                      {getShippingAddress(selectedOrder)?.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="mb-3 font-semibold text-gray-900">
                  Ordered products
                </h3>

                <div className="divide-y divide-gray-100 rounded-xl border border-gray-100">
                  {selectedOrder.items?.map((item, index) => (
                    <div
                      key={item._id || `${getItemName(item)}-${index}`}
                      className="flex items-center gap-3 p-3 sm:gap-4 sm:p-4"
                    >
                      {getItemImage(item) ? (
                        <img
                          src={getItemImage(item)}
                          alt={getItemName(item)}
                          className="h-14 w-14 rounded-lg border border-gray-100 object-cover"
                        />
                      ) : (
                        <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-gray-100">
                          <Package size={22} className="text-gray-400" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900">
                          {getItemName(item)}
                        </p>

                        {getItemProductId(item) && (
                          <p className="mt-1 text-xs text-gray-500">
                            SKU: {getItemProductId(item)}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-gray-500">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>

                      <p className="whitespace-nowrap font-semibold text-gray-900">
                        {formatCurrency(
                          item.subtotal ??
                            Number(item.price) * Number(item.quantity)
                        )}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order totals */}
              <div className="rounded-xl border border-gray-100 p-4">
                <div className="flex justify-between py-1.5 text-sm text-gray-600">
                  <span>Subtotal</span>

                  <span>
                    {formatCurrency(
                      selectedOrder.subtotal ??
                        selectedOrder.items?.reduce(
                          (sum, item) =>
                            sum +
                            Number(item.price) * Number(item.quantity),
                          0
                        )
                    )}
                  </span>
                </div>

                <div className="flex justify-between py-1.5 text-sm text-gray-600">
                  <span>Shipping</span>

                  <span>
                    {formatCurrency(selectedOrder.shippingFee)}
                  </span>
                </div>

                <div className="mt-2 flex justify-between border-t border-gray-100 pt-3 text-base font-bold text-gray-900">
                  <span>Total</span>

                  <span>{formatCurrency(selectedOrder.totalAmount)}</span>
                </div>
              </div>

              {/* Payment and date */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Payment
                  </p>

                  <p className="mt-2 font-medium text-gray-800">
                    {selectedOrder.paymentMethod || "—"}
                  </p>

                  <p className="mt-1 text-sm capitalize text-gray-500">
                    Status: {selectedOrder.paymentStatus || "pending"}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Order date
                  </p>

                  <p className="mt-2 text-sm text-gray-700">
                    {formatDate(selectedOrder.createdAt)}
                  </p>
                </div>
              </div>

              {/* Update order status */}
              <div>
                <label
                  htmlFor="detail-order-status"
                  className="mb-2 block text-sm font-semibold text-gray-700"
                >
                  Update order status
                </label>

                <select
                  id="detail-order-status"
                  value={selectedOrder.status}
                  disabled={
                    updatingId === selectedOrder._id ||
                    selectedOrder.status === "cancelled" ||
                    selectedOrder.status === "delivered"
                  }
                  onChange={(event) =>
                    void updateStatus(
                      selectedOrder,
                      event.target.value as OrderStatus
                    )
                  }
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-blue-500 disabled:bg-gray-100"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </option>
                  ))}
                </select>

                {(selectedOrder.status === "cancelled" ||
                  selectedOrder.status === "delivered") && (
                  <p className="mt-2 text-xs text-gray-500">
                    This order has reached a final status and cannot be
                    changed here.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
