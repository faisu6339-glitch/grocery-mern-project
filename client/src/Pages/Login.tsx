
import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  Mail,
  LockKeyhole,
  User,
  ArrowRight,
  Zap,
} from "lucide-react";
import toast from "react-hot-toast";
import applianceImage from "../assets/appliances.jpg";

const API_URL = "http://localhost:5000/api/auth";

interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    _id: string;
    customerId: string;
    name: string;
    email: string;
    phone?: string;
    role: "customer";
  };
}

const Login = () => {
  const [isLoginState, setIsLoginState] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);

    try {
      const endpoint = isLoginState ? "login" : "register";

      const payload = isLoginState
        ? { email: email.trim(), password }
        : { name: name.trim(), email: email.trim(), password };

      const response = await fetch(`${API_URL}/${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data: AuthResponse = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Authentication failed.");
      }

      if (!data.token || !data.user) {
        throw new Error("The server did not return a token or customer profile.");
      }

      // Save the login session in this browser.
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      toast.success(
        isLoginState
          ? "Login successful!"
          : `Account created! Your Customer ID is ${data.user.customerId}`
      );

      navigate("/");
    } catch (error) {
      console.error("Authentication error:", error);

      if (error instanceof TypeError) {
        toast.error(
          "Cannot connect to the server. Check that the backend is running."
        );
      } else {
        toast.error(
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left side */}
      <div className="flex w-full lg:w-1/2 min-h-[45vh] lg:min-h-screen bg-app-green relative items-center justify-center overflow-hidden">
        <img
          src={applianceImage}
          alt="Electrical appliances"
          className="absolute inset-0 object-cover w-full h-full"
        />

        <div className="absolute inset-0 bg-black/50" />

        <div className="relative z-10 text-white px-6 py-10 lg:px-12 text-center lg:text-left">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            Upgrade Your Home with Smart Appliances
          </h1>

          <p className="text-base md:text-lg text-gray-200 leading-relaxed max-w-lg">
            Discover quality electrical appliances designed to make your
            everyday life easier, smarter, and more comfortable. Find the
            perfect products for your home, all in one place.
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gray-50 px-6 py-12 sm:px-10 lg:px-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center justify-center gap-2 mb-8">
            <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-green-600 text-white">
              <Zap size={28} fill="currentColor" />
            </div>

            <span className="text-3xl font-bold text-gray-900">
              Electro<span className="text-green-600">Store</span>
            </span>
          </Link>

          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              {isLoginState ? "Welcome Back!" : "Create an Account"}
            </h2>

            <p className="text-gray-500 mt-2">
              {isLoginState
                ? "Login to continue shopping with us."
                : "Sign up to discover our latest appliances."}
            </p>
          </div>

          {/* Login / Register toggle */}
          <div className="flex rounded-xl bg-gray-200 p-1 mb-6">
            <button
              type="button"
              onClick={() => setIsLoginState(true)}
              className={`w-1/2 py-3 rounded-lg font-semibold transition ${
                isLoginState
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Login
            </button>

            <button
              type="button"
              onClick={() => setIsLoginState(false)}
              className={`w-1/2 py-3 rounded-lg font-semibold transition ${
                !isLoginState
                  ? "bg-white text-green-700 shadow-sm"
                  : "text-gray-600"
              }`}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLoginState && (
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Full Name
                </label>

                <div className="relative">
                  <User
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />

                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    required={!isLoginState}
                    autoComplete="name"
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email Address
              </label>

              <div className="relative">
                <Mail
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>

              <div className="relative">
                <LockKeyhole
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  autoComplete={
                    isLoginState ? "current-password" : "new-password"
                  }
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-xl outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isLoginState && (
              <div className="flex justify-end">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-green-700 hover:text-green-800"
                >
                  Forgot Password?
                </Link>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? "Please wait..."
                : isLoginState
                  ? "Login"
                  : "Create Account"}

              {!loading && <ArrowRight size={20} />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-8">
            {isLoginState
              ? "Don't have an account?"
              : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setIsLoginState(!isLoginState)}
              className="font-semibold text-green-700 hover:text-green-800"
            >
              {isLoginState ? "Register" : "Login"}
            </button>
          </p>

          <p className="text-center text-xs text-gray-400 mt-6">
            © {new Date().getFullYear()} ElectroStore. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
