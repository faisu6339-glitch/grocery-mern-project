
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  UserRound,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  CheckCircle2,
  Phone,
  Mail,
  ArrowLeft,
  Save,
  X,
  LoaderCircle,
} from "lucide-react";
import toast from "react-hot-toast";

interface Address {
  _id: string;
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  landmark: string;
  isDefault: boolean;
}

interface Profile {
  _id: string;
  customerId?: string;
  name: string;
  email: string;
  phone: string;
  addresses: Address[];
  role?: string;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  user?: T;
  addresses?: Address[];
}

interface AddressForm {
  fullName: string;
  phone: string;
  addressLine: string;
  city: string;
  state: string;
  pinCode: string;
  landmark: string;
}

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/$/, "");

const emptyAddress: AddressForm = {
  fullName: "",
  phone: "",
  addressLine: "",
  city: "",
  state: "",
  pinCode: "",
  landmark: "",
};

const inputClass =
  "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#142D4E] outline-none transition placeholder:text-slate-400 focus:border-[#087EBC] focus:ring-2 focus:ring-sky-100";

const getToken = (): string | null => {
  // Update this key if your login code stores the JWT under another name.
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken")
  );
};

const getErrorMessage = (data: unknown, fallback: string): string => {
  if (
    typeof data === "object" &&
    data !== null &&
    "message" in data &&
    typeof data.message === "string"
  ) {
    return data.message;
  }

  return fallback;
};

