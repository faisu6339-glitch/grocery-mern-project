import { Outlet } from "react-router-dom";
import Banner from "../Components/Banner";
import Navbar from "../Components/Navbar";

const Applayout = () => {
  return (
    <div className="flex min-h-screen flex-col bg-[#FAF7F2] text-[#1B3022]">
      <Banner />
      <Navbar />

      <main className="flex-1">
        <Outlet />
      </main>

      <footer className="bg-[#1B3022] p-6 text-center text-white">
        © 2026 ElectroStore. All rights reserved.
      </footer>
    </div>
  );
};

export default Applayout;