import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { FormEvent, ReactNode, ChangeEvent } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Package,
  RefreshCw,
  Upload,
  X,
  Image as ImageIcon,
  AlertCircle,
  Boxes,
  IndianRupee,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import toast from "react-hot-toast";
import api from "../lib/api";

interface Product {
  _id: string;
  productId?: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  originalPrice: number;
  discount: number;
  image: string;
  stock: number;
  isFeatured: boolean;
  rating?: number;
  reviews?: number;
  createdAt?: string;
}

interface ProductForm {
  name: string;
  description: string;
  category: string;
  subcategory: string;
  brand: string;
  price: string;
  originalPrice: string;
  stock: string;
  image: string;
  isFeatured: boolean;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  products?: T[];
  product?: T;
  image?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface CategoryOption {
  name: string;
  subcategories: string[];
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  category: "",
  subcategory: "",
  brand: "",
  price: "",
  originalPrice: "",
  stock: "0",
  image: "",
  isFeatured: false,
};

/*
 * Keep these category names consistent with the categories
 * used by your customer-facing website.
 */
const CATEGORY_OPTIONS: CategoryOption[] = [
  {
    name: "CCTV & Surveillance",
    subcategories: [
      "Security Cameras",
      "CCTV Systems",
      "Network Cameras",
      "Recording & Storage",
      "DVR & NVR",
      "CCTV Accessories",
    ],
  },
  {
    name: "Lighting",
    subcategories: [
      "LED Bulbs",
      "Tube Lights",
      "Panel Lights",
      "Outdoor Lighting",
      "Smart Lighting",
    ],
  },
  {
    name: "Fans",
    subcategories: [
      "Ceiling Fans",
      "Table Fans",
      "Pedestal Fans",
      "Exhaust Fans",
      "Wall Fans",
    ],
  },
  {
    name: "Switches & Sockets",
    subcategories: [
      "Modular Switches",
      "Power Sockets",
      "USB Sockets",
      "Smart Switches",
      "Switch Plates",
    ],
  },
  {
    name: "Cables & Wires",
    subcategories: [
      "Electrical Wires",
      "Power Cables",
      "Coaxial Cables",
      "LAN Cables",
      "Extension Cables",
    ],
  },
  {
    name: "Electrical Accessories",
    subcategories: [
      "Extension Boards",
      "Plugs",
      "Adapters",
      "Connectors",
      "Electrical Tape",
    ],
  },
  {
    name: "Circuit Protection",
    subcategories: [
      "MCB",
      "RCCB",
      "Distribution Boards",
      "Surge Protectors",
      "Fuses",
    ],
  },
  {
    name: "Home Appliances",
    subcategories: [
      "Refrigerators",
      "Washing Machines",
      "Air Conditioners",
      "Water Heaters",
      "Vacuum Cleaners",
    ],
  },
  {
    name: "Kitchen Appliances",
    subcategories: [
      "Microwave Ovens",
      "Mixer Grinders",
      "Electric Kettles",
      "Toasters",
      "Induction Cooktops",
    ],
  },
  {
    name: "Tools",
    subcategories: [
      "Drills",
      "Screwdrivers",
      "Multimeters",
      "Wire Cutters",
      "Testing Equipment",
    ],
  },
  {
    name: "Other",
    subcategories: ["Other Products", "Miscellaneous Accessories"],
  },
];

const INPUT_CLASS =
  "w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

const currency = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);

const errorMessage = (error: unknown, fallback: string): string => {
  const err = error as {
    response?: {
      status?: number;
      data?: { message?: string };
    };
    message?: string;
  };

  const status = err.response?.status;
  const message = err.response?.data?.message || err.message;

  if (status === 401) {
    return "Your admin session may have expired. Please log in again.";
  }

  if (status === 403) {
    return "Your account does not have permission to perform this action.";
  }

  if (!err.response && message) {
    return `Cannot connect to the backend: ${message}`;
  }

  return message || fallback;
};

