import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import type { Product } from "../Components/ProductCard";

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? (JSON.parse(savedCart) as CartItem[]) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product: Product) => {
    if ((product.stock ?? 0) <= 0) return;

    setCartItems((current) => {
      const existing = current.find(
        (item) => item.product._id === product._id
      );

      if (existing) {
        if (existing.quantity >= (product.stock ?? 0)) return current;

        return current.map((item) =>
          item.product._id === product._id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }

      return [...current, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems((current) =>
      current.filter((item) => item.product._id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return;

    setCartItems((current) =>
      current.map((item) =>
        item.product._id === productId
          ? {
              ...item,
              quantity: Math.min(quantity, item.product.stock ?? 0),
            }
          : item
      ).filter((item) => item.quantity > 0)
    );
  };

  const clearCart = () => setCartItems([]);

  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
};