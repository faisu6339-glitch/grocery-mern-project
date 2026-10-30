
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Download,
  IndianRupee,
  Package,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import api from "../lib/api";

type Period = "7 days" | "30 days" | "90 days";

type DashboardData = {
  generatedAt: string;
  range: {
    days: number;
    startDate: string;
    endDate: string;
  };
  metrics: {
    totalProducts: number;
    totalCustomers: number;
    totalOrders: number;
    previousOrders: number;
    orderChangePercent: number;
    revenue: number;
    previousRevenue: number;
    revenueChangePercent: number;
    totalUnitsSold: number;
    deliveredOrders: number;
    inventoryRetailValue: number;
    stockUnits: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    expenses: number | null;
    netProfit: number | null;
  };
  ordersByStatus: Record<string, number>;
  chart: {
    date: string;
    orderValue: number;
    revenue: number;
    orders: number;
  }[];
  topProducts: {
    _id: string;
    name: string;
    unitsSold: number;
    salesValue: number;
  }[];
  recentOrders: {
    orderId: string;
    customer: string;
    email: string | null;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    status: string;
    items: {
      name: string;
      quantity: number;
      subtotal: number;
    }[];
    createdAt: string;
  }[];
  inventory: {
    lowStock: {
      _id: string;
      productId: string;
      name: string;
      stock: number;
      price: number;
    }[];
    outOfStock: {
      _id: string;
      productId: string;
      name: string;
      stock: number;
      price: number;
    }[];
  };
};