const calculateDiscount = (
  price: number,
  originalPrice: number
): number => {
  if (
    !Number.isFinite(price) ||
    !Number.isFinite(originalPrice) ||
    originalPrice <= price ||
    originalPrice <= 0
  ) {
    return 0;
  }

  return Math.round(((originalPrice - price) / originalPrice) * 100);
};

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  // Show the selected image before uploading it.
  useEffect(() => {
    if (!imageFile) {
      setImagePreview("");
      return;
    }

    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);

    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const loadProducts = useCallback(async () => {
    setLoading(true);

    try {
      const response = await api.get<ApiResponse<Product>>(
        "/admin/products",
        {
          params: {
            page,
            limit: 10,
            search: search.trim() || undefined,
            category: category || undefined,
          },
        }
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Unable to fetch products."
        );
      }

      setProducts(response.data.products || []);
      setTotal(response.data.pagination?.total ?? 0);
      setTotalPages(
        Math.max(1, response.data.pagination?.totalPages ?? 1)
      );
    } catch (error) {
      toast.error(errorMessage(error, "Unable to load products."));
    } finally {
      setLoading(false);
    }
  }, [page, search, category]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const stats = useMemo(
    () => ({
      stock: products.reduce(
        (sum, product) => sum + (Number(product.stock) || 0),
        0
      ),
      lowStock: products.filter(
        (product) => product.stock > 0 && product.stock <= 5
      ).length,
      outOfStock: products.filter(
        (product) => product.stock === 0
      ).length,
    }),
    [products]
  );

  const updateField = <K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const selectedCategory = CATEGORY_OPTIONS.find(
    (item) => item.name === form.category
  );

  /*
   * Preserve old category/subcategory values when editing existing
   * products, even if those values are not in the predefined list.
   */
  const availableSubcategories = selectedCategory
    ? selectedCategory.subcategories
    : [];

  const openAddModal = () => {
    setEditingProduct(null);
    setForm({ ...EMPTY_FORM });
    setImageFile(null);
    setModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setImageFile(null);

    setForm({
      name: product.name || "",
      description: product.description || "",
      category: product.category || "",
      subcategory: product.subcategory || "",
      brand: product.brand || "",
      price: String(product.price ?? ""),
      originalPrice: String(
        product.originalPrice ?? product.price ?? ""
      ),
      stock: String(product.stock ?? 0),
      image: product.image || "",
      isFeatured: Boolean(product.isFeatured),
    });

    setModalOpen(true);
  };

  const handleImageChange = (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

    if (!allowedTypes.includes(file.type)) {
      toast.error("Choose a JPG, PNG or WEBP image.");
      event.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size must not exceed 5 MB.");
      event.target.value = "";
      return;
    }

    setImageFile(file);
  };

  const uploadImage = async (): Promise<string> => {
    if (!imageFile) {
      return form.image;
    }

    const formData = new FormData();
    formData.append("image", imageFile);

    setUploading(true);

    try {
      const response = await api.post<ApiResponse<Product>>(
        "/admin/products/upload-image",
        formData
      );

      if (!response.data.success || !response.data.image) {
        throw new Error(
          response.data.message || "Image upload failed."
        );
      }

      return response.data.image;
    } catch (error) {
      toast.error(
        `Image upload failed: ${errorMessage(
          error,
          "Unable to upload the product image."
        )}`
      );
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (saving || uploading) return;

    const price = Number(form.price);
    const originalPrice = Number(form.originalPrice);
    const stock = Number(form.stock);

    if (
      !form.name.trim() ||
      !form.description.trim() ||
      !form.category.trim() ||
      !form.subcategory.trim() ||
      !form.brand.trim()
    ) {
      toast.error("Please complete all required product fields.");
      return;
    }

    if (!Number.isFinite(price) || price <= 0) {
      toast.error("Selling price must be greater than zero.");
      return;
    }

    if (
      !Number.isFinite(originalPrice) ||
      originalPrice <= 0 ||
      originalPrice < price
    ) {
      toast.error(
        "Original price must be at least the selling price."
      );
      return;
    }

    if (!Number.isInteger(stock) || stock < 0) {
      toast.error("Stock must be a non-negative whole number.");
      return;
    }

    setSaving(true);

    try {
      const image = await uploadImage();

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        subcategory: form.subcategory.trim(),
        brand: form.brand.trim(),
        price,
        originalPrice,
        discount: calculateDiscount(price, originalPrice),
        stock,
        image,
        isFeatured: form.isFeatured,
      };

      if (editingProduct) {
        const response = await api.put<ApiResponse<Product>>(
          `/admin/products/${editingProduct._id}`,
          payload
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Product update failed."
          );
        }

        toast.success("Product updated successfully.");
      } else {
        const response = await api.post<ApiResponse<Product>>(
          "/admin/products",
          payload
        );

        if (!response.data.success) {
          throw new Error(
            response.data.message || "Product creation failed."
          );
        }

        toast.success("Product added successfully.");
      }

      setModalOpen(false);
      setEditingProduct(null);
      setImageFile(null);
      setForm({ ...EMPTY_FORM });

      await loadProducts();
    } catch (error) {
      toast.error(
        errorMessage(error, "Unable to save the product.")
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget || deleting) return;

    setDeleting(true);

    try {
      const response = await api.delete<ApiResponse<Product>>(
        `/admin/products/${deleteTarget._id}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || "Product deletion failed."
        );
      }

      toast.success("Product deleted successfully.");
      setDeleteTarget(null);

      if (products.length === 1 && page > 1) {
        setPage((current) => current - 1);
      } else {
        await loadProducts();
      }
    } catch (error) {
      toast.error(
        errorMessage(error, "Unable to delete product.")
      );
    } finally {
      setDeleting(false);
    }
  };

  const displayedImage = imagePreview || form.image;

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-medium text-blue-600">
            ElectroStore Admin
          </p>
          <h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">
            Product Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Add, edit, delete and manage your inventory.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadProducts()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Product
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <StatCard
          title="Total Products"
          value={total}
          icon={<Package size={21} />}
          color="blue"
        />
        <StatCard
          title="Stock on Page"
          value={stats.stock}
          icon={<Boxes size={21} />}
          color="violet"
        />
        <StatCard
          title="Low Stock on Page"
          value={stats.lowStock}
          icon={<AlertCircle size={21} />}
          color="amber"
        />
        <StatCard
          title="Out of Stock on Page"
          value={stats.outOfStock}
          icon={<Package size={21} />}
          color="red"
        />
      </div>

      {/* Search and category filter */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search by product name, brand or product ID..."
              className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(1);
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
          >
            <option value="">All categories</option>
            {CATEGORY_OPTIONS.map((item) => (
              <option key={item.name} value={item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-bold text-slate-900">All Products</h2>
            <p className="mt-1 text-xs text-slate-500">
              {total} product{total === 1 ? "" : "s"} found
            </p>
          </div>
          <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            Page {page} of {totalPages}
          </span>
        </div>

        {loading ? (
          <div className="flex min-h-64 flex-col items-center justify-center gap-3 text-slate-500">
            <RefreshCw size={28} className="animate-spin text-blue-600" />
            <p className="text-sm">Loading products...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center">
            <Package size={42} className="text-slate-300" />
            <h3 className="mt-3 font-semibold text-slate-800">
              No products found
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Try another search or add a new product.
            </p>
            <button
              type="button"
              onClick={openAddModal}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Add your first product
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[950px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4">Product</th>
                    <th className="px-5 py-4">Category</th>
                    <th className="px-5 py-4">Price</th>
                    <th className="px-5 py-4">Discount</th>
                    <th className="px-5 py-4">Stock</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {products.map((product) => (
                    <tr
                      key={product._id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                            {product.image ? (
                              <img
                                src={product.image}
                                alt={product.name}
                                className="h-full w-full object-contain p-1"
                              />
                            ) : (
                              <ImageIcon
                                size={23}
                                className="text-slate-300"
                              />
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-64 truncate font-semibold text-slate-900">
                              {product.name}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {product.productId || product._id}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">
                              {product.brand}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-medium text-slate-700">
                          {product.category}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {product.subcategory || "—"}
                        </p>
                      </td>

                      <td className="px-5 py-4">
                        <p className="font-semibold text-slate-900">
                          {currency(product.price)}
                        </p>
                        {product.originalPrice > product.price && (
                          <p className="mt-1 text-xs text-slate-400 line-through">
                            {currency(product.originalPrice)}
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="rounded-lg bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">
                          {calculateDiscount(
                            product.price,
                            product.originalPrice
                          )}
                          % off
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold ${
                            product.stock === 0
                              ? "text-red-600"
                              : product.stock <= 5
                                ? "text-amber-600"
                                : "text-slate-800"
                          }`}
                        >
                          {product.stock}
                        </span>
                        <p className="mt-1 text-xs text-slate-500">units</p>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                            product.stock === 0
                              ? "bg-red-50 text-red-700"
                              : product.stock <= 5
                                ? "bg-amber-50 text-amber-700"
                                : "bg-green-50 text-green-700"
                          }`}
                        >
                          {product.stock === 0
                            ? "Out of stock"
                            : product.stock <= 5
                              ? "Low stock"
                              : "In stock"}
                        </span>
                        {product.isFeatured && (
                          <p className="mt-2 text-xs font-medium text-blue-600">
                            Featured
                          </p>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            title="Edit product"
                            aria-label={`Edit ${product.name}`}
                            className="rounded-lg border border-blue-100 p-2.5 text-blue-600 hover:bg-blue-50"
                          >
                            <Pencil size={16} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(product)}
                            title="Delete product"
                            aria-label={`Delete ${product.name}`}
                            className="rounded-lg border border-red-100 p-2.5 text-red-600 hover:bg-red-50"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-slate-500">
                Showing {total === 0 ? 0 : (page - 1) * 10 + 1}–
                {Math.min(page * 10, total)} of {total} products
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage((current) => current - 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft size={16} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage((current) => current + 1)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add/Edit product modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/50 p-3 py-6 backdrop-blur-sm sm:p-6">
          <div className="my-auto w-full max-w-3xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the product details below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalOpen(false)}
                disabled={saving}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close product form"
              >
                <X size={21} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
                <FormField label="Product Name" required>
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateField("name", event.target.value)
                    }
                    required
                    maxLength={150}
                    placeholder="e.g. Hikvision 2MP CCTV Camera"
                    className={INPUT_CLASS}
                  />
                </FormField>

                <FormField label="Brand" required>
                  <input
                    value={form.brand}
                    onChange={(event) =>
                      updateField("brand", event.target.value)
                    }
                    required
                    placeholder="e.g. Hikvision"
                    className={INPUT_CLASS}
                  />
                </FormField>

                {/* Category dropdown */}
                <FormField label="Category" required>
                  <select
                    value={form.category}
                    onChange={(event) => {
                      const nextCategory = event.target.value;

                      updateField("category", nextCategory);
                      updateField("subcategory", "");
                    }}
                    required
                    className={INPUT_CLASS}
                  >
                    <option value="">Select a category</option>

                    {CATEGORY_OPTIONS.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}

                    {/* Preserve a legacy category while editing */}
                    {form.category &&
                      !CATEGORY_OPTIONS.some(
                        (item) => item.name === form.category
                      ) && (
                        <option value={form.category}>
                          {form.category} (existing)
                        </option>
                      )}
                  </select>
                </FormField>

                {/* Subcategory changes with the selected category */}
                <FormField label="Subcategory" required>
                  <select
                    value={form.subcategory}
                    onChange={(event) =>
                      updateField("subcategory", event.target.value)
                    }
                    required
                    disabled={!form.category}
                    className={`${INPUT_CLASS} disabled:cursor-not-allowed disabled:bg-slate-100`}
                  >
                    <option value="">
                      {form.category
                        ? "Select a subcategory"
                        : "Select a category first"}
                    </option>

                    {availableSubcategories.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}

                    {/* Keep existing subcategories when editing older data */}
                    {form.subcategory &&
                      !availableSubcategories.includes(form.subcategory) && (
                        <option value={form.subcategory}>
                          {form.subcategory} (existing)
                        </option>
                      )}
                  </select>
                  <p className="mt-1 text-xs text-slate-500">
                    Choose a category first to see its subcategories.
                  </p>
                </FormField>

                <FormField label="Selling Price (₹)" required>
                  <div className="relative">
                    <IndianRupee
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.price}
                      onChange={(event) =>
                        updateField("price", event.target.value)
                      }
                      required
                      className={`${INPUT_CLASS} pl-9`}
                      placeholder="199"
                    />
                  </div>
                </FormField>

                <FormField label="Original Price (₹)" required>
                  <div className="relative">
                    <IndianRupee
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={form.originalPrice}
                      onChange={(event) =>
                        updateField("originalPrice", event.target.value)
                      }
                      required
                      className={`${INPUT_CLASS} pl-9`}
                      placeholder="249"
                    />
                  </div>
                </FormField>

                <FormField label="Available Stock" required>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    value={form.stock}
                    onChange={(event) =>
                      updateField("stock", event.target.value)
                    }
                    required
                    className={INPUT_CLASS}
                    placeholder="50"
                  />
                </FormField>

                <FormField label="Discount">
                  <div className="flex h-11 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-green-700">
                    {calculateDiscount(
                      Number(form.price),
                      Number(form.originalPrice)
                    )}
                    %{" "}
                    <span className="ml-2 font-normal text-slate-500">
                      Calculated automatically
                    </span>
                  </div>
                </FormField>

                <div className="sm:col-span-2">
                  <FormField label="Description" required>
                    <textarea
                      value={form.description}
                      onChange={(event) =>
                        updateField("description", event.target.value)
                      }
                      required
                      rows={3}
                      maxLength={3000}
                      placeholder="Describe the product and its features..."
                      className={`${INPUT_CLASS} h-auto resize-y py-3`}
                    />
                  </FormField>
                </div>

                {/* Image upload */}
                <div className="sm:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Product Image
                  </label>

                  <div className="flex flex-col gap-4 rounded-xl border border-dashed border-slate-300 p-4 sm:flex-row sm:items-center">
                    <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                      {displayedImage ? (
                        <img
                          src={displayedImage}
                          alt="Product preview"
                          className="h-full w-full object-contain p-2"
                        />
                      ) : (
                        <ImageIcon size={35} className="text-slate-300" />
                      )}
                    </div>

                    <div className="flex-1">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">
                        <Upload size={17} />
                        Choose Image
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/webp"
                          onChange={handleImageChange}
                          className="hidden"
                        />
                      </label>

                      <p className="mt-2 text-xs text-slate-500">
                        JPG, PNG or WEBP. Maximum size 5 MB.
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {imageFile
                          ? imageFile.name
                          : form.image
                            ? "Current image will be retained unless replaced."
                            : "No image selected."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Featured product */}
                <div className="sm:col-span-2">
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 hover:bg-slate-50">
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(event) =>
                        updateField("isFeatured", event.target.checked)
                      }
                      className="h-4 w-4 accent-blue-600"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-slate-800">
                        Featured product
                      </span>
                      <span className="mt-1 block text-xs text-slate-500">
                        Mark this product as featured in your storefront.
                      </span>
                    </span>
                  </label>
                </div>
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50 px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving || uploading ? (
                    <RefreshCw size={16} className="animate-spin" />
                  ) : (
                    <Plus size={17} />
                  )}
                  {uploading
                    ? "Uploading image..."
                    : saving
                      ? "Saving..."
                      : editingProduct
                        ? "Save Changes"
                        : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Trash2 size={23} />
            </div>

            <h2 className="mt-4 text-xl font-bold text-slate-900">
              Delete product?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Are you sure you want to delete{" "}
              <strong>{deleteTarget.name}</strong>? Products linked to
              existing orders may be protected by the backend.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={() => void handleDelete()}
                disabled={deleting}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting && (
                  <RefreshCw size={16} className="animate-spin" />
                )}
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

function StatCard({
  title,
  value,
  icon,
  color,
}: {
  title: string;
  value: number;
  icon: ReactNode;
  color: "blue" | "violet" | "amber" | "red";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600",
    violet: "bg-violet-50 text-violet-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500 sm:text-sm">
          {title}
        </p>
        <div className={`rounded-xl p-2 ${colors[color]}`}>{icon}</div>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
    </div>
  );
}