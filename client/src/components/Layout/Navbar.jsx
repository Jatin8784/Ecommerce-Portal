import React from "react";
import { Menu, User, ShoppingCart, Search } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleAuthPopup,
  toggleCart,
  toggleSearchBar,
  toggleSidebar,
} from "../../store/slices/popupSlice.js";

const Navbar = () => {
  const dispatch = useDispatch();

  const { cart } = useSelector((state) => state.cart);
  let cartItemsCount = 0;
  if (cart) {
    cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  }

  return (
    <nav className="fixed left-0 w-full top-0 z-50 bg-white border-b border-gray-200 h-16">
      <div className="max-w-7xl mx-auto px-4 h-full flex items-center justify-between">
        <button onClick={() => dispatch(toggleSidebar())} className="p-2">
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        <h1 className="text-xl font-bold text-blue-600">E-Kart</h1>

        <div className="flex items-center space-x-4">
          <button onClick={() => dispatch(toggleSearchBar())}>
            <Search className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={() => dispatch(toggleAuthPopup())}>
            <User className="w-5 h-5 text-gray-600" />
          </button>
          <button onClick={() => dispatch(toggleCart())} className="relative">
            <ShoppingCart className="w-5 h-5 text-gray-600" />
            {cartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                {cartItemsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