const currency = (amount: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

const numberFormat = (value: number) =>
  new Intl.NumberFormat("en-IN").format(value);

const dateFormat = (value: string) =>
  new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const dateTimeFormat = (value: string) =>
  new Date(value).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

function SectionTitle({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    delivered: "bg-emerald-50 text-emerald-700",
    paid: "bg-emerald-50 text-emerald-700",
    shipped: "bg-violet-50 text-violet-700",
    processing: "bg-sky-50 text-sky-700",
    confirmed: "bg-indigo-50 text-indigo-700",
    placed: "bg-amber-50 text-amber-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
    cancelled: "bg-red-50 text-red-700",
  };

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        styles[status.toLowerCase()] || "bg-slate-100 text-slate-700"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>("7 days");
  const [orderFilter, setOrderFilter] = useState("all");
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState("");

  const days = Number.parseInt(period, 10);

  async function fetchDashboard(isRefresh = false) {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const response = await api.get("/admin/dashboard", {
        params: { days },
      });

      if (!response.data?.success) {
        throw new Error(
          response.data?.message || "Unable to load dashboard."
        );
      }

      setData(response.data);
      setLastUpdated(new Date().toLocaleTimeString("en-IN"));
    } catch (err: unknown) {
      const axiosError = err as {
        response?: { data?: { message?: string } };
        message?: string;
      };

      setError(
        axiosError.response?.data?.message ||
          axiosError.message ||
          "Unable to connect to the dashboard API."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void fetchDashboard();
    // Fetch again whenever the selected period changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [days]);

  const metrics = data?.metrics;

  const filteredOrders = useMemo(() => {
    const orders = data?.recentOrders || [];

    if (orderFilter === "all") return orders;

    return orders.filter(
      (order) => order.status.toLowerCase() === orderFilter
    );
  }, [data, orderFilter]);

  const maxChartValue = Math.max(
    1,
    ...(data?.chart || []).flatMap((item) => [
      item.revenue,
      item.orderValue,
    ])
  );

  function exportOrders() {
    if (!data) return;

    const rows = [
      [
        "Order ID",
        "Customer",
        "Email",
        "Total INR",
        "Payment Status",
        "Order Status",
        "Date",
        "Items",
      ],
      ...filteredOrders.map((order) => [
        order.orderId,
        order.customer,
        order.email || "",
        order.totalAmount,
        order.paymentStatus,
        order.status,
        order.createdAt,
        order.items
          .map((item) => `${item.name} x${item.quantity}`)
          .join("; "),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(",")
      )
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `electrostore-orders-${days}-days.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-96 flex-col items-center justify-center gap-4">
        <RefreshCw className="animate-spin text-sky-700" size={34} />
        <p className="font-medium text-slate-600">
          Loading your real store data...
        </p>
      </div>
    );
  }

  if (error && !data) {
    return (
      <div className="mx-auto max-w-2xl rounded-2xl border border-red-200 bg-white p-8 text-center shadow-sm">
        <AlertTriangle className="mx-auto text-red-600" size={38} />
        <h1 className="mt-4 text-xl font-bold text-slate-900">
          Dashboard could not load
        </h1>
        <p className="mt-2 text-sm text-slate-600">{error}</p>
        <p className="mt-2 text-xs text-slate-400">
          Check that your backend is running and your admin session is valid.
        </p>
        <button
          type="button"
          onClick={() => void fetchDashboard()}
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-sky-700 px-5 py-3 font-semibold text-white hover:bg-sky-800"
        >
          <RefreshCw size={17} /> Try again
        </button>
      </div>
    );
  }

  if (!data || !metrics) return null;

  const stats = [
    {
      label: "Paid Revenue",
      value: currency(metrics.revenue),
      detail:
        `${metrics.revenueChangePercent >= 0 ? "+" : ""}${metrics.revenueChangePercent}% vs previous period`,
      icon: IndianRupee,
      color: "bg-sky-50 text-sky-700",
      positive: metrics.revenueChangePercent >= 0,
    },
    {
      label: "Expenses",
      value:
        metrics.expenses === null ? "Not recorded" : currency(metrics.expenses),
      detail: "Requires expense records",
      icon: Wallet,
      color: "bg-orange-50 text-orange-700",
      unavailable: metrics.expenses === null,
    },
    {
      label: "Net Profit",
      value:
        metrics.netProfit === null
          ? "Not available"
          : currency(metrics.netProfit),
      detail: "Requires costs and expenses",
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-700",
      unavailable: metrics.netProfit === null,
    },
    {
      label: "Products Sold",
      value: numberFormat(metrics.totalUnitsSold),
      detail: `Across the last ${days} days`,
      icon: ShoppingBag,
      color: "bg-violet-50 text-violet-700",
    },
    {
      label: "Orders",
      value: numberFormat(metrics.totalOrders),
      detail:
        `${metrics.orderChangePercent >= 0 ? "+" : ""}${metrics.orderChangePercent}% vs previous period`,
      icon: ShoppingCart,
      color: "bg-amber-50 text-amber-700",
      positive: metrics.orderChangePercent >= 0,
    },
    {
      label: "Registered Customers",
      value: numberFormat(metrics.totalCustomers),
      detail: "All customer accounts",
      icon: Users,
      color: "bg-pink-50 text-pink-700",
    },
    {
      label: "Total Products",
      value: numberFormat(metrics.totalProducts),
      detail: "Products in catalogue",
      icon: Package,
      color: "bg-indigo-50 text-indigo-700",
    },
    {
      label: "Delivered Orders",
      value: numberFormat(metrics.deliveredOrders),
      detail: `During the last ${days} days`,
      icon: PackageCheck,
      color: "bg-teal-50 text-teal-700",
    },
  ];

  const inventoryAlerts = [
    ...data.inventory.outOfStock.map((product) => ({
      ...product,
      alertType: "Out of stock",
    })),
    ...data.inventory.lowStock.map((product) => ({
      ...product,
      alertType: "Low stock",
    })),
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-10">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-sky-700">
            <Zap size={16} />
            STORE OVERVIEW
          </div>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Live metrics from your ElectroStore MongoDB database.
          </p>
          <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            Connected to dashboard API
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={exportOrders}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <Download size={17} /> Export orders
          </button>
          <button
            type="button"
            disabled={refreshing}
            onClick={() => void fetchDashboard(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-sky-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-800 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={refreshing ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </section>

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          Refresh failed: {error}. Showing the last successfully loaded data.
        </div>
      )}

      {/* Business metrics */}
      <section>
        <SectionTitle
          title="Business performance"
          subtitle={`Real database metrics for the selected ${days}-day period, except all-time catalogue/customer counts.`}
          action={
            <select
              value={period}
              onChange={(event) => setPeriod(event.target.value as Period)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 outline-none focus:border-sky-600"
              aria-label="Dashboard date range"
            >
              <option value="7 days">Last 7 days</option>
              <option value="30 days">Last 30 days</option>
              <option value="90 days">Last 90 days</option>
            </select>
          }
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-500">
                      {stat.label}
                    </p>
                    <p className="mt-3 break-words text-2xl font-extrabold tracking-tight text-slate-900">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <Icon size={22} />
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1.5 text-xs">
                  {"unavailable" in stat && stat.unavailable ? (
                    <AlertTriangle size={14} className="text-orange-600" />
                  ) : "positive" in stat ? (
                    stat.positive ? (
                      <ArrowUpRight size={14} className="text-emerald-600" />
                    ) : (
                      <ArrowDownRight size={14} className="text-red-600" />
                    )
                  ) : null}
                  <span className="text-slate-500">{stat.detail}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Chart */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <SectionTitle
            title="Sales activity"
            subtitle="Compare paid revenue with total non-cancelled order value"
          />

          <div className="mb-5 flex flex-wrap gap-4 text-sm">
            <span className="inline-flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-sm bg-sky-600" />
              Paid revenue
            </span>
            <span className="inline-flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-sm bg-violet-400" />
              Order value
            </span>
          </div>

          {data.chart.length === 0 ? (
            <div className="flex h-64 items-center justify-center text-sm text-slate-500">
              No order activity for this period.
            </div>
          ) : (
            <div className="grid grid-cols-[48px_1fr] gap-2">
              <div className="flex h-64 flex-col justify-between pb-7 text-right text-xs text-slate-400">
                <span>{currency(maxChartValue)}</span>
                <span>{currency(maxChartValue * 0.66)}</span>
                <span>{currency(maxChartValue * 0.33)}</span>
                <span>₹0</span>
              </div>

              <div className="relative h-64 min-w-0">
                <div className="pointer-events-none absolute inset-0 flex flex-col justify-between pb-7">
                  {[0, 1, 2, 3].map((line) => (
                    <div
                      key={line}
                      className="border-t border-dashed border-slate-200"
                    />
                  ))}
                </div>

                <div className="relative flex h-full items-end justify-around gap-1">
                  {data.chart.map((item) => (
                    <div
                      key={item.date}
                      className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                    >
                      <div className="flex h-[calc(100%-28px)] w-full items-end justify-center gap-0.5 sm:gap-1">
                        <div
                          title={`Paid revenue: ${currency(item.revenue)}`}
                          className="w-[38%] max-w-7 rounded-t-sm bg-sky-600"
                          style={{
                            height: `${(item.revenue / maxChartValue) * 100}%`,
                            minHeight: item.revenue > 0 ? "3px" : "0",
                          }}
                        />
                        <div
                          title={`Order value: ${currency(item.orderValue)}`}
                          className="w-[38%] max-w-7 rounded-t-sm bg-violet-400"
                          style={{
                            height: `${(item.orderValue / maxChartValue) * 100}%`,
                            minHeight: item.orderValue > 0 ? "3px" : "0",
                          }}
                        />
                      </div>
                      <span className="mt-2 truncate text-center text-[10px] text-slate-500 sm:text-xs">
                        {new Date(`${item.date}T12:00:00`).toLocaleDateString(
                          "en-IN",
                          { day: "2-digit", month: "short" }
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <p className="mt-3 text-xs text-slate-400">
            Paid revenue includes orders marked paid. Order value includes
            non-cancelled orders that may still be unpaid.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle
            title="Order status"
            subtitle="Non-cancelled order pipeline for the selected period"
          />
          <div className="space-y-5">
            {[
              { label: "Placed", key: "placed", color: "bg-amber-400" },
              { label: "Confirmed", key: "confirmed", color: "bg-indigo-500" },
              { label: "Processing", key: "processing", color: "bg-sky-600" },
              { label: "Shipped", key: "shipped", color: "bg-violet-500" },
              { label: "Delivered", key: "delivered", color: "bg-emerald-500" },
              { label: "Cancelled", key: "cancelled", color: "bg-red-400" },
            ].map((item) => {
              const count = data.ordersByStatus[item.key] || 0;
              const maxCount = Math.max(
                1,
                ...Object.values(data.ordersByStatus)
              );

              return (
                <div key={item.key}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-600">{item.label}</span>
                    <span className="font-bold text-slate-800">
                      {numberFormat(count)}
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={`h-full rounded-full ${item.color}`}
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {/* Recent orders */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="p-5 sm:p-6">
          <SectionTitle
            title="Recent orders"
            subtitle="Real orders from your database"
            action={
              <div className="flex items-center gap-2">
                <select
                  value={orderFilter}
                  onChange={(event) => setOrderFilter(event.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-600"
                  aria-label="Filter orders"
                >
                  <option value="all">All statuses</option>
                  <option value="placed">Placed</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="processing">Processing</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            }
          />

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead>
                <tr className="border-y border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3 font-semibold">Order</th>
                  <th className="px-4 py-3 font-semibold">Customer</th>
                  <th className="px-4 py-3 font-semibold">Items</th>
                  <th className="px-4 py-3 font-semibold">Total</th>
                  <th className="px-4 py-3 font-semibold">Payment</th>
                  <th className="px-4 py-3 font-semibold">Order status</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr
                    key={order.orderId}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                  >
                    <td className="whitespace-nowrap px-4 py-4 font-bold text-sky-700">
                      {order.orderId}
                    </td>
                    <td className="px-4 py-4">
                      <p className="font-medium text-slate-800">
                        {order.customer}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {order.email || "Email unavailable"}
                      </p>
                    </td>
                    <td className="max-w-64 px-4 py-4 text-slate-600">
                      {order.items.map((item, index) => (
                        <p key={`${item.name}-${index}`} className="mb-1">
                          {item.name} × {item.quantity}
                        </p>
                      ))}
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 font-semibold text-slate-800">
                      {currency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.paymentStatus} />
                      <p className="mt-1 text-xs text-slate-400">
                        {order.paymentMethod}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-slate-500">
                      {dateTimeFormat(order.createdAt)}
                    </td>
                  </tr>
                ))}

                {filteredOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-10 text-center text-slate-500"
                    >
                      No orders match this filter for the selected period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-xs text-slate-400">
            The API currently returns the latest 10 orders within the selected
            period. This is not a full order history export.
          </p>
        </div>
      </section>

      {/* Best sellers and inventory */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle
            title="Best-selling products"
            subtitle="Ranked by real units in orders for this period"
            action={<PackageCheck className="text-sky-700" size={21} />}
          />

          {data.topProducts.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-500">
              No product sales found for this period.
            </p>
          ) : (
            <div className="space-y-5">
              {data.topProducts.map((product, index) => {
                const maxSold = Math.max(
                  1,
                  ...data.topProducts.map((item) => item.unitsSold)
                );

                return (
                  <div
                    key={product._id}
                    className="flex items-center gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-slate-800">
                          {product.name}
                        </span>
                        <span className="text-xs text-slate-500">
                          {numberFormat(product.unitsSold)} sold
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-sky-600"
                          style={{
                            width: `${(product.unitsSold / maxSold) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <span className="hidden text-sm font-bold text-slate-700 sm:block">
                      {currency(product.salesValue)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <SectionTitle
            title="Inventory alerts"
            subtitle="Products with low or zero stock"
            action={
              <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-bold text-red-700">
                {numberFormat(
                  metrics.lowStockProducts + metrics.outOfStockProducts
                )}{" "}
                alerts
              </span>
            }
          />

          {inventoryAlerts.length === 0 ? (
            <div className="rounded-xl bg-emerald-50 p-5 text-sm text-emerald-800">
              No products currently meet the low-stock threshold (5 units or
              fewer) or are out of stock.
            </div>
          ) : (
            <div className="space-y-3">
              {inventoryAlerts.map((product) => (
                <div
                  key={product._id}
                  className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 p-3"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                      <Package size={19} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {product.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {product.productId}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        product.stock === 0
                          ? "bg-red-50 text-red-700"
                          : "bg-orange-50 text-orange-700"
                      }`}
                    >
                      {product.alertType}
                    </span>
                    <p className="mt-2 text-xs text-slate-500">
                      {numberFormat(product.stock)} in stock
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Units in stock</p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {numberFormat(metrics.stockUnits)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-500">
                Inventory retail value
              </p>
              <p className="mt-1 text-xl font-bold text-slate-800">
                {currency(metrics.inventoryRetailValue)}
              </p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Inventory retail value is stock multiplied by listed selling price,
            not inventory cost or profit.
          </p>
        </article>
      </section>

      {/* Financial and system notes */}
      <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <SectionTitle
            title="Dashboard activity"
            subtitle="Recent real order and inventory events"
            action={<Activity size={21} className="text-sky-700" />}
          />

          <div className="space-y-5">
            {data.recentOrders.slice(0, 5).map((order) => (
              <div key={order.orderId} className="flex items-start gap-4">
                <div className="rounded-xl bg-sky-50 p-3 text-sky-700">
                  <ShoppingCart size={19} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    Order {order.orderId}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {order.customer} · {currency(order.totalAmount)} ·{" "}
                    {order.status}
                  </p>
                </div>
                <span className="shrink-0 text-xs text-slate-400">
                  {dateTimeFormat(order.createdAt)}
                </span>
              </div>
            ))}

            {data.recentOrders.length === 0 && (
              <p className="py-5 text-sm text-slate-500">
                No recent orders in this period.
              </p>
            )}

            {inventoryAlerts.length > 0 && (
              <div className="flex items-start gap-4">
                <div className="rounded-xl bg-orange-50 p-3 text-orange-700">
                  <AlertTriangle size={19} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Inventory requires attention
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    {inventoryAlerts.length} products have low or zero stock.
                  </p>
                </div>
              </div>
            )}
          </div>
        </article>

        <article className="rounded-2xl bg-[#142D4E] p-6 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div className="rounded-xl bg-white/10 p-3">
              <CreditCard size={23} />
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
              Financial data
            </span>
          </div>

          <h2 className="mt-6 text-lg font-bold">Financial overview</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Revenue is based on orders marked as paid. Your current schema
            doesn't yet record purchase costs or operating expenses.
          </p>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm text-slate-300">Paid revenue</span>
              <span className="text-sm font-semibold">
                {currency(metrics.revenue)}
              </span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm text-slate-300">Expenses</span>
              <span className="text-sm font-semibold">Not recorded</span>
            </div>
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <span className="text-sm text-slate-300">Net profit</span>
              <span className="text-sm font-semibold">Not available</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-sm text-slate-300">
                <CalendarDays size={16} /> Period
              </span>
              <span className="text-sm font-semibold">{days} days</span>
            </div>
          </div>

          <div className="mt-6 rounded-xl bg-white/10 p-3 text-xs leading-5 text-slate-200">
            Last refreshed: {lastUpdated || "Loading"}
            <br />
            <Clock3 size={13} className="mr-1 inline" />
            API time: {dateTimeFormat(data.generatedAt)}
          </div>
        </article>
      </section>

      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400">
        <span>ElectroStore Admin · Live dashboard</span>
        <span>
          Data fetched from MongoDB through your protected admin API.
        </span>
      </footer>
    </div>
  );
}
