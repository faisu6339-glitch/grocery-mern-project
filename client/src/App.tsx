
import { Toaster } from "react-hot-toast";
import { Routes, Route } from "react-router-dom";

import { CartProvider } from "./Context/CartContext";

import ProtectedRoute from "./Components/ProtectedRoute";

import Login from "./Pages/Login";
import Home from "./Pages/Home";
import Product from "./Pages/Product";
import ProductPage from "./Pages/ProductPage";
import SearchResult from "./Pages/SearchResult";
import FlashDeal from "./Pages/FlashDeal";
import Cart from "./Pages/Cart";
import Checkout from "./Pages/CheckOut";
import MyOrders from "./Pages/MyOrders";
import OrderTracking from "./Pages/OrderTracking";
import Addresses from "./Pages/Addresses";
import ContactUs from "./Pages/ContactUs";
import AboutUs from "./Pages/AboutUs";

import Applayout from "./Pages/Applayout";

const App = () => {
  return (
    <CartProvider>
      <Toaster position="top-right" />

      <Routes>
        {/* Login */}
        <Route path="/login" element={<Login />} />

        {/* Public pages */}
        <Route path="/" element={<Applayout />}>
          <Route index element={<Home />} />

          <Route path="product" element={<Product />} />
          <Route path="products" element={<Product />} />
          <Route path="products/:id" element={<ProductPage />} />
          <Route path="search" element={<SearchResult />} />
          <Route path="deals" element={<FlashDeal />} />

          <Route path="about" element={<AboutUs />} />
          <Route path="contact" element={<ContactUs />} />

          {/* Protected customer pages */}
          <Route element={<ProtectedRoute />}>
            <Route path="cart" element={<Cart />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="orders" element={<MyOrders />} />
            <Route path="orders/:id" element={<OrderTracking />} />
            <Route path="addresses" element={<Addresses />} />
          </Route>
        </Route>
      </Routes>
    </CartProvider>
  );
};

export default App;