const Addresses = () => {
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressForm>(emptyAddress);

  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [defaultIdLoading, setDefaultIdLoading] = useState<string | null>(
    null
  );

  const getAuthHeaders = useCallback((): HeadersInit => {
    const token = getToken();

    if (!token) {
      throw new Error("Please log in to view your profile and addresses.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  // Load profile and saved addresses from MongoDB through the API.
  const loadProfile = useCallback(async () => {
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/auth/me`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      const data: ApiResponse<Profile> = await response.json();

      if (!response.ok || !data.success || !data.user) {
        throw new Error(
          getErrorMessage(data, "Unable to load your profile.")
        );
      }

      setUserName(data.user.name || "");
      setUserEmail(data.user.email || "");
      setUserPhone(data.user.phone || "");

      // MongoDB subdocuments use _id, not id.
      setAddresses(
        (data.user.addresses || []).map((address) => ({
          ...address,
          _id: address._id,
          landmark: address.landmark || "",
          isDefault: Boolean(address.isDefault),
        }))
      );
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to load your profile."
      );
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const openAddForm = () => {
    setEditingId(null);
    setForm({
      ...emptyAddress,
      fullName: userName,
      phone: userPhone.replace(/\D/g, "").slice(-10),
    });
    setShowForm(true);
  };

  const openEditForm = (address: Address) => {
    setEditingId(address._id);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      addressLine: address.addressLine,
      city: address.city,
      state: address.state,
      pinCode: address.pinCode,
      landmark: address.landmark || "",
    });
    setShowForm(true);
  };

  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanedName = userName.trim();
    const cleanedPhone = userPhone.replace(/\D/g, "");

    if (!cleanedName) {
      toast.error("Please enter your full name.");
      return;
    }

    if (cleanedPhone.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    setSavingProfile(true);

    try {
      const response = await fetch(`${API_URL}/auth/profile`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: cleanedName,
          phone: cleanedPhone,
        }),
      });

      const data: ApiResponse<Profile> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Unable to update your profile.")
        );
      }

      if (data.user) {
        setUserName(data.user.name || cleanedName);
        setUserEmail(data.user.email || userEmail);
        setUserPhone(data.user.phone || cleanedPhone);
      } else {
        setUserName(cleanedName);
        setUserPhone(cleanedPhone);
      }

      toast.success(data.message || "Profile updated successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update your profile."
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddressSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    const cleanedPhone = form.phone.replace(/\D/g, "");
    const cleanedPinCode = form.pinCode.replace(/\D/g, "");

    if (cleanedPhone.length !== 10) {
      toast.error("Enter a valid 10-digit mobile number.");
      return;
    }

    if (!/^\d{6}$/.test(cleanedPinCode)) {
      toast.error("Enter a valid 6-digit PIN code.");
      return;
    }

    const payload: AddressForm = {
      fullName: form.fullName.trim(),
      phone: cleanedPhone,
      addressLine: form.addressLine.trim(),
      city: form.city.trim(),
      state: form.state.trim(),
      pinCode: cleanedPinCode,
      landmark: form.landmark.trim(),
    };

    if (
      !payload.fullName ||
      !payload.addressLine ||
      !payload.city ||
      !payload.state
    ) {
      toast.error("Please fill in all required address fields.");
      return;
    }

    setSavingAddress(true);

    try {
      const isEditing = Boolean(editingId);
      const url = isEditing
        ? `${API_URL}/auth/addresses/${editingId}`
        : `${API_URL}/auth/addresses`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data: ApiResponse<Profile> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Unable to save the address.")
        );
      }

      // Use the backend response where available.
      if (data.addresses) {
        setAddresses(data.addresses);
      } else {
        await loadProfile();
      }

      toast.success(
        data.message ||
          (isEditing
            ? "Address updated successfully."
            : "Address saved successfully.")
      );

      setShowForm(false);
      setEditingId(null);
      setForm(emptyAddress);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to save the address."
      );
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (id: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this address?"
    );

    if (!confirmed) return;

    setDeletingId(id);

    try {
      const response = await fetch(`${API_URL}/auth/addresses/${id}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data: ApiResponse<Profile> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Unable to delete the address.")
        );
      }

      if (data.addresses) {
        setAddresses(data.addresses);
      } else {
        await loadProfile();
      }

      toast.success(data.message || "Address deleted successfully.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to delete the address."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const setDefaultAddress = async (id: string) => {
    setDefaultIdLoading(id);

    try {
      const response = await fetch(
        `${API_URL}/auth/addresses/${id}/default`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      const data: ApiResponse<Profile> = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          getErrorMessage(data, "Unable to set the default address.")
        );
      }

      if (data.addresses) {
        setAddresses(data.addresses);
      } else {
        await loadProfile();
      }

      toast.success(data.message || "Default address updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update the default address."
      );
    } finally {
      setDefaultIdLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#FAF7F2] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <Link
          to="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#087EBC] hover:underline"
        >
          <ArrowLeft size={17} />
          Back to Store
        </Link>

        <div className="mb-8">
          <p className="text-sm font-semibold uppercase tracking-wider text-[#087EBC]">
            My Account
          </p>

          <h1 className="mt-2 text-3xl font-extrabold text-[#142D4E] sm:text-4xl">
            Personal Details & Addresses
          </h1>

          <p className="mt-2 text-slate-600">
            Manage your profile information and delivery addresses.
          </p>
        </div>

        {loading ? (
          <div className="flex min-h-64 items-center justify-center gap-3 text-[#142D4E]">
            <LoaderCircle className="animate-spin" size={25} />
            <span className="font-medium">
              Loading your profile and addresses...
            </span>
          </div>
        ) : (
          <div className="grid items-start gap-6 lg:grid-cols-[0.85fr_1.5fr]">
            {/* Profile */}
            <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100 text-[#087EBC]">
                  <UserRound size={28} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-[#142D4E]">
                    My Profile
                  </h2>
                  <p className="text-sm text-slate-500">
                    Personal information
                  </p>
                </div>
              </div>

              <form
                className="mt-6 space-y-4"
                onSubmit={handleProfileSubmit}
              >
                <div>
                  <label
                    htmlFor="profile-name"
                    className="mb-2 block text-sm font-semibold text-[#142D4E]"
                  >
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    className={inputClass}
                    value={userName}
                    onChange={(event) => setUserName(event.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    required
                  />
                </div>

                <div>
                  <label
                    htmlFor="profile-email"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#142D4E]"
                  >
                    <Mail size={15} />
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    className={`${inputClass} cursor-not-allowed bg-slate-50`}
                    value={userEmail}
                    readOnly
                    title="Email cannot be changed here."
                  />
                  <p className="mt-1 text-xs text-slate-500">
                    Email address cannot be edited here.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="profile-phone"
                    className="mb-2 flex items-center gap-2 text-sm font-semibold text-[#142D4E]"
                  >
                    <Phone size={15} />
                    Mobile Number
                  </label>
                  <input
                    id="profile-phone"
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    className={inputClass}
                    value={userPhone}
                    onChange={(event) =>
                      setUserPhone(
                        event.target.value.replace(/\D/g, "").slice(0, 10)
                      )
                    }
                    placeholder="10-digit mobile number"
                    autoComplete="tel"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingProfile}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087EBC] px-4 py-3 font-semibold text-white hover:bg-[#06699D] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {savingProfile ? (
                    <LoaderCircle className="animate-spin" size={17} />
                  ) : (
                    <Save size={17} />
                  )}
                  {savingProfile ? "Saving..." : "Save Profile"}
                </button>
              </form>
            </section>

            {/* Address management */}
            <section className="min-w-0">
              <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-bold text-[#142D4E]">
                    Saved Addresses
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    {addresses.length} saved address
                    {addresses.length === 1 ? "" : "es"}
                  </p>
                </div>

                {!showForm && (
                  <button
                    type="button"
                    onClick={openAddForm}
                    className="inline-flex items-center gap-2 rounded-xl bg-[#087EBC] px-4 py-3 text-sm font-semibold text-white hover:bg-[#06699D]"
                  >
                    <Plus size={18} />
                    Add Address
                  </button>
                )}
              </div>

              {showForm && (
                <form
                  onSubmit={handleAddressSubmit}
                  className="mb-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="mb-5 flex items-center justify-between gap-3">
                    <h3 className="text-lg font-bold text-[#142D4E]">
                      {editingId ? "Edit Address" : "Add New Address"}
                    </h3>

                    <button
                      type="button"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setForm(emptyAddress);
                      }}
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                      aria-label="Close address form"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address-full-name"
                        className="mb-2 block text-sm font-semibold text-[#142D4E]"
                      >
                        Full Name *
                      </label>
                      <input
                        id="address-full-name"
                        className={inputClass}
                        value={form.fullName}
                        onChange={(event) =>
                          setForm({ ...form, fullName: event.target.value })
                        }
                        placeholder="Recipient's full name"
                        autoComplete="name"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address-phone"
                        className="mb-2 block text-sm font-semibold text-[#142D4E]"
                      >
                        Mobile Number *
                      </label>
                      <input
                        id="address-phone"
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        className={inputClass}
                        value={form.phone}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            phone: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 10),
                          })
                        }
                        placeholder="10-digit mobile number"
                        autoComplete="tel"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address-pin"
                        className="mb-2 block text-sm font-semibold text-[#142D4E]"
                      >
                        PIN Code *
                      </label>
                      <input
                        id="address-pin"
                        inputMode="numeric"
                        maxLength={6}
                        className={inputClass}
                        value={form.pinCode}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            pinCode: event.target.value
                              .replace(/\D/g, "")
                              .slice(0, 6),
                          })
                        }
                        placeholder="6-digit PIN code"
                        autoComplete="postal-code"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address-line"
                        className="mb-2 block text-sm font-semibold text-[#142D4E]"
                      >
                        House No., Street and Area *
                      </label>
                      <textarea
                        id="address-line"
                        className={`${inputClass} min-h-24 resize-y`}
                        value={form.addressLine}
                        onChange={(event) =>
                          setForm({
                            ...form,
                            addressLine: event.target.value,
                          })
                        }
                        placeholder="House number, street, locality"
                        autoComplete="street-address"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address-city"
                        className="mb-2 block text-sm font-semibold text-[#142D4E]"
                      >
                        City *
                      </label>
                      <input
                        id="address-city"
                        className={inputClass}
                        value={form.city}
                        onChange={(event) =>
                          setForm({ ...form, city: event.target.value })
                        }
                        placeholder="Enter city"
                        autoComplete="address-level2"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="address-state"
                        className="mb-2 block text-sm font-semibold text-[#142D4E]"
                      >
                        State *
                      </label>
                      <input
                        id="address-state"
                        className={inputClass}
                        value={form.state}
                        onChange={(event) =>
                          setForm({ ...form, state: event.target.value })
                        }
                        placeholder="Enter state"
                        autoComplete="address-level1"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label
                        htmlFor="address-landmark"
                        className="mb-2 block text-sm font-semibold text-[#142D4E]"
                      >
                        Landmark (Optional)
                      </label>
                      <input
                        id="address-landmark"
                        className={inputClass}
                        value={form.landmark}
                        onChange={(event) =>
                          setForm({ ...form, landmark: event.target.value })
                        }
                        placeholder="Nearby landmark"
                      />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      type="submit"
                      disabled={savingAddress}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#087EBC] px-5 py-3 font-semibold text-white hover:bg-[#06699D] disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {savingAddress ? (
                        <LoaderCircle className="animate-spin" size={17} />
                      ) : (
                        <Save size={17} />
                      )}
                      {savingAddress
                        ? "Saving..."
                        : editingId
                          ? "Update Address"
                          : "Save Address"}
                    </button>

                    <button
                      type="button"
                      disabled={savingAddress}
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                        setForm(emptyAddress);
                      }}
                      className="rounded-xl border border-slate-200 px-5 py-3 font-semibold text-[#142D4E] hover:bg-slate-50 disabled:opacity-60"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {addresses.length === 0 && !showForm ? (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#087EBC]">
                    <MapPin size={27} />
                  </div>

                  <h3 className="mt-4 text-lg font-bold text-[#142D4E]">
                    No saved addresses yet
                  </h3>

                  <p className="mt-2 text-sm text-slate-500">
                    Add a delivery address to make checkout easier.
                  </p>

                  <button
                    type="button"
                    onClick={openAddForm}
                    className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#087EBC] px-5 py-3 font-semibold text-white hover:bg-[#06699D]"
                  >
                    <Plus size={18} />
                    Add Your First Address
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <article
                      key={address._id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-50 text-[#087EBC]">
                            <MapPin size={21} />
                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-bold text-[#142D4E]">
                                {address.fullName}
                              </h3>

                              {address.isDefault && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                                  <CheckCircle2 size={13} />
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="mt-2 break-words text-sm leading-6 text-slate-600">
                              {address.addressLine}
                              {address.landmark && `, ${address.landmark}`}
                              {`, ${address.city}, ${address.state} - ${address.pinCode}`}
                            </p>

                            <p className="mt-2 flex items-center gap-2 text-sm text-slate-600">
                              <Phone size={15} />
                              {address.phone}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditForm(address)}
                            aria-label="Edit address"
                            className="rounded-lg p-2 text-[#087EBC] hover:bg-sky-50"
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            type="button"
                            onClick={() => void deleteAddress(address._id)}
                            disabled={deletingId === address._id}
                            aria-label="Delete address"
                            className="rounded-lg p-2 text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          >
                            {deletingId === address._id ? (
                              <LoaderCircle
                                className="animate-spin"
                                size={17}
                              />
                            ) : (
                              <Trash2 size={17} />
                            )}
                          </button>
                        </div>
                      </div>

                      {!address.isDefault && (
                        <button
                          type="button"
                          onClick={() => void setDefaultAddress(address._id)}
                          disabled={defaultIdLoading === address._id}
                          className="mt-4 text-sm font-semibold text-[#087EBC] hover:underline disabled:opacity-50"
                        >
                          {defaultIdLoading === address._id
                            ? "Updating..."
                            : "Set as Default Address"}
                        </button>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </main>
  );
};

export default Addresses;
