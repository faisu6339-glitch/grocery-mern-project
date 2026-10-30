
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  LogOut,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Products", path: "/products", icon: Package },
  { label: "Orders", path: "/orders", icon: ShoppingCart },
  { label: "Customers", path: "/customers", icon: Users },
];

export default function AdminLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-100 md:flex">
      <aside className="w-full bg-[#142D4E] p-5 text-white md:min-h-screen md:w-64">
        <h1 className="mb-8 text-2xl font-bold">ElectroStore</h1>

        <nav className="space-y-2">
          {navigation.map(({ label, path, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              end={path === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                  isActive
                    ? "bg-[#087EBC] text-white"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={19} />
              {label}
            </NavLink>
          ))}
        </nav>

        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-slate-300 hover:bg-white/10 hover:text-white"
        >
          <LogOut size={19} />
          Logout
        </button>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="border-b bg-white px-6 py-5">
          <h2 className="text-lg font-semibold text-[#142D4E]">
            Admin Panel
          </h2>
        </header>

        <main className="p-5 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
