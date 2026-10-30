
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  ArrowRight,
  ShieldCheck,
  Zap,
  LoaderCircle,
} from "lucide-react";
import api from "../lib/api";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      // This endpoint must be implemented in the backend
      // and must verify that the account has the admin role.
      const response = await api.post("/admin/login", {
        email: email.trim(),
        password,
      });

      const data = response.data;

      if (!data.success || !data.token) {
        setError(data.message || "Unable to sign in.");
        return;
      }

      if (data.user?.role !== "admin") {
        setError("Access denied. An administrator account is required.");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      navigate("/", { replace: true });
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Login failed. Check your credentials or ensure the admin API is running."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC] p-4 sm:p-6">
      <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl lg:grid-cols-2">
        {/* Left branding panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-[#142D4E] p-10 text-white lg:flex">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#087EBC]/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

          <div className="relative z-10 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#087EBC]">
              <Zap size={27} fill="white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">ElectroStore</h1>
              <p className="text-sm text-blue-200">Administration Portal</p>
            </div>
          </div>

          <div className="relative z-10 py-12">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <ShieldCheck size={34} />
            </div>

            <h2 className="mb-5 text-4xl font-bold leading-tight text-white">
              Manage your store.
              <br />
              Power your business.
            </h2>

            <p className="max-w-sm leading-7 text-blue-100">
              Manage products, monitor orders, track customers, and keep your
              electrical appliance store running smoothly.
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              {["Products", "Orders", "Customers"].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-blue-50"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>

          <p className="relative z-10 text-sm text-blue-200">
            Secure access for authorized administrators only.
          </p>
        </div>

        {/* Login form */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
          <div className="w-full max-w-md">
            <div className="mb-8 lg:hidden">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#087EBC] text-white">
                <Zap size={26} fill="white" />
              </div>
              <h1 className="text-2xl font-bold text-[#142D4E]">
                ElectroStore
              </h1>
              <p className="text-sm text-slate-500">Admin Portal</p>
            </div>

            <div className="mb-8">
              <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-[#087EBC]">
                <ShieldCheck size={15} />
                Admin access
              </span>

              <h2 className="mb-3 text-3xl font-bold text-[#142D4E]">
                Welcome back
              </h2>

              <p className="text-sm leading-6 text-slate-500">
                Sign in with your administrator credentials to manage your
                store.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>

                <div className="relative">
                  <Mail
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    placeholder="admin@electrostore.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#087EBC] focus:ring-4 focus:ring-sky-100"
                    required
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>

                <div className="relative">
                  <LockKeyhole
                    size={19}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white py-3.5 pl-12 pr-12 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#087EBC] focus:ring-4 focus:ring-sky-100"
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                  >
                    {showPassword ? (
                      <EyeOff size={19} />
                    ) : (
                      <Eye size={19} />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#087EBC] px-5 py-3.5 font-semibold text-white shadow-md shadow-sky-900/10 transition hover:bg-[#06699D] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {loading ? (
                  <>
                    <LoaderCircle size={20} className="animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in to dashboard
                    <ArrowRight size={19} />
                  </>
                )}
              </button>
            </form>

            <div className="my-7 flex items-center gap-3">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">
                Authorized access only
              </span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-xs leading-5 text-slate-500">
                Protected area. Only approved administrator accounts can sign
                in.
              </p>
            </div>

            <div className="mt-7 text-center">
              <Link
                to="/login"
                className="text-sm font-medium text-[#087EBC] transition hover:text-[#06699D]"
              >
                Back to Admin Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
