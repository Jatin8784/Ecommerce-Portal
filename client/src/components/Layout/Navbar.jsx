import { Menu, User, ShoppingCart, Sun, Moon, Search } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";
import { useDispatch, useSelector } from "react-redux";
import {
  toggleAuthPopup,
  toggleCart,
  toggleSearchBar,
  toggleSidebar,
} from "../../store/slices/popupSlice.js";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();

  const dispatch = useDispatch();

  const { cart } = useSelector((state) => state.cart);
  let cartItemsCount = 0;
  if (cart) {
    cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);
  }

  return (
    <>
      <nav className="fixed left-0 w-full top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Left HamBurger Menu  */}
            <div className="flex-1 flex justify-start">
              <button
                onClick={() => dispatch(toggleSidebar())}
                className="p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Menu className="w-6 h-6 text-foreground" />
              </button>
            </div>

            {/* Center Logo */}
            <div className="flex flex-shrink-0 justify-center">
              <h1 className="text-2xl font-bold text-primary">E-Kart</h1>
            </div>

            {/* Right Side Icons */}
            <div className="flex-1 flex items-center justify-end space-x-1 sm:space-x-2">
              {/* Theme Toggle */}
              <button
                onClick={(e) => toggleTheme(e)}
                className="p-1 sm:p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                ) : (
                  <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                )}
              </button>

              {/* Search Overlay */}
              <button
                onClick={() => dispatch(toggleSearchBar())}
                className="p-1 sm:p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </button>

              {/* User Profile */}
              <button
                onClick={() => dispatch(toggleAuthPopup())}
                className="p-1 sm:p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
              </button>

              {/* Cart */}
              <button
                onClick={() => dispatch(toggleCart())}
                className="relative p-1 sm:p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-foreground" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] sm:text-xs rounded-full w-4 h-4 sm:w-5 sm:h-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
