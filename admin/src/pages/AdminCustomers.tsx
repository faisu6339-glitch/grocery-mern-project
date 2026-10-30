
import { useCallback, useEffect, useState } from "react";
import {
  Search,
  RefreshCw,
  Users,
  UserRound,
  ShoppingBag,
  Wallet,
  Eye,
  X,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

type CustomerAddress = {
  _id?: string;
  name?: string;
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
  isDefault?: boolean;
};

type CustomerOrder = {
  _id: string;
  orderId?: string;
  items?: Array<{
    name?: string;
    quantity?: number;
    price?: number;
  }>;
  totalAmount?: number;
  paymentMethod?: string;
  paymentStatus?: string;
  status: string;
  createdAt: string;
  shippingAddress?: CustomerAddress | string;
};

type Customer = {
  _id: string;
  customerId?: string;
  name: string;
  email: string;
  phone?: string;
  addresses?: CustomerAddress[];
  createdAt: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string | null;
  orders?: CustomerOrder[];
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

const formatCurrency = (amount?: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(Number(amount || 0));

const formatDate = (date?: string | null) => {
  if (!date) return "—";

  const parsed = new Date(date);

  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const getAddressText = (
  address?: CustomerAddress | string | null
) => {
  if (!address) return "No address saved";

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

  return [...new Set(parts.filter(Boolean))].join(", ") ||
    "Address details unavailable";
};

const statusClasses: Record<string, string> = {
  placed: "bg-blue-50 text-blue-700",
  confirmed: "bg-indigo-50 text-indigo-700",
  processing: "bg-amber-50 text-amber-700",
  shipped: "bg-purple-50 text-purple-700",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

const AdminCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [selectedCustomer, setSelectedCustomer] =
    useState<Customer | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get("/admin/customers", {
        params: {
          page,
          limit: 10,
          search: search.trim(),
        },
      });

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Could not load customers");
      }

      setCustomers(data.customers || []);

      setPagination(
        data.pagination || {
          page,
          limit: 10,
          total: (data.customers || []).length,
          totalPages: 1,
        }
      );
    } catch (error: any) {
      console.error("Fetch customers error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load customers"
      );
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      void fetchCustomers();
    }, search ? 300 : 0);

    return () => window.clearTimeout(timeout);
  }, [fetchCustomers, search]);

  const openCustomerDetails = async (customer: Customer) => {
    setSelectedCustomer(customer);
    setDetailsLoading(true);

    try {
      const response = await api.get(
        `/admin/customers/${encodeURIComponent(
          customer.customerId || customer._id
        )}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Could not load customer details"
        );
      }

      setSelectedCustomer(response.data.customer);
    } catch (error: any) {
      console.error("Customer details error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to load customer details"
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const summary = [
    {
      label: "Total Customers",
      value: pagination.total,
      icon: Users,
      style: "bg-blue-50 text-blue-600",
    },
    {
      label: "Customers on This Page",
      value: customers.length,
      icon: UserRound,
      style: "bg-purple-50 text-purple-600",
    },
    {
      label: "Orders on This Page",
      value: customers.reduce(
        (sum, customer) => sum + Number(customer.totalOrders || 0),
        0
      ),
      icon: ShoppingBag,
      style: "bg-amber-50 text-amber-600",
    },
    {
      label: "Spending on This Page",
      value: formatCurrency(
        customers.reduce(
          (sum, customer) => sum + Number(customer.totalSpent || 0),
          0
        )
      ),
      icon: Wallet,
      style: "bg-emerald-50 text-emerald-600",
    },
  ];

  return (
    <div className="min-h-screen space-y-6 bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* Page header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Customers
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View registered customers, contact details, and order history.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void fetchCustomers()}
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
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm text-gray-500">{item.label}</p>

                  <p className="mt-2 break-words text-2xl font-bold text-gray-900">
                    {item.value}
                  </p>
                </div>

                <div className={`rounded-xl p-3 ${item.style}`}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer table */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-gray-100 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative w-full sm:max-w-md">
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
              placeholder="Search name, email, phone or customer ID..."
              className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <p className="text-sm text-gray-500">
            {pagination.total} registered customers
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Contact</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 font-semibold">Orders</th>
                <th className="px-5 py-4 font-semibold">Total Spending</th>
                <th className="px-5 py-4 font-semibold">Last Order</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-16 text-center text-gray-500"
                  >
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center">
                    <Users
                      size={36}
                      className="mx-auto mb-3 text-gray-300"
                    />

                    <p className="font-medium text-gray-700">
                      No customers found
                    </p>

                    <p className="mt-1 text-gray-500">
                      Try searching with a different name or email.
                    </p>
                  </td>
                </tr>
              ) : (
                customers.map((customer) => (
                  <tr
                    key={customer._id}
                    className="transition hover:bg-gray-50/70"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 font-semibold text-blue-700">
                          {customer.name?.charAt(0).toUpperCase() || "C"}
                        </div>

                        <div>
                          <p className="font-semibold text-gray-900">
                            {customer.name}
                          </p>

                          <p className="mt-1 text-xs text-gray-400">
                            {customer.customerId || customer._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <p className="break-all text-gray-700">
                        {customer.email}
                      </p>

                      <p className="mt-1 text-xs text-gray-500">
                        {customer.phone || "Phone unavailable"}
                      </p>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {formatDate(customer.createdAt)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
                        {customer.totalOrders || 0}
                      </span>
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 font-semibold text-gray-900">
                      {formatCurrency(customer.totalSpent)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                      {formatDate(customer.lastOrderDate)}
                    </td>

                    <td className="px-5 py-4">
                      <button
                        type="button"
                        onClick={() => void openCustomerDetails(customer)}
                        title="View customer details"
                        className="inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                      >
                        <Eye size={16} />
                        View
                      </button>
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
            {customers.length
              ? (page - 1) * pagination.limit + 1
              : 0}
            {"–"}
            {(page - 1) * pagination.limit + customers.length} of{" "}
            {pagination.total} customers
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() =>
                setPage((current) => Math.max(1, current - 1))
              }
              aria-label="Previous page"
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
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
              aria-label="Next page"
              className="rounded-lg border border-gray-200 p-2 text-gray-600 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Customer details modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-6"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="customer-dialog-title"
            className="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            {/* Modal header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-5 py-4 sm:px-6">
              <div>
                <h2
                  id="customer-dialog-title"
                  className="text-lg font-bold text-gray-900"
                >
                  Customer details
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  {selectedCustomer.customerId || selectedCustomer._id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                aria-label="Close customer details"
                className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-6 p-5 sm:p-6">
              {detailsLoading ? (
                <p className="py-10 text-center text-gray-500">
                  Loading customer details...
                </p>
              ) : (
                <>
                  {/* Profile information */}
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-4 flex items-center gap-2">
                        <UserRound size={18} className="text-blue-600" />

                        <h3 className="font-semibold text-gray-900">
                          Profile information
                        </h3>
                      </div>

                      <p className="font-semibold text-gray-900">
                        {selectedCustomer.name}
                      </p>

                      <p className="mt-3 flex items-start gap-2 break-all text-sm text-gray-600">
                        <Mail
                          size={16}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />
                        {selectedCustomer.email}
                      </p>

                      <p className="mt-3 flex items-start gap-2 text-sm text-gray-600">
                        <Phone
                          size={16}
                          className="mt-0.5 shrink-0 text-gray-400"
                        />
                        {selectedCustomer.phone || "Phone unavailable"}
                      </p>

                      <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays
                          size={16}
                          className="shrink-0 text-gray-400"
                        />
                        Joined {formatDate(selectedCustomer.createdAt)}
                      </p>
                    </div>

                    <div className="rounded-xl border border-gray-100 bg-gray-50 p-4">
                      <div className="mb-4 flex items-center gap-2">
                        <ShoppingBag
                          size={18}
                          className="text-blue-600"
                        />

                        <h3 className="font-semibold text-gray-900">
                          Purchase summary
                        </h3>
                      </div>

                      <p className="text-sm text-gray-500">
                        Total orders
                      </p>

                      <p className="mt-1 text-2xl font-bold text-gray-900">
                        {selectedCustomer.totalOrders || 0}
                      </p>

                      <p className="mt-4 text-sm text-gray-500">
                        Total spending
                      </p>

                      <p className="mt-1 text-xl font-bold text-emerald-700">
                        {formatCurrency(selectedCustomer.totalSpent)}
                      </p>

                      <p className="mt-4 text-sm text-gray-500">
                        Last order
                      </p>

                      <p className="mt-1 text-sm font-medium text-gray-800">
                        {formatDate(selectedCustomer.lastOrderDate)}
                      </p>
                    </div>
                  </div>

                  {/* Saved addresses */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <MapPin size={18} className="text-blue-600" />

                      <h3 className="font-semibold text-gray-900">
                        Saved addresses
                      </h3>
                    </div>

                    {selectedCustomer.addresses?.length ? (
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        {selectedCustomer.addresses.map(
                          (address, index) => (
                            <div
                              key={address._id || index}
                              className="rounded-xl border border-gray-200 p-4"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-medium text-gray-900">
                                  {address.name ||
                                    selectedCustomer.name}
                                </p>

                                {address.isDefault && (
                                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                    Default
                                  </span>
                                )}
                              </div>

                              <p className="mt-2 text-sm leading-6 text-gray-600">
                                {getAddressText(address)}
                              </p>

                              {address.phone && (
                                <p className="mt-3 flex items-center gap-2 text-sm text-gray-600">
                                  <Phone size={14} />
                                  {address.phone}
                                </p>
                              )}
                            </div>
                          )
                        )}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                        <MapPin
                          size={28}
                          className="mx-auto mb-2 text-gray-300"
                        />

                        <p className="text-sm text-gray-500">
                          No saved addresses found for this customer.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Order history */}
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Package size={18} className="text-blue-600" />

                      <h3 className="font-semibold text-gray-900">
                        Order history
                      </h3>
                    </div>

                    {selectedCustomer.orders?.length ? (
                      <div className="overflow-x-auto rounded-xl border border-gray-100">
                        <table className="w-full min-w-[650px] text-left text-sm">
                          <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                            <tr>
                              <th className="px-4 py-3">Order</th>
                              <th className="px-4 py-3">Date</th>
                              <th className="px-4 py-3">Total</th>
                              <th className="px-4 py-3">Payment</th>
                              <th className="px-4 py-3">Status</th>
                            </tr>
                          </thead>

                          <tbody className="divide-y divide-gray-100">
                            {selectedCustomer.orders.map((order) => (
                              <tr key={order._id}>
                                <td className="px-4 py-3 font-medium text-gray-900">
                                  {order.orderId || order._id.slice(-8)}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 text-gray-600">
                                  {formatDate(order.createdAt)}
                                </td>

                                <td className="whitespace-nowrap px-4 py-3 font-semibold text-gray-900">
                                  {formatCurrency(order.totalAmount)}
                                </td>

                                <td className="px-4 py-3 text-gray-600">
                                  {order.paymentMethod || "—"}
                                </td>

                                <td className="px-4 py-3">
                                  <span
                                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${
                                      statusClasses[order.status] ||
                                      "bg-gray-100 text-gray-700"
                                    }`}
                                  >
                                    {order.status}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="rounded-xl border border-dashed border-gray-200 p-6 text-center">
                        <ShoppingBag
                          size={28}
                          className="mx-auto mb-2 text-gray-300"
                        />

                        <p className="text-sm text-gray-500">
                          This customer has no orders yet.
                        </p>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
