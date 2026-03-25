import { X, Plus, Minus, Trash2, ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { toggleCart, toggleSidebar } from "../../store/slices/popupSlice.js";
import {
  removeFromCart,
  updateCartQuantity,
} from "../../store/slices/cartSlice.js";

const CartSidebar = () => {
  const dispatch = useDispatch();
  const { isCartOpen } = useSelector((state) => state.popup);
  const { cart } = useSelector((state) => state.cart);

  const updateQuantity = (id, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(id));
    } else {
      dispatch(updateCartQuantity({ id, quantity }));
    }
  };

  let total = 0;
  if (cart && cart.length > 0) {
    total = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0,
    );
  }

  if (!isCartOpen) {
    return null;
  }

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-opacity"
        onClick={() => dispatch(toggleCart())}
      ></div>

      {/* Cart SideBar */}
      <div className="fixed right-0 top-0 h-full w-[min(450px,95vw)] z-50 glass-panel bg-background/95 animate-slide-in-right flex flex-col shadow-2xl transition-all duration-300">
        <div className="flex items-center justify-between p-6 border-b border-[hsla(var(--glass-border))]">
          <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent italic">
            Shopping Cart
          </h2>
          <button
            onClick={() => dispatch(toggleCart())}
            className="p-2 rounded-xl glass-card hover:bg-secondary/50 transition-all border border-border/50"
          >
            <X className="w-5 h-5 text-primary" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 scrollbar-hide">
          {cart && cart.length === 0 ? (
            <div className="text-center py-12 flex flex-col items-center justify-center h-full">
              <div className="w-24 h-24 bg-secondary/30 rounded-full flex items-center justify-center mb-6 animate-pulse">
                <ShoppingCart className="w-12 h-12 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground text-xl font-medium">
                Your cart is empty.
              </p>
              <Link
                to={"/products"}
                onClick={() => dispatch(toggleCart())}
                className="inline-block mt-8 px-10 py-4 bg-primary text-primary-foreground rounded-xl hover:glow-on-hover animate-smooth font-bold transition-all shadow-lg shadow-primary/30 uppercase tracking-wider"
              >
                Browse Products
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Cart Items */}
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="glass-card group p-4 sm:p-5 hover:glow-on-hover animate-smooth transition-all border border-border/40 relative overflow-hidden"
                >
                  <div className="flex gap-4 sm:gap-6">
                    {/* Product Image */}
                    <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-border/20 shadow-md">
                      <img
                        src={item.product.images[0].url}
                        alt={item.product.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>

                    {/* Product Info */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div className="space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <h3 className="font-bold text-foreground truncate text-base sm:text-lg leading-tight uppercase tracking-tight">
                            {item.product.name}
                          </h3>
                        </div>
                        <p className="text-primary font-black text-xl">
                          ${item.product.price}
                        </p>
                      </div>

                      <div className="flex items-center justify-between mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center bg-secondary/40 backdrop-blur-md rounded-xl p-1.5 border border-border/50 shadow-inner">
                          <button
                            className="p-1.5 rounded-lg hover:bg-background/80 hover:shadow-sm transition-all disabled:opacity-20 disabled:cursor-not-allowed text-foreground"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity - 1)
                            }
                            disabled={item.quantity === 1}
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-black text-base text-foreground">
                            {item.quantity}
                          </span>
                          <button
                            className="p-1.5 rounded-lg hover:bg-background/80 hover:shadow-sm transition-all text-foreground"
                            onClick={() =>
                              updateQuantity(item.product.id, item.quantity + 1)
                            }
                          >
                            <Plus size={16} />
                          </button>
                        </div>

                        {/* Remove Button */}
                        <button
                          className="p-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all border border-transparent hover:border-destructive/20"
                          onClick={() =>
                            dispatch(removeFromCart(item.product.id))
                          }
                          title="Remove item"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart && cart.length > 0 && (
          <div className="p-6 bg-background/50 backdrop-blur-md border-t border-[hsla(var(--glass-border))] mt-auto space-y-4">
            <div className="flex justify-between items-center px-2">
              <span className="text-lg text-muted-foreground uppercase tracking-wider font-medium">
                Subtotal
              </span>
              <span className="text-2xl font-bold text-primary">
                ${total.toFixed(2)}
              </span>
            </div>

            <Link
              to={"/cart"}
              onClick={() => dispatch(toggleCart())}
              className="w-full py-4 block text-center bg-primary text-primary-foreground rounded-xl hover:glow-on-hover animate-smooth font-bold text-lg transition-all shadow-xl shadow-primary/25"
            >
              Checkout Now
            </Link>

            <button
              onClick={() => dispatch(toggleCart())}
              className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;
